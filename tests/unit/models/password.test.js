import { describe, it, expect } from 'vitest'
import { isComplex } from '@/models/Password'

describe('isComplex', () => {
	it('aceita senha que atende todos os critérios', () => {
		expect(isComplex('Password1!')).toBe(true)
	})

	it('aceita senha complexa longa', () => {
		expect(isComplex('MySecure@Pass123')).toBe(true)
	})

	it('rejeita senha sem caractere especial', () => {
		expect(isComplex('Password1')).toBe(false)
	})

	it('rejeita senha sem número', () => {
		expect(isComplex('Password!')).toBe(false)
	})

	it('rejeita senha sem letra maiúscula', () => {
		expect(isComplex('password1!')).toBe(false)
	})

	it('rejeita senha sem letra minúscula', () => {
		expect(isComplex('PASSWORD1!')).toBe(false)
	})

	it('rejeita senha com menos de 8 caracteres', () => {
		expect(isComplex('Pa1!')).toBe(false)
	})

	it('aceita senha com exatamente 8 caracteres', () => {
		expect(isComplex('Pass1!ab')).toBe(true)
	})

	it('rejeita senha com mais de 128 caracteres', () => {
		const longPass = 'Aa1!' + 'x'.repeat(125)
		expect(isComplex(longPass)).toBe(false)
	})

	it('aceita senha com exatamente 128 caracteres', () => {
		const maxPass = 'Aa1!' + 'x'.repeat(124)
		expect(isComplex(maxPass)).toBe(true)
	})

	it('rejeita string vazia', () => {
		expect(isComplex('')).toBe(false)
	})
})
