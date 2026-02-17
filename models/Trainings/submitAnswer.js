import Response from '@/database/schemas/Response';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import readScenario from '@/models/Trainings/readScenario';

/**
 * Validates a user's answer against the correct answer from the scenario file.
 * All validation is done server-side — the client never receives correct answers.
 *
 * @param {Object} params
 * @param {string} params.training_id - Training MongoDB ID
 * @param {string} params.user_id - User MongoDB ID
 * @param {number} params.round_id - Round index (0-based)
 * @param {string} params.question_id - Question ID (e.g., "q1")
 * @param {*} params.answer - The user's submitted answer
 * @returns {Promise<Object>} Result with is_correct, points_earned, points_possible
 */
export async function submitAnswer({ training_id, user_id, round_id, question_id, answer }) {
	try {
		await connectDatabase();

		// 1. Get the training to check status and access
		const training = await Training.findById(training_id).lean();
		if (!training) {
			return { success: false, message: 'Treinamento não encontrado', statusCode: 404 };
		}

		// 2. Verify the training is active (not paused, not completed, not not_started)
		if (training.status !== 'active') {
			return {
				success: false,
				message: 'O treinamento precisa estar ativo para enviar respostas.',
				statusCode: 400
			};
		}

		// 3. Verify user is an accepted participant (not facilitator)
		const participant = training.participants.find(
			p => p.user_id.toString() === user_id && p.status === 'accepted'
		);
		if (!participant) {
			return { success: false, message: 'Você não tem acesso a este treinamento', statusCode: 403 };
		}
		if (participant.role === 'facilitator') {
			return { success: false, message: 'Facilitadores não podem enviar respostas', statusCode: 403 };
		}
		if (participant.role === 'observer') {
			return { success: false, message: 'Observadores não podem enviar respostas', statusCode: 403 };
		}

		// 4. Verify the round is accessible (round_id <= current_round)
		const currentRound = training.current_round ?? 0;
		if (typeof round_id !== 'number' || round_id < 0 || round_id > currentRound) {
			return {
				success: false,
				message: 'Rodada inválida ou ainda não acessível',
				statusCode: 400
			};
		}

		// 5. Check if user already answered this question
		const existing = await Response.findOne({
			training_id,
			user_id,
			round_id,
			question_id,
		}).lean();

		if (existing) {
			return {
				success: false,
				message: 'Você já respondeu esta questão',
				statusCode: 409
			};
		}

		// 6. Read the scenario to get the correct answer (server-side only)
		const scenarioResult = await readScenario(
			training.scenario.id,
			training.scenario.category,
			training.scenario.type
		);

		if (!scenarioResult.success) {
			return { success: false, message: 'Erro ao carregar dados do cenário', statusCode: 500 };
		}

		const scenario = scenarioResult.scenario;
		const rounds = scenario.rounds || [];

		if (round_id >= rounds.length) {
			return { success: false, message: 'Rodada não encontrada no cenário', statusCode: 400 };
		}

		const round = rounds[round_id];
		const questions = round.questions || [];
		const question = questions.find(q => q.id === question_id);

		if (!question) {
			return { success: false, message: 'Questão não encontrada nesta rodada', statusCode: 400 };
		}

		// 7. Validate and grade the answer
		const gradeResult = gradeAnswer(question, answer);

		if (!gradeResult.valid) {
			return { success: false, message: gradeResult.message, statusCode: 400 };
		}

		// 8. Store the response in the database
		const response = await Response.create({
			training_id,
			user_id,
			round_id,
			question_id,
			answer,
			question_type: question.type || 'multiple-choice',
			is_correct: gradeResult.is_correct,
			points_earned: gradeResult.points_earned,
			points_possible: gradeResult.points_possible,
		});

		return {
			success: true,
			response: {
				id: response._id,
				question_id: response.question_id,
				round_id: response.round_id,
				is_correct: response.is_correct,
				points_earned: response.points_earned,
				points_possible: response.points_possible,
				submitted_at: response.submitted_at,
				justification: question.justification || null,
			}
		};

	} catch (error) {
		// Handle duplicate key error (race condition on unique index)
		if (error.code === 11000) {
			return { success: false, message: 'Você já respondeu esta questão', statusCode: 409 };
		}
		console.error('Error in submitAnswer:', error);
		return { success: false, message: 'Erro ao enviar resposta', statusCode: 500 };
	}
}

/**
 * Grades a user's answer against the correct answer.
 * Handles all question types: multiple-choice, true-false, numeric, matching, ordering.
 *
 * @param {Object} question - The full question object (with correctAnswer)
 * @param {*} answer - The user's answer
 * @returns {Object} { valid, is_correct, points_earned, points_possible, message? }
 */
function gradeAnswer(question, answer) {
	const type = question.type || 'multiple-choice';
	const points_possible = question.points || 0;

	switch (type) {
		case 'multiple-choice':
			return gradeMultipleChoice(question, answer, points_possible);
		case 'true-false':
			return gradeTrueFalse(question, answer, points_possible);
		case 'numeric':
			return gradeNumeric(question, answer, points_possible);
		case 'matching':
			return gradeMatching(question, answer, points_possible);
		case 'ordering':
			return gradeOrdering(question, answer, points_possible);
		default:
			return { valid: false, message: `Tipo de questão desconhecido: ${type}` };
	}
}

/**
 * multiple-choice: answer is a number (0-based option index)
 */
function gradeMultipleChoice(question, answer, points_possible) {
	if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0) {
		return { valid: false, message: 'Resposta deve ser o índice da opção (número inteiro >= 0)' };
	}

	if (!question.options || answer >= question.options.length) {
		return { valid: false, message: 'Índice de opção fora do intervalo' };
	}

	const is_correct = answer === question.correctAnswer;
	return {
		valid: true,
		is_correct,
		points_earned: is_correct ? points_possible : 0,
		points_possible,
	};
}

/**
 * true-false: answer is a boolean
 */
function gradeTrueFalse(question, answer, points_possible) {
	if (typeof answer !== 'boolean') {
		return { valid: false, message: 'Resposta deve ser verdadeiro (true) ou falso (false)' };
	}

	const is_correct = answer === question.correctAnswer;
	return {
		valid: true,
		is_correct,
		points_earned: is_correct ? points_possible : 0,
		points_possible,
	};
}

/**
 * numeric: answer is a number, validated with tolerance
 */
function gradeNumeric(question, answer, points_possible) {
	if (typeof answer !== 'number' || !isFinite(answer)) {
		return { valid: false, message: 'Resposta deve ser um número válido' };
	}

	const tolerance = question.tolerance || 0;
	const diff = Math.abs(answer - question.correctAnswer);
	const is_correct = diff <= tolerance;

	return {
		valid: true,
		is_correct,
		points_earned: is_correct ? points_possible : 0,
		points_possible,
	};
}

/**
 * matching: answer is an array of { left, right } pairs
 * Supports partial credit if question.partialCredit is true
 */
function gradeMatching(question, answer, points_possible) {
	if (!Array.isArray(answer)) {
		return { valid: false, message: 'Resposta deve ser um array de correspondências [{ left, right }]' };
	}

	const correctMatches = question.correctMatches || [];
	if (answer.length !== correctMatches.length) {
		return {
			valid: false,
			message: `Número de correspondências incorreto. Esperado: ${correctMatches.length}`
		};
	}

	// Validate each pair has left and right
	for (const pair of answer) {
		if (!pair || typeof pair.left !== 'string' || typeof pair.right !== 'string') {
			return { valid: false, message: 'Cada correspondência deve ter "left" e "right" (strings)' };
		}
	}

	// Count correct matches
	let correctCount = 0;
	for (const correct of correctMatches) {
		const found = answer.some(a => a.left === correct.left && a.right === correct.right);
		if (found) correctCount++;
	}

	const allCorrect = correctCount === correctMatches.length;

	if (question.partialCredit) {
		const pointsPerMatch = question.pointsPerMatch || (points_possible / correctMatches.length);
		const earned = Math.round(correctCount * pointsPerMatch * 100) / 100;
		return {
			valid: true,
			is_correct: allCorrect,
			points_earned: Math.min(earned, points_possible),
			points_possible,
		};
	}

	return {
		valid: true,
		is_correct: allCorrect,
		points_earned: allCorrect ? points_possible : 0,
		points_possible,
	};
}

/**
 * ordering: answer is an array of item IDs in the user's submitted order
 * Supports partial credit if question.partialCredit is true
 */
function gradeOrdering(question, answer, points_possible) {
	if (!Array.isArray(answer)) {
		return { valid: false, message: 'Resposta deve ser um array de IDs na ordem escolhida' };
	}

	const correctOrder = question.correctOrder || [];
	if (answer.length !== correctOrder.length) {
		return {
			valid: false,
			message: `Número de itens incorreto. Esperado: ${correctOrder.length}`
		};
	}

	// Validate all items are strings
	for (const item of answer) {
		if (typeof item !== 'string') {
			return { valid: false, message: 'Cada item deve ser uma string (ID do item)' };
		}
	}

	// Validate all expected items are present
	const answerSet = new Set(answer);
	const correctSet = new Set(correctOrder);
	if (answerSet.size !== correctSet.size || ![...answerSet].every(id => correctSet.has(id))) {
		return { valid: false, message: 'Os itens fornecidos não correspondem aos itens esperados' };
	}

	// Count items in correct position
	let correctPositions = 0;
	for (let i = 0; i < correctOrder.length; i++) {
		if (answer[i] === correctOrder[i]) correctPositions++;
	}

	const allCorrect = correctPositions === correctOrder.length;

	if (question.partialCredit) {
		const pointsPerPosition = points_possible / correctOrder.length;
		const earned = Math.round(correctPositions * pointsPerPosition * 100) / 100;
		return {
			valid: true,
			is_correct: allCorrect,
			points_earned: Math.min(earned, points_possible),
			points_possible,
		};
	}

	return {
		valid: true,
		is_correct: allCorrect,
		points_earned: allCorrect ? points_possible : 0,
		points_possible,
	};
}
