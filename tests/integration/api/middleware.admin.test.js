import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('next-auth', () => ({
	getServerSession: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { withAdmin } from '@/utils/auth'

function makeRequest(url = 'http://localhost/api/admin/test') {
	return new Request(url, { method: 'GET' })
}

describe('withAdmin — middleware de administrador', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('retorna 401 quando não há sessão', async () => {
		getServerSession.mockResolvedValue(null)
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(401)
	})

	it('retorna 403 quando usuário não é admin (admin=false)', async () => {
		getServerSession.mockResolvedValue({ user: { id: 'u1', admin: false } })
		const handler = vi.fn()
		const wrapped = withAdmin(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(403)
		const body = await response.json()
		expect(body.message).toMatch(/administradores/)
		expect(handler).not.toHaveBeenCalled()
	})

	it('retorna 403 quando admin está ausente na sessão', async () => {
		getServerSession.mockResolvedValue({ user: { id: 'u1' } })
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(403)
	})

	it('retorna 403 quando admin é truthy mas não exatamente true', async () => {
		// O código verifica session.user.admin !== true — strings truthy devem ser rejeitadas
		getServerSession.mockResolvedValue({ user: { id: 'u1', admin: 1 } })
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(403)
	})

	it('chama o handler quando usuário é admin', async () => {
		const session = { user: { id: 'u1', admin: true } }
		getServerSession.mockResolvedValue(session)
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAdmin(handler)

		await wrapped(makeRequest(), {})
		expect(handler).toHaveBeenCalledOnce()
	})

	it('passa session como terceiro argumento para o handler', async () => {
		const session = { user: { id: 'u1', admin: true } }
		getServerSession.mockResolvedValue(session)
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAdmin(handler)

		await wrapped(makeRequest(), {})
		const [, , sessionArg] = handler.mock.calls[0]
		expect(sessionArg).toEqual(session)
	})
})
