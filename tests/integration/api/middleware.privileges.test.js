import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

vi.mock('next-auth', () => ({
	getServerSession: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { withAuth, withAdmin, getCurrentUserPrivileges } from '@/utils/auth'
import connectDatabase from '@/database/database'
import User from '@/database/schemas/User'
import { useTestDatabase } from '../../setup/database'

function makeRequest(url = 'http://localhost/api/test') {
	return new Request(url, { method: 'GET' })
}

let counter = 0
async function createUser({ admin = false, facilitator = false } = {}) {
	counter += 1
	return User.create({
		name: `Usuário ${counter}`,
		email: `user${counter}@example.com`,
		nickname: `user${counter}`,
		password_hash: 'hash-irrelevante-para-o-teste',
		admin,
		facilitator,
	})
}

/** Session carrying stale flags, exactly as a JWT issued before a revocation would. */
function sessionFor(user, staleFlags = {}) {
	return {
		user: {
			id: user._id.toString(),
			email: user.email,
			admin: user.admin,
			facilitator: user.facilitator,
			...staleFlags,
		},
	}
}

describe('revalidação de privilégios no banco', () => {
	beforeAll(async () => {
		await connectDatabase()
	})

	useTestDatabase()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getCurrentUserPrivileges', () => {
		it('lê as flags atuais do banco', async () => {
			const user = await createUser({ admin: true, facilitator: true })
			expect(await getCurrentUserPrivileges(user._id.toString())).toEqual({
				admin: true,
				facilitator: true,
			})
		})

		it('normaliza flags ausentes para false', async () => {
			const user = await createUser()
			expect(await getCurrentUserPrivileges(user._id.toString())).toEqual({
				admin: false,
				facilitator: false,
			})
		})

		it('retorna null para usuário inexistente', async () => {
			const id = new mongoose.Types.ObjectId().toString()
			expect(await getCurrentUserPrivileges(id)).toBeNull()
		})

		it('retorna null para id malformado', async () => {
			expect(await getCurrentUserPrivileges('nao-e-objectid')).toBeNull()
		})
	})

	describe('withAdmin', () => {
		it('permite acesso a quem é admin no banco', async () => {
			const user = await createUser({ admin: true })
			getServerSession.mockResolvedValue(sessionFor(user))
			const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))

			const response = await withAdmin(handler)(makeRequest(), {})

			expect(response.status).toBe(200)
			expect(handler).toHaveBeenCalledOnce()
		})

		// Regressão: a decisão vinha de session.user.admin, gravado no JWT no
		// login e válido por 30 dias. Revogar o privilégio de alguém não surtia
		// efeito até a sessão expirar ou a pessoa refazer login.
		it('nega acesso quando o admin foi revogado após a emissão da sessão', async () => {
			const user = await createUser({ admin: true })
			// Sessão emitida enquanto ainda era admin.
			const staleSession = sessionFor(user, { admin: true })

			// Privilégio revogado no banco depois disso.
			await User.findByIdAndUpdate(user._id, { admin: false })

			getServerSession.mockResolvedValue(staleSession)
			const handler = vi.fn()

			const response = await withAdmin(handler)(makeRequest(), {})

			expect(response.status).toBe(403)
			expect(handler).not.toHaveBeenCalled()
		})

		it('nega acesso quando a sessão afirma admin mas o banco nunca concedeu', async () => {
			const user = await createUser({ admin: false })
			getServerSession.mockResolvedValue(sessionFor(user, { admin: true }))
			const handler = vi.fn()

			const response = await withAdmin(handler)(makeRequest(), {})

			expect(response.status).toBe(403)
			expect(handler).not.toHaveBeenCalled()
		})

		it('retorna 401 quando a conta da sessão foi deletada', async () => {
			const user = await createUser({ admin: true })
			const session = sessionFor(user)
			await User.findByIdAndDelete(user._id)

			getServerSession.mockResolvedValue(session)
			const handler = vi.fn()

			const response = await withAdmin(handler)(makeRequest(), {})

			expect(response.status).toBe(401)
			expect(handler).not.toHaveBeenCalled()
		})

		it('concede acesso quando o admin foi promovido após a emissão da sessão', async () => {
			const user = await createUser({ admin: false })
			const staleSession = sessionFor(user, { admin: false })
			await User.findByIdAndUpdate(user._id, { admin: true })

			getServerSession.mockResolvedValue(staleSession)
			const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))

			const response = await withAdmin(handler)(makeRequest(), {})

			expect(response.status).toBe(200)
		})
	})

	describe('withAuth', () => {
		it('sobrescreve flags obsoletas da sessão com as do banco', async () => {
			const user = await createUser({ admin: false, facilitator: false })
			// Sessão mente sobre ambas as flags.
			getServerSession.mockResolvedValue(sessionFor(user, { admin: true, facilitator: true }))

			const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
			await withAuth(handler)(makeRequest(), {})

			const [, , sessionArg] = handler.mock.calls[0]
			expect(sessionArg.user.admin).toBe(false)
			expect(sessionArg.user.facilitator).toBe(false)
		})

		// O gate de criação de treinamento (/api/trainings/new) lê
		// session.user.facilitator, então precisa enxergar o valor atual.
		it('reflete a revogação de facilitator na sessão entregue ao handler', async () => {
			const user = await createUser({ facilitator: true })
			const staleSession = sessionFor(user, { facilitator: true })
			await User.findByIdAndUpdate(user._id, { facilitator: false })

			getServerSession.mockResolvedValue(staleSession)
			const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
			await withAuth(handler)(makeRequest(), {})

			const [, , sessionArg] = handler.mock.calls[0]
			expect(sessionArg.user.facilitator).toBe(false)
		})

		it('reflete a promoção a facilitator sem exigir novo login', async () => {
			const user = await createUser({ facilitator: false })
			const staleSession = sessionFor(user, { facilitator: false })
			await User.findByIdAndUpdate(user._id, { facilitator: true })

			getServerSession.mockResolvedValue(staleSession)
			const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }))
			await withAuth(handler)(makeRequest(), {})

			const [, , sessionArg] = handler.mock.calls[0]
			expect(sessionArg.user.facilitator).toBe(true)
		})

		it('retorna 401 quando a conta da sessão foi deletada', async () => {
			const user = await createUser()
			const session = sessionFor(user)
			await User.findByIdAndDelete(user._id)

			getServerSession.mockResolvedValue(session)
			const handler = vi.fn()

			const response = await withAuth(handler)(makeRequest(), {})

			expect(response.status).toBe(401)
			expect(handler).not.toHaveBeenCalled()
		})
	})
})
