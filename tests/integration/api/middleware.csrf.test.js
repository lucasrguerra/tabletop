import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { withCsrf } from '@/utils/csrf'
import { generateCsrfToken } from '@/utils/csrf'

function makeRequest({ csrfToken, sessionCookie } = {}) {
	const headers = new Headers()
	if (csrfToken) {
		headers.set('X-CSRF-Token', csrfToken)
	}

	const cookieHeader = sessionCookie ? `csrf_session=${sessionCookie}` : ''
	if (cookieHeader) {
		headers.set('Cookie', cookieHeader)
	}

	const request = new Request('http://localhost/api/test', {
		method: 'POST',
		headers,
	})

	// Simula cookies.get() que o Next.js injeta
	Object.defineProperty(request, 'cookies', {
		value: {
			get: (name) => sessionCookie && name === 'csrf_session'
				? { value: sessionCookie }
				: undefined,
		},
	})

	return request
}

describe('withCsrf — middleware de proteção CSRF', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('retorna 403 quando header X-CSRF-Token está ausente', async () => {
		const request = makeRequest({ sessionCookie: 'some-session' })
		const handler = vi.fn()
		const wrapped = withCsrf(handler)

		const response = await wrapped(request, {})
		expect(response.status).toBe(403)
		expect(handler).not.toHaveBeenCalled()
	})

	it('retorna 403 quando cookie csrf_session está ausente', async () => {
		const token = generateCsrfToken('some-session')
		const request = makeRequest({ csrfToken: token })
		const handler = vi.fn()
		const wrapped = withCsrf(handler)

		const response = await wrapped(request, {})
		expect(response.status).toBe(403)
		expect(handler).not.toHaveBeenCalled()
	})

	it('retorna 403 quando token não corresponde ao session_id', async () => {
		const token = generateCsrfToken('session-A')
		const request = makeRequest({ csrfToken: token, sessionCookie: 'session-B' })
		const handler = vi.fn()
		const wrapped = withCsrf(handler)

		const response = await wrapped(request, {})
		expect(response.status).toBe(403)
	})

	it('retorna 403 para token adulterado', async () => {
		const token = generateCsrfToken('session-A')
		const parts = token.split('.')
		const tampered = `${parts[0]}.${parts[1]}.invalidhex`
		const request = makeRequest({ csrfToken: tampered, sessionCookie: 'session-A' })
		const handler = vi.fn()
		const wrapped = withCsrf(handler)

		const response = await wrapped(request, {})
		expect(response.status).toBe(403)
	})

	it('chama o handler quando token e cookie são válidos', async () => {
		const sessionId = 'valid-session-123'
		const token = generateCsrfToken(sessionId)
		const request = makeRequest({ csrfToken: token, sessionCookie: sessionId })
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withCsrf(handler)

		const response = await wrapped(request, {})
		expect(handler).toHaveBeenCalledOnce()
		expect(response.status).toBe(200)
	})

	it('repassa argumentos adicionais para o handler (compatibilidade com withAuth)', async () => {
		const sessionId = 'valid-session-123'
		const token = generateCsrfToken(sessionId)
		const request = makeRequest({ csrfToken: token, sessionCookie: sessionId })
		const fakeSession = { user: { id: 'u1' } }
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withCsrf(handler)

		await wrapped(request, {}, fakeSession)
		expect(handler).toHaveBeenCalledWith(request, {}, fakeSession)
	})
})
