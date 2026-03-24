/**
 * Funções de correção de respostas para todos os tipos de questão.
 * Exportadas separadamente para permitir testes unitários isolados.
 *
 * Tipos suportados: multiple-choice, true-false, numeric, matching, ordering
 */

/**
 * Dispatcher principal — encaminha para a função correta conforme o tipo da questão.
 *
 * @param {Object} question - Objeto completo da questão (com correctAnswer)
 * @param {*} answer - Resposta enviada pelo usuário
 * @returns {{ valid: boolean, is_correct?: boolean, points_earned?: number, points_possible?: number, message?: string }}
 */
export function gradeAnswer(question, answer) {
	const type = question.type || 'multiple-choice'
	const points_possible = question.points || 0

	switch (type) {
		case 'multiple-choice':
			return gradeMultipleChoice(question, answer, points_possible)
		case 'true-false':
			return gradeTrueFalse(question, answer, points_possible)
		case 'numeric':
			return gradeNumeric(question, answer, points_possible)
		case 'matching':
			return gradeMatching(question, answer, points_possible)
		case 'ordering':
			return gradeOrdering(question, answer, points_possible)
		default:
			return { valid: false, message: `Tipo de questão desconhecido: ${type}` }
	}
}

/**
 * multiple-choice: resposta é um número inteiro (índice da opção, base 0)
 */
export function gradeMultipleChoice(question, answer, points_possible) {
	if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0) {
		return { valid: false, message: 'Resposta deve ser o índice da opção (número inteiro >= 0)' }
	}

	if (!question.options || answer >= question.options.length) {
		return { valid: false, message: 'Índice de opção fora do intervalo' }
	}

	const is_correct = answer === question.correctAnswer
	return {
		valid: true,
		is_correct,
		points_earned: is_correct ? points_possible : 0,
		points_possible,
	}
}

/**
 * true-false: resposta é um booleano
 */
export function gradeTrueFalse(question, answer, points_possible) {
	if (typeof answer !== 'boolean') {
		return { valid: false, message: 'Resposta deve ser verdadeiro (true) ou falso (false)' }
	}

	const is_correct = answer === question.correctAnswer
	return {
		valid: true,
		is_correct,
		points_earned: is_correct ? points_possible : 0,
		points_possible,
	}
}

/**
 * numeric: resposta é um número, validado com tolerância
 */
export function gradeNumeric(question, answer, points_possible) {
	if (typeof answer !== 'number' || !isFinite(answer)) {
		return { valid: false, message: 'Resposta deve ser um número válido' }
	}

	const tolerance = question.tolerance || 0
	const diff = Math.abs(answer - question.correctAnswer)
	const is_correct = diff <= tolerance

	return {
		valid: true,
		is_correct,
		points_earned: is_correct ? points_possible : 0,
		points_possible,
	}
}

/**
 * matching: resposta é um array de { left, right }
 * Suporta crédito parcial se question.partialCredit === true
 */
export function gradeMatching(question, answer, points_possible) {
	if (!Array.isArray(answer)) {
		return { valid: false, message: 'Resposta deve ser um array de correspondências [{ left, right }]' }
	}

	const correctMatches = question.correctMatches || []
	if (answer.length !== correctMatches.length) {
		return {
			valid: false,
			message: `Número de correspondências incorreto. Esperado: ${correctMatches.length}`,
		}
	}

	for (const pair of answer) {
		if (!pair || typeof pair.left !== 'string' || typeof pair.right !== 'string') {
			return { valid: false, message: 'Cada correspondência deve ter "left" e "right" (strings)' }
		}
	}

	let correctCount = 0
	for (const correct of correctMatches) {
		const found = answer.some(a => a.left === correct.left && a.right === correct.right)
		if (found) correctCount++
	}

	const allCorrect = correctCount === correctMatches.length

	if (question.partialCredit) {
		const pointsPerMatch = question.pointsPerMatch || (points_possible / correctMatches.length)
		const earned = Math.round(correctCount * pointsPerMatch * 100) / 100
		return {
			valid: true,
			is_correct: allCorrect,
			points_earned: Math.min(earned, points_possible),
			points_possible,
		}
	}

	return {
		valid: true,
		is_correct: allCorrect,
		points_earned: allCorrect ? points_possible : 0,
		points_possible,
	}
}

/**
 * ordering: resposta é um array de IDs na ordem escolhida pelo usuário
 * Suporta crédito parcial se question.partialCredit === true
 */
export function gradeOrdering(question, answer, points_possible) {
	if (!Array.isArray(answer)) {
		return { valid: false, message: 'Resposta deve ser um array de IDs na ordem escolhida' }
	}

	const correctOrder = question.correctOrder || []
	if (answer.length !== correctOrder.length) {
		return {
			valid: false,
			message: `Número de itens incorreto. Esperado: ${correctOrder.length}`,
		}
	}

	for (const item of answer) {
		if (typeof item !== 'string') {
			return { valid: false, message: 'Cada item deve ser uma string (ID do item)' }
		}
	}

	const answerSet = new Set(answer)
	const correctSet = new Set(correctOrder)
	if (answerSet.size !== correctSet.size || ![...answerSet].every(id => correctSet.has(id))) {
		return { valid: false, message: 'Os itens fornecidos não correspondem aos itens esperados' }
	}

	let correctPositions = 0
	for (let i = 0; i < correctOrder.length; i++) {
		if (answer[i] === correctOrder[i]) correctPositions++
	}

	const allCorrect = correctPositions === correctOrder.length

	if (question.partialCredit) {
		const pointsPerPosition = points_possible / correctOrder.length
		const earned = Math.round(correctPositions * pointsPerPosition * 100) / 100
		return {
			valid: true,
			is_correct: allCorrect,
			points_earned: Math.min(earned, points_possible),
			points_possible,
		}
	}

	return {
		valid: true,
		is_correct: allCorrect,
		points_earned: allCorrect ? points_possible : 0,
		points_possible,
	}
}
