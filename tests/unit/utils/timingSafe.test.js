import { describe, it, expect } from 'vitest'
import { constantTimeCompare, constantTimeBoolean } from '@/utils/timingSafe'

describe('constantTimeCompare', () => {
	it('retorna true para strings idênticas', () => {
		expect(constantTimeCompare('abc123', 'abc123')).toBe(true)
	})

	it('retorna false para strings diferentes', () => {
		expect(constantTimeCompare('abc', 'xyz')).toBe(false)
	})

	it('retorna false para strings com comprimentos diferentes', () => {
		expect(constantTimeCompare('abc', 'abcd')).toBe(false)
	})

	it('retorna false para string vazia vs não-vazia', () => {
		expect(constantTimeCompare('', 'a')).toBe(false)
	})

	it('retorna true para strings vazias iguais', () => {
		expect(constantTimeCompare('', '')).toBe(true)
	})

	it('retorna false se primeiro argumento não for string', () => {
		expect(constantTimeCompare(null, 'abc')).toBe(false)
		expect(constantTimeCompare(123, 'abc')).toBe(false)
	})

	it('retorna false se segundo argumento não for string', () => {
		expect(constantTimeCompare('abc', null)).toBe(false)
		expect(constantTimeCompare('abc', undefined)).toBe(false)
	})

	it('é case-sensitive', () => {
		expect(constantTimeCompare('ABC', 'abc')).toBe(false)
	})
})

describe('constantTimeBoolean', () => {
	it('retorna true para condição verdadeira', () => {
		expect(constantTimeBoolean(true)).toBe(true)
	})

	it('retorna false para condição falsa', () => {
		expect(constantTimeBoolean(false)).toBe(false)
	})

	it('trata valor truthy como true', () => {
		expect(constantTimeBoolean(1)).toBe(true)
		expect(constantTimeBoolean('texto')).toBe(true)
	})

	it('trata valor falsy como false', () => {
		expect(constantTimeBoolean(0)).toBe(false)
		expect(constantTimeBoolean(null)).toBe(false)
		expect(constantTimeBoolean(undefined)).toBe(false)
	})
})
