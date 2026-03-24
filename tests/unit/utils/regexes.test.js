import { describe, it, expect } from 'vitest'
import { isValidEmail, nickname_regex, email_regex } from '@/utils/regexes'

describe('isValidEmail', () => {
	it('aceita email simples válido', () => {
		expect(isValidEmail('test@example.com')).toBe(true)
	})

	it('aceita email com subdomínio', () => {
		expect(isValidEmail('user@mail.example.com')).toBe(true)
	})

	it('aceita email com ponto na parte local', () => {
		expect(isValidEmail('first.last@example.com')).toBe(true)
	})

	it('rejeita email sem @', () => {
		expect(isValidEmail('notanemail')).toBe(false)
	})

	it('rejeita email sem domínio', () => {
		expect(isValidEmail('user@')).toBe(false)
	})

	it('rejeita email sem ponto no domínio', () => {
		expect(isValidEmail('user@domain')).toBe(false)
	})

	it('rejeita email com dois @', () => {
		expect(isValidEmail('user@@domain.com')).toBe(false)
	})

	it('rejeita email com pontos consecutivos', () => {
		expect(isValidEmail('user..name@domain.com')).toBe(false)
	})

	it('rejeita email com mais de 254 caracteres', () => {
		const longEmail = 'a'.repeat(250) + '@b.com'
		expect(isValidEmail(longEmail)).toBe(false)
	})

	it('rejeita string vazia', () => {
		expect(isValidEmail('')).toBe(false)
	})

	it('rejeita null e undefined', () => {
		expect(isValidEmail(null)).toBe(false)
		expect(isValidEmail(undefined)).toBe(false)
	})

	it('rejeita parte local com mais de 64 caracteres', () => {
		const longLocal = 'a'.repeat(65) + '@domain.com'
		expect(isValidEmail(longLocal)).toBe(false)
	})
})

describe('nickname_regex', () => {
	it('aceita nickname alfanumérico', () => {
		expect(nickname_regex.test('user123')).toBe(true)
	})

	it('aceita nickname com ponto e underscore', () => {
		expect(nickname_regex.test('my.nick_ok')).toBe(true)
	})

	it('rejeita nickname com espaço', () => {
		expect(nickname_regex.test('my nick')).toBe(false)
	})

	it('rejeita nickname com hífen', () => {
		expect(nickname_regex.test('my-nick')).toBe(false)
	})

	it('rejeita nickname com menos de 3 caracteres', () => {
		expect(nickname_regex.test('ab')).toBe(false)
	})

	it('rejeita nickname com mais de 30 caracteres', () => {
		expect(nickname_regex.test('a'.repeat(31))).toBe(false)
	})
})
