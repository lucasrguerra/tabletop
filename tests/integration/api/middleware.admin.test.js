import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('next-auth', () => ({
	getServerSession: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { withAdmin } from '@/utils/auth'
import connectDatabase from '@/database/database'
import User from '@/database/schemas/User'
import { useTestDatabase } from '../../setup/database'

function makeRequest(url = 'http://localhost/api/admin/test') {
	return new Request(url, { method: 'GET' })
}

// withAdmin decide a partir da flag `admin` no banco, não da sessão, então os
// cenários precisam de usuários reais.
let counter = 0
async function createUser({ admin = false } = {}) {
	counter += 1
	return User.create({
		name: `Admin Test ${counter}`,
		email: `admintest${counter}@example.com`,
		nickname: `admintest${counter}`,
		password_hash: 'hash-irrelevante-para-o-teste',
		admin,
	})
}

describe('withAdmin — middleware de administrador', () => {
	beforeAll(async () => {
		await connectDatabase()
	})

	useTestDatabase()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('retorna 401 quando não há sessão', async () => {
		getServerSession.mockResolvedValue(null)
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(401)
	})

	it('retorna 401 quando sessão não tem user.id', async () => {
		getServerSession.mockResolvedValue({ user: {} })
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(401)
	})

	it('retorna 403 quando usuário não é admin (admin=false)', async () => {
		const user = await createUser({ admin: false })
		getServerSession.mockResolvedValue({ user: { id: user._id.toString(), admin: false } })
		const handler = vi.fn()
		const wrapped = withAdmin(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(403)
		const body = await response.json()
		expect(body.message).toMatch(/administradores/)
		expect(handler).not.toHaveBeenCalled()
	})

	it('retorna 403 quando admin está ausente na sessão e no banco', async () => {
		const user = await createUser()
		getServerSession.mockResolvedValue({ user: { id: user._id.toString() } })
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(403)
	})

	it('retorna 403 quando a sessão traz admin truthy mas não exatamente true', async () => {
		// A sessão não é fonte de verdade — o banco diz admin=false.
		const user = await createUser({ admin: false })
		getServerSession.mockResolvedValue({ user: { id: user._id.toString(), admin: 1 } })
		const wrapped = withAdmin(vi.fn())

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(403)
	})

	it('chama o handler quando usuário é admin', async () => {
		const user = await createUser({ admin: true })
		getServerSession.mockResolvedValue({ user: { id: user._id.toString(), admin: true } })
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAdmin(handler)

		await wrapped(makeRequest(), {})
		expect(handler).toHaveBeenCalledOnce()
	})

	it('passa session como terceiro argumento para o handler', async () => {
		const user = await createUser({ admin: true })
		getServerSession.mockResolvedValue({ user: { id: user._id.toString(), admin: true } })
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAdmin(handler)

		await wrapped(makeRequest(), {})
		const [, , sessionArg] = handler.mock.calls[0]
		expect(sessionArg.user.id).toBe(user._id.toString())
		expect(sessionArg.user.admin).toBe(true)
	})
})
