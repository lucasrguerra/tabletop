import { describe, it, expect } from 'vitest'
import { sanitizeInput, sanitizeEmail, sanitizeNickname, sanitizeName } from '@/utils/sanitize'

describe('sanitizeInput', () => {
	it('retorna string para entrada simples', () => {
		expect(sanitizeInput('hello world')).toBe('hello world')
	})

	it('converte número para string', () => {
		expect(sanitizeInput(42)).toBe('42')
	})

	it('retorna null para null', () => {
		expect(sanitizeInput(null)).toBeNull()
	})

	it('retorna undefined para undefined', () => {
		expect(sanitizeInput(undefined)).toBeUndefined()
	})

	it('rejeita objeto (injeção NoSQL)', () => {
		expect(() => sanitizeInput({ $gt: '' })).toThrow('Formato de entrada inválido')
	})

	it('rejeita array', () => {
		expect(() => sanitizeInput(['a', 'b'])).toThrow('Formato de entrada inválido')
	})

	it('rejeita string com operador $', () => {
		expect(() => sanitizeInput('$where: 1')).toThrow('Formato de entrada inválido')
	})

	it('rejeita string com chave {', () => {
		expect(() => sanitizeInput('{malicious}')).toThrow('Formato de entrada inválido')
	})

	it('rejeita string com colchete [', () => {
		expect(() => sanitizeInput('[0]')).toThrow('Formato de entrada inválido')
	})
})

describe('sanitizeEmail', () => {
	it('normaliza para minúsculas e remove espaços', () => {
		expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com')
	})

	it('aceita email válido simples', () => {
		expect(sanitizeEmail('test@domain.com')).toBe('test@domain.com')
	})

	it('lança erro para email com mais de 254 caracteres', () => {
		const longEmail = 'a'.repeat(250) + '@b.co'
		expect(() => sanitizeEmail(longEmail)).toThrow('Email muito longo')
	})

	it('lança erro para objeto', () => {
		expect(() => sanitizeEmail({ $ne: null })).toThrow('Formato de entrada inválido')
	})
})

describe('sanitizeNickname', () => {
	it('normaliza para minúsculas e remove espaços', () => {
		expect(sanitizeNickname('  MyNick  ')).toBe('mynick')
	})

	it('aceita nickname com ponto e underscore', () => {
		expect(() => sanitizeNickname('my.nick_ok')).not.toThrow()
		expect(sanitizeNickname('my.nick_ok')).toBe('my.nick_ok')
	})

	it('lança erro para nickname com menos de 3 caracteres', () => {
		expect(() => sanitizeNickname('ab')).toThrow('entre 3 e 30')
	})

	it('lança erro para nickname com mais de 30 caracteres', () => {
		expect(() => sanitizeNickname('a'.repeat(31))).toThrow('entre 3 e 30')
	})

	it('lança erro para nickname com caracteres inválidos', () => {
		expect(() => sanitizeNickname('my nick!')).toThrow('letras, números, pontos e underscores')
	})

	it('lança erro para nickname com hífen', () => {
		expect(() => sanitizeNickname('my-nick')).toThrow()
	})
})

describe('sanitizeName', () => {
	it('aceita nome válido', () => {
		expect(sanitizeName('John Doe')).toBe('John Doe')
	})

	it('lança erro para nome com menos de 3 caracteres', () => {
		expect(() => sanitizeName('Jo')).toThrow('entre 3 e 100')
	})

	it('lança erro para nome com mais de 100 caracteres', () => {
		expect(() => sanitizeName('a'.repeat(101))).toThrow('entre 3 e 100')
	})

	it('lança erro para nome com tag HTML', () => {
		expect(() => sanitizeName('John <script>alert(1)</script>')).toThrow('caracteres inválidos')
	})

	it('lança erro para nome com operador MongoDB', () => {
		expect(() => sanitizeName('John $where')).toThrow('Formato de entrada inválido')
	})
})
