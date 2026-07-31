import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { questionText } from '@/utils/questions'
import { gradeAnswer } from '@/models/Trainings/grading'

const SCENARIOS_DIR = path.resolve(process.cwd(), 'scenarios')

function listJsonFiles(dir) {
	const out = []
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry)
		if (statSync(full).isDirectory()) {
			out.push(...listJsonFiles(full))
		} else if (entry.endsWith('.json')) {
			out.push(full)
		}
	}
	return out
}

/** Collects every question from a scenario file, wherever `rounds` sits. */
function collectQuestions(node, acc = []) {
	if (Array.isArray(node)) {
		for (const item of node) collectQuestions(item, acc)
	} else if (node && typeof node === 'object') {
		if (Array.isArray(node.questions)) {
			for (const q of node.questions) {
				if (q && typeof q === 'object') acc.push(q)
			}
		}
		for (const value of Object.values(node)) collectQuestions(value, acc)
	}
	return acc
}

const files = listJsonFiles(SCENARIOS_DIR)

const allQuestions = files.flatMap(file => {
	const parsed = JSON.parse(readFileSync(file, 'utf-8'))
	return collectQuestions(parsed).map(q => ({ q, file: path.relative(process.cwd(), file) }))
})

describe('integridade dos cenários', () => {
	it('encontra arquivos de cenário e questões para validar', () => {
		expect(files.length).toBeGreaterThan(0)
		expect(allQuestions.length).toBeGreaterThan(0)
	})

	it('todo JSON de cenário é parseável', () => {
		for (const file of files) {
			expect(() => JSON.parse(readFileSync(file, 'utf-8'))).not.toThrow()
		}
	})

	// Regressão: 5 cenários usam a chave `question` no lugar de `text`, o que
	// deixava o enunciado em branco na interface. questionText() aceita as duas.
	it('toda questão tem enunciado legível via questionText()', () => {
		const semEnunciado = allQuestions
			.filter(({ q }) => questionText(q).trim() === '')
			.map(({ q, file }) => `${file} → ${q.id}`)

		expect(semEnunciado).toEqual([])
	})

	it('toda questão tem id e pontuação positiva', () => {
		const invalidas = allQuestions
			.filter(({ q }) => !q.id || typeof q.points !== 'number' || q.points <= 0)
			.map(({ q, file }) => `${file} → ${q.id ?? '(sem id)'}`)

		expect(invalidas).toEqual([])
	})

	it('multiple-choice tem correctAnswer dentro do intervalo das opções', () => {
		const invalidas = allQuestions
			.filter(({ q }) => (q.type || 'multiple-choice') === 'multiple-choice')
			.filter(({ q }) =>
				!Array.isArray(q.options) ||
				!Number.isInteger(q.correctAnswer) ||
				q.correctAnswer < 0 ||
				q.correctAnswer >= q.options.length
			)
			.map(({ q, file }) => `${file} → ${q.id}`)

		expect(invalidas).toEqual([])
	})

	it('true-false tem correctAnswer booleano', () => {
		const invalidas = allQuestions
			.filter(({ q }) => q.type === 'true-false')
			.filter(({ q }) => typeof q.correctAnswer !== 'boolean')
			.map(({ q, file }) => `${file} → ${q.id}`)

		expect(invalidas).toEqual([])
	})

	it('numeric tem correctAnswer numérico finito', () => {
		const invalidas = allQuestions
			.filter(({ q }) => q.type === 'numeric')
			.filter(({ q }) => typeof q.correctAnswer !== 'number' || !isFinite(q.correctAnswer))
			.map(({ q, file }) => `${file} → ${q.id}`)

		expect(invalidas).toEqual([])
	})

	it('matching referencia apenas ids existentes nas duas colunas', () => {
		const invalidas = []
		for (const { q, file } of allQuestions) {
			if (q.type !== 'matching') continue

			const left = q.leftColumn?.items || q.leftColumn || []
			const right = q.rightColumn?.items || q.rightColumn || []
			const leftIds = new Set(left.map(i => i.id))
			const rightIds = new Set(right.map(i => i.id))

			for (const m of (q.correctMatches || [])) {
				if (!leftIds.has(m.left) || !rightIds.has(m.right)) {
					invalidas.push(`${file} → ${q.id} (${m.left}→${m.right})`)
				}
			}
		}
		expect(invalidas).toEqual([])
	})

	it('ordering tem correctOrder equivalente ao conjunto de items', () => {
		const invalidas = []
		for (const { q, file } of allQuestions) {
			if (q.type !== 'ordering') continue

			const itemIds = new Set((q.items || []).map(i => i.id))
			const orderIds = new Set(q.correctOrder || [])

			if (itemIds.size !== orderIds.size || [...orderIds].some(id => !itemIds.has(id))) {
				invalidas.push(`${file} → ${q.id}`)
			}
		}
		expect(invalidas).toEqual([])
	})

	// Guarda de ponta a ponta: a resposta oficial de cada questão precisa ser
	// aceita pelo corretor com pontuação cheia. Pega tanto cenários malformados
	// quanto regressões no grading.
	it('a resposta correta de cada questão recebe pontuação máxima', () => {
		const falhas = []

		for (const { q, file } of allQuestions) {
			const type = q.type || 'multiple-choice'
			let answer

			switch (type) {
				case 'multiple-choice':
				case 'true-false':
				case 'numeric':
					answer = q.correctAnswer
					break
				case 'matching':
					answer = (q.correctMatches || []).map(m => ({ left: m.left, right: m.right }))
					break
				case 'ordering':
					answer = [...(q.correctOrder || [])]
					break
				default:
					falhas.push(`${file} → ${q.id}: tipo desconhecido "${type}"`)
					continue
			}

			const result = gradeAnswer(q, answer)
			if (!result.valid) {
				falhas.push(`${file} → ${q.id}: ${result.message}`)
			} else if (!result.is_correct || result.points_earned !== q.points) {
				falhas.push(`${file} → ${q.id}: ${result.points_earned}/${q.points}`)
			}
		}

		expect(falhas).toEqual([])
	})
})
