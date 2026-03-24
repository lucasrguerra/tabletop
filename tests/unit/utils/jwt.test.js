import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken, decodeToken, hashToken, getTokenExpiry } from '@/utils/jwt'

describe('generateToken', () => {
	it('retorna um objeto com token e token_id', () => {
		const { token, token_id } = generateToken({ id: 'u1', email: 'a@b.com', nickname: 'user1' })
		expect(typeof token).toBe('string')
		expect(typeof token_id).toBe('string')
	})

	it('token_id tem 32 caracteres hex (16 bytes)', () => {
		const { token_id } = generateToken({ id: 'u1' })
		expect(token_id).toHaveLength(32)
		expect(token_id).toMatch(/^[0-9a-f]+$/)
	})

	it('embute os campos do payload no token', () => {
		const { token } = generateToken({ id: 'u1', email: 'a@b.com', nickname: 'nick1' })
		const decoded = decodeToken(token)
		expect(decoded.id).toBe('u1')
		expect(decoded.email).toBe('a@b.com')
		expect(decoded.nickname).toBe('nick1')
		expect(decoded.type).toBe('session')
	})

	it('gera token_ids únicos em chamadas consecutivas', () => {
		const { token_id: t1 } = generateToken({ id: 'u1' })
		const { token_id: t2 } = generateToken({ id: 'u1' })
		expect(t1).not.toBe(t2)
	})
})

describe('verifyToken', () => {
	it('verifica token válido e retorna payload', () => {
		const { token } = generateToken({ id: 'u1', email: 'a@b.com', nickname: 'nick' })
		const payload = verifyToken(token)
		expect(payload).not.toBeNull()
		expect(payload.id).toBe('u1')
		expect(payload.type).toBe('session')
	})

	it('retorna null para token adulterado', () => {
		expect(verifyToken('not.a.valid.jwt')).toBeNull()
	})

	it('retorna null para string vazia', () => {
		expect(verifyToken('')).toBeNull()
	})

	it('retorna null para null', () => {
		expect(verifyToken(null)).toBeNull()
	})
})

describe('decodeToken', () => {
	it('decodifica sem verificar assinatura', () => {
		const { token } = generateToken({ id: 'u99' })
		const decoded = decodeToken(token)
		expect(decoded.id).toBe('u99')
	})

	it('retorna null para string inválida', () => {
		expect(decodeToken('invalid')).toBeNull()
	})
})

describe('hashToken', () => {
	it('produz hash SHA-256 de 64 caracteres hex', () => {
		const h = hashToken('mytoken')
		expect(h).toHaveLength(64)
		expect(h).toMatch(/^[0-9a-f]+$/)
	})

	it('produz o mesmo hash para a mesma entrada', () => {
		expect(hashToken('mytoken')).toBe(hashToken('mytoken'))
	})

	it('produz hashes diferentes para entradas diferentes', () => {
		expect(hashToken('a')).not.toBe(hashToken('b'))
	})
})

describe('getTokenExpiry', () => {
	it('retorna uma Data aproximadamente 30 dias no futuro', () => {
		const expiry = getTokenExpiry()
		const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
		const diff = expiry.getTime() - Date.now()
		expect(diff).toBeGreaterThan(thirtyDaysMs - 2000)
		expect(diff).toBeLessThan(thirtyDaysMs + 2000)
	})

	it('retorna instância de Date', () => {
		expect(getTokenExpiry()).toBeInstanceOf(Date)
	})
})
