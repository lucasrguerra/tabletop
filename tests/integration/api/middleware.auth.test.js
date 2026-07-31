import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { NextResponse } from 'next/server'

// Mock next-auth ANTES de importar withAuth (vi.mock é hoisted automaticamente)
vi.mock('next-auth', () => ({
	getServerSession: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { withAuth } from '@/utils/auth'
import connectDatabase from '@/database/database'
import User from '@/database/schemas/User'
import { useTestDatabase } from '../../setup/database'

function makeRequest(url = 'http://localhost/api/test') {
	return new Request(url, { method: 'GET' })
}

// withAuth revalida as flags de privilégio no banco a cada requisição, então
// a sessão precisa apontar para um usuário que realmente existe.
let counter = 0
async function createUser(overrides = {}) {
	counter += 1
	return User.create({
		name: `Usuário ${counter}`,
		email: `authtest${counter}@example.com`,
		nickname: `authtest${counter}`,
		password_hash: 'hash-irrelevante-para-o-teste',
		...overrides,
	})
}

describe('withAuth — middleware de autenticação', () => {
	beforeAll(async () => {
		await connectDatabase()
	})

	useTestDatabase()

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

	it('retorna 401 quando o id da sessão não é um ObjectId válido', async () => {
		getServerSession.mockResolvedValue({ user: { id: 'user123' } })
		const handler = vi.fn()

		const response = await withAuth(handler)(makeRequest(), {})
		expect(response.status).toBe(401)
		expect(handler).not.toHaveBeenCalled()
	})

	it('chama o handler com (request, context, session) quando autenticado', async () => {
		const user = await createUser()
		const session = { user: { id: user._id.toString(), email: user.email, admin: false } }
		getServerSession.mockResolvedValue(session)
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
		const wrapped = withAuth(handler)

		await wrapped(makeRequest(), { params: {} })

		expect(handler).toHaveBeenCalledOnce()
		const [reqArg, ctxArg, sessionArg] = handler.mock.calls[0]
		expect(reqArg).toBeInstanceOf(Request)
		expect(sessionArg.user.id).toBe(user._id.toString())
		expect(sessionArg.user.email).toBe(user.email)
	})

	it('propaga a resposta do handler', async () => {
		const user = await createUser()
		getServerSession.mockResolvedValue({ user: { id: user._id.toString() } })
		const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: 'ok' }, { status: 200 }))
		const wrapped = withAuth(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(200)
		const body = await response.json()
		expect(body.data).toBe('ok')
	})

	it('retorna 500 quando o handler lança exceção', async () => {
		const user = await createUser()
		getServerSession.mockResolvedValue({ user: { id: user._id.toString() } })
		const handler = vi.fn().mockRejectedValue(new Error('crash'))
		const wrapped = withAuth(handler)

		const response = await wrapped(makeRequest(), {})
		expect(response.status).toBe(500)
	})
})
