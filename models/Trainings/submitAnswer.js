import Response from '@/database/schemas/Response';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import readScenario from '@/models/Trainings/readScenario';
import { gradeAnswer } from '@/models/Trainings/grading';

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

