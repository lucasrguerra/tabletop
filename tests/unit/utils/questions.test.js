import { describe, it, expect } from 'vitest'
import { questionText } from '@/utils/questions'

describe('questionText', () => {
	it('lê o campo `text` quando presente', () => {
		expect(questionText({ text: 'Qual é o vetor de ataque?' })).toBe('Qual é o vetor de ataque?')
	})

	// Regressão: 80 questões em 5 cenários de GOV_LEGAL usam a chave `question`
	// no lugar de `text`. Lendo apenas `text`, o enunciado aparecia em branco
	// tanto para o facilitador quanto para o participante.
	it('cai para o campo `question` quando `text` não existe', () => {
		expect(questionText({ question: 'Qual é o vetor de ataque?' })).toBe('Qual é o vetor de ataque?')
	})

	it('prefere `text` quando ambos existem', () => {
		expect(questionText({ text: 'A', question: 'B' })).toBe('A')
	})

	it('retorna string vazia para questão sem enunciado', () => {
		expect(questionText({})).toBe('')
		expect(questionText({ text: '' })).toBe('')
	})

	it('retorna string vazia para entrada nula ou indefinida', () => {
		expect(questionText(null)).toBe('')
		expect(questionText(undefined)).toBe('')
	})
})
