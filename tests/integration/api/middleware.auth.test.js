import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock next-auth ANTES de importar withAuth (vi.mock é hoisted automaticamente)
vi.mock('next-auth', () => ({
	getServerSession: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { withAuth } from '@/utils/auth'

function makeRequest(url = 'http://localhost/api/test') {
	return new Request(url, { method: 'GET' })
}

describe('withAuth — middleware de autenticação', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('retorna 401 quando não há sessão', async () => {
		getServerSession.mockResolvedValue(null)
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAuth(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(401)
		expect(handler).not.toHaveBeenCalled()
	})

	it('retorna 401 quando sessão não tem user.id', async () => {
		getServerSession.mockResolvedValue({ user: {} })
		const wrapped = withAuth(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(401)
	})

	it('retorna 401 quando user é null', async () => {
		getServerSession.mockResolvedValue({ user: null })
		const wrapped = withAuth(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(401)
	})

	it('chama o handler com (request, context, session) quando autenticado', async () => {
		const session = { user: { id: 'user123', email: 'a@b.com', admin: false } }
		getServerSession.mockResolvedValue(session)
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAuth(handler)

		await wrapped(makeRequest(), { params: {} })

		expect(handler).toHaveBeenCalledOnce()
		const [reqArg, ctxArg, sessionArg] = handler.mock.calls[0]
		expect(sessionArg).toEqual(session)
	})

	it('propaga a resposta do handler', async () => {
		getServerSession.mockResolvedValue({ user: { id: 'u1' } })
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: 'ok' }, { status: 200 }))
		const wrapped = withAuth(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.data).toBe('ok')
	})

	it('retorna 500 quando o handler lança exceção', async () => {
		getServerSession.mockResolvedValue({ user: { id: 'u1' } })
		const handler = vi.fn().mockRejectedValue(new Error('crash'))
		const wrapped = withAuth(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(500)
	})
})
