import { describe, it, expect } from 'vitest'
import {
	gradeAnswer,
	gradeMultipleChoice,
	gradeTrueFalse,
	gradeNumeric,
	gradeMatching,
	gradeOrdering,
} from '@/models/Trainings/grading'

// ─── multiple-choice ──────────────────────────────────────────────────────────

describe('gradeAnswer — multiple-choice', () => {
	const question = {
		type: 'multiple-choice',
		options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
		correctAnswer: 2,
		points: 10,
	}

	it('retorna is_correct=true e pontos cheios para índice correto', () => {
		const result = gradeAnswer(question, 2)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
		expect(result.points_earned).toBe(10)
		expect(result.points_possible).toBe(10)
	})

	it('retorna is_correct=false e zero pontos para índice errado', () => {
		const result = gradeAnswer(question, 0)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(0)
	})

	it('rejeita número não-inteiro', () => {
		expect(gradeAnswer(question, 1.5).valid).toBe(false)
	})

	it('rejeita índice fora do intervalo (acima)', () => {
		expect(gradeAnswer(question, 10).valid).toBe(false)
	})

	it('rejeita índice negativo', () => {
		expect(gradeAnswer(question, -1).valid).toBe(false)
	})

	it('rejeita resposta do tipo string', () => {
		expect(gradeAnswer(question, 'A').valid).toBe(false)
	})

	it('rejeita resposta boolean', () => {
		expect(gradeAnswer(question, true).valid).toBe(false)
	})

	it('aceita índice 0 como resposta válida', () => {
		const q = { ...question, correctAnswer: 0 }
		const result = gradeAnswer(q, 0)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
	})
})

// ─── true-false ───────────────────────────────────────────────────────────────

describe('gradeAnswer — true-false', () => {
	const question = { type: 'true-false', correctAnswer: true, points: 5 }

	it('retorna is_correct=true para resposta correta (true)', () => {
		const result = gradeAnswer(question, true)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
		expect(result.points_earned).toBe(5)
	})

	it('retorna is_correct=false para resposta errada (false)', () => {
		const result = gradeAnswer(question, false)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(0)
	})

	it('funciona quando correctAnswer é false', () => {
		const q = { type: 'true-false', correctAnswer: false, points: 5 }
		expect(gradeAnswer(q, false).is_correct).toBe(true)
		expect(gradeAnswer(q, true).is_correct).toBe(false)
	})

	it('rejeita resposta numérica', () => {
		expect(gradeAnswer(question, 1).valid).toBe(false)
	})

	it('rejeita resposta string', () => {
		expect(gradeAnswer(question, 'true').valid).toBe(false)
	})

	it('rejeita null', () => {
		expect(gradeAnswer(question, null).valid).toBe(false)
	})
})

// ─── numeric ──────────────────────────────────────────────────────────────────

describe('gradeAnswer — numeric', () => {
	const question = { type: 'numeric', correctAnswer: 100, tolerance: 5, points: 20 }

	it('aceita resposta exatamente correta', () => {
		const result = gradeAnswer(question, 100)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
		expect(result.points_earned).toBe(20)
	})

	it('aceita resposta no limite inferior da tolerância', () => {
		expect(gradeAnswer(question, 95).is_correct).toBe(true)
	})

	it('aceita resposta no limite superior da tolerância', () => {
		expect(gradeAnswer(question, 105).is_correct).toBe(true)
	})

	it('rejeita resposta fora da tolerância (abaixo)', () => {
		const result = gradeAnswer(question, 94)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(0)
	})

	it('rejeita resposta fora da tolerância (acima)', () => {
		expect(gradeAnswer(question, 106).is_correct).toBe(false)
	})

	it('usa tolerância zero quando não especificada', () => {
		const q = { type: 'numeric', correctAnswer: 42, points: 5 }
		expect(gradeAnswer(q, 42).is_correct).toBe(true)
		expect(gradeAnswer(q, 43).is_correct).toBe(false)
	})

	it('rejeita Infinity', () => {
		expect(gradeAnswer(question, Infinity).valid).toBe(false)
	})

	it('rejeita -Infinity', () => {
		expect(gradeAnswer(question, -Infinity).valid).toBe(false)
	})

	it('rejeita NaN', () => {
		expect(gradeAnswer(question, NaN).valid).toBe(false)
	})

	it('rejeita string numérica', () => {
		expect(gradeAnswer(question, '100').valid).toBe(false)
	})

	it('aceita números negativos', () => {
		const q = { type: 'numeric', correctAnswer: -10, tolerance: 2, points: 5 }
		expect(gradeAnswer(q, -10).is_correct).toBe(true)
		expect(gradeAnswer(q, -8).is_correct).toBe(true)
		expect(gradeAnswer(q, -7).is_correct).toBe(false)
	})
})

// ─── matching ─────────────────────────────────────────────────────────────────

describe('gradeAnswer — matching (sem crédito parcial)', () => {
	const question = {
		type: 'matching',
		correctMatches: [
			{ left: 'A', right: '1' },
			{ left: 'B', right: '2' },
			{ left: 'C', right: '3' },
		],
		partialCredit: false,
		points: 30,
	}

	it('pontuação cheia para todas correspondências corretas', () => {
		const answer = [{ left: 'A', right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '3' }]
		const result = gradeAnswer(question, answer)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
		expect(result.points_earned).toBe(30)
	})

	it('zero pontos para correspondências parcialmente corretas (sem crédito parcial)', () => {
		const answer = [{ left: 'A', right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '1' }]
		const result = gradeAnswer(question, answer)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(0)
	})

	it('rejeita array com número errado de pares', () => {
		expect(gradeAnswer(question, [{ left: 'A', right: '1' }]).valid).toBe(false)
	})

	it('rejeita par sem campo left', () => {
		const bad = [{ right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '3' }]
		expect(gradeAnswer(question, bad).valid).toBe(false)
	})

	it('rejeita par com left não-string', () => {
		const bad = [{ left: 1, right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '3' }]
		expect(gradeAnswer(question, bad).valid).toBe(false)
	})

	it('rejeita resposta não-array', () => {
		expect(gradeAnswer(question, { left: 'A', right: '1' }).valid).toBe(false)
	})
})

describe('gradeAnswer — matching (com crédito parcial)', () => {
	const question = {
		type: 'matching',
		correctMatches: [
			{ left: 'A', right: '1' },
			{ left: 'B', right: '2' },
			{ left: 'C', right: '3' },
		],
		partialCredit: true,
		points: 30,
	}

	it('pontuação cheia para todas corretas', () => {
		const answer = [{ left: 'A', right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '3' }]
		expect(gradeAnswer(question, answer).points_earned).toBe(30)
	})

	it('pontuação parcial para 2 de 3 corretas', () => {
		const answer = [{ left: 'A', right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '1' }]
		const result = gradeAnswer(question, answer)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(20) // 2/3 * 30
	})

	it('zero pontos para nenhuma correta', () => {
		const answer = [{ left: 'A', right: '3' }, { left: 'B', right: '1' }, { left: 'C', right: '2' }]
		expect(gradeAnswer(question, answer).points_earned).toBe(0)
	})

	it('pontuação parcial para 1 de 3 corretas', () => {
		const answer = [{ left: 'A', right: '1' }, { left: 'B', right: '3' }, { left: 'C', right: '2' }]
		expect(gradeAnswer(question, answer).points_earned).toBe(10) // 1/3 * 30
	})
})

// ─── ordering ─────────────────────────────────────────────────────────────────

describe('gradeAnswer — ordering (sem crédito parcial)', () => {
	const question = {
		type: 'ordering',
		correctOrder: ['step1', 'step2', 'step3', 'step4'],
		partialCredit: false,
		points: 40,
	}

	it('pontuação cheia para ordem perfeita', () => {
		const result = gradeAnswer(question, ['step1', 'step2', 'step3', 'step4'])
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
		expect(result.points_earned).toBe(40)
	})

	it('zero pontos para ordem parcialmente correta (sem crédito parcial)', () => {
		const result = gradeAnswer(question, ['step1', 'step3', 'step2', 'step4'])
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(0)
	})

	it('rejeita itens errados (não presentes no correctOrder)', () => {
		expect(gradeAnswer(question, ['step1', 'step2', 'step3', 'wrong']).valid).toBe(false)
	})

	it('rejeita contagem errada de itens', () => {
		expect(gradeAnswer(question, ['step1', 'step2', 'step3']).valid).toBe(false)
	})

	it('rejeita item não-string', () => {
		expect(gradeAnswer(question, ['step1', 'step2', 'step3', 4]).valid).toBe(false)
	})

	it('rejeita resposta não-array', () => {
		expect(gradeAnswer(question, 'step1').valid).toBe(false)
	})

	it('rejeita itens duplicados (conjunto diferente do esperado)', () => {
		expect(gradeAnswer(question, ['step1', 'step1', 'step3', 'step4']).valid).toBe(false)
	})
})

describe('gradeAnswer — ordering (com crédito parcial)', () => {
	const question = {
		type: 'ordering',
		correctOrder: ['step1', 'step2', 'step3', 'step4'],
		partialCredit: true,
		points: 40,
	}

	it('pontuação cheia para ordem perfeita', () => {
		expect(gradeAnswer(question, ['step1', 'step2', 'step3', 'step4']).points_earned).toBe(40)
	})

	it('crédito parcial para 2 de 4 posições corretas', () => {
		// step1 correto (pos 0), step4 correto (pos 3)
		const result = gradeAnswer(question, ['step1', 'step3', 'step2', 'step4'])
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(false)
		expect(result.points_earned).toBe(20) // 2/4 * 40
	})

	it('zero pontos para nenhuma posição correta', () => {
		const result = gradeAnswer(question, ['step4', 'step3', 'step2', 'step1'])
		expect(result.points_earned).toBe(0)
	})

	it('crédito parcial para 1 de 4 posições corretas', () => {
		// ['step1', 'step3', 'step4', 'step2'] → só step1 na posição correta (pos 0)
		const result = gradeAnswer(question, ['step1', 'step3', 'step4', 'step2'])
		expect(result.points_earned).toBe(10) // 1/4 * 40
	})
})

// ─── tipo desconhecido ────────────────────────────────────────────────────────

describe('gradeAnswer — tipo desconhecido', () => {
	it('retorna valid=false para tipo desconhecido', () => {
		const q = { type: 'essay', points: 10 }
		const result = gradeAnswer(q, 'algum texto')
		expect(result.valid).toBe(false)
		expect(result.message).toContain('desconhecido')
	})

	it('usa multiple-choice como padrão quando type está ausente', () => {
		const q = { options: ['A', 'B'], correctAnswer: 0, points: 5 }
		const result = gradeAnswer(q, 0)
		expect(result.valid).toBe(true)
		expect(result.is_correct).toBe(true)
	})

	it('retorna zero pontos quando question.points não está definido', () => {
		const q = { type: 'true-false', correctAnswer: true }
		const result = gradeAnswer(q, true)
		expect(result.valid).toBe(true)
		expect(result.points_possible).toBe(0)
		expect(result.points_earned).toBe(0)
	})
})
