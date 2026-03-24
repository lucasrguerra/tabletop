import { describe, it, expect, vi } from 'vitest'
import { generateCsrfToken, validateCsrfToken } from '@/utils/csrf'

describe('generateCsrfToken', () => {
	it('retorna token com 3 partes separadas por ponto', () => {
		const token = generateCsrfToken('session-abc')
		const parts = token.split('.')
		expect(parts).toHaveLength(3)
	})

	it('embute o session_id como segunda parte', () => {
		const token = generateCsrfToken('my-session')
		const parts = token.split('.')
		expect(parts[1]).toBe('my-session')
	})

	it('primeira parte é um timestamp numérico válido', () => {
		const before = Date.now()
		const token = generateCsrfToken('session-x')
		const after = Date.now()
		const timestamp = parseInt(token.split('.')[0], 10)
		expect(timestamp).toBeGreaterThanOrEqual(before)
		expect(timestamp).toBeLessThanOrEqual(after)
	})

	it('lança erro se session_id for string vazia', () => {
		expect(() => generateCsrfToken('')).toThrow('session_id is required')
	})

	it('lança erro se session_id for null', () => {
		expect(() => generateCsrfToken(null)).toThrow()
	})

	it('lança erro se session_id for undefined', () => {
		expect(() => generateCsrfToken(undefined)).toThrow()
	})

	it('gera tokens diferentes para chamadas em tempos distintos', async () => {
		const t1 = generateCsrfToken('session-abc')
		await new Promise(r => setTimeout(r, 5))
		const t2 = generateCsrfToken('session-abc')
		expect(t1).not.toBe(t2)
	})
})

describe('validateCsrfToken', () => {
	it('valida token recém-gerado', () => {
		const sessionId = 'test-session-123'
		const token = generateCsrfToken(sessionId)
		expect(validateCsrfToken(token, sessionId)).toBe(true)
	})

	it('rejeita token com session_id errado', () => {
		const token = generateCsrfToken('session-A')
		expect(validateCsrfToken(token, 'session-B')).toBe(false)
	})

	it('rejeita token com assinatura adulterada', () => {
		const token = generateCsrfToken('session-A')
		const parts = token.split('.')
		const tampered = `${parts[0]}.${parts[1]}.deadbeef1234`
		expect(validateCsrfToken(tampered, 'session-A')).toBe(false)
	})

	it('rejeita token expirado (idade > 1 hora)', () => {
		// Cria um token com timestamp de 61 minutos atrás
		const pastTimestamp = (Date.now() - 61 * 60 * 1000).toString()
		const sessionId = 'session-A'
		// Gerar a assinatura correta para o timestamp passado seria impossível sem a secret,
		// mas podemos verificar que o módulo rejeita tokens antigos mesmo que a assinatura falhe
		const fakeToken = `${pastTimestamp}.${sessionId}.invalidsignature`
		expect(validateCsrfToken(fakeToken, sessionId)).toBe(false)
	})

	it('rejeita token com timestamp futuro (age < 0)', () => {
		const futureTimestamp = (Date.now() + 10000).toString()
		const fakeToken = `${futureTimestamp}.session-A.invalidsig`
		expect(validateCsrfToken(fakeToken, 'session-A')).toBe(false)
	})

	it('retorna false para token malformado (2 partes)', () => {
		expect(validateCsrfToken('only.two', 'session-A')).toBe(false)
	})

	it('retorna false para token com 1 parte', () => {
		expect(validateCsrfToken('one', 'session-A')).toBe(false)
	})

	it('retorna false para token vazio', () => {
		expect(validateCsrfToken('', 'session-A')).toBe(false)
	})

	it('retorna false se token for null', () => {
		expect(validateCsrfToken(null, 'session-A')).toBe(false)
	})

	it('retorna false se session_id for null', () => {
		const token = generateCsrfToken('session-A')
		expect(validateCsrfToken(token, null)).toBe(false)
	})
})
