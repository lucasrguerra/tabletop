import { describe, it, expect, beforeAll } from 'vitest'
import connectDatabase from '@/database/database'
import register from '@/models/User/register'
import Login from '@/models/User/login'
import { useTestDatabase } from '../../setup/database'

describe('Login() — integração', () => {
	beforeAll(async () => {
		await connectDatabase()
	})

	useTestDatabase()

	const userData = {
		name: 'Login Test User',
		email: 'login@example.com',
		nickname: 'loginuser',
		password: 'Password1!',
	}

	async function createUser() {
		await register(userData.name, userData.email, userData.nickname, userData.password)
	}

	it('faz login com email correto e senha correta', async () => {
		await createUser()
		const result = await Login(userData.email, userData.password)
		expect(result.success).toBe(true)
		expect(result.user.email).toBe(userData.email)
		expect(typeof result.token).toBe('string')
	})

	it('faz login com nickname correto e senha correta', async () => {
		await createUser()
		const result = await Login(userData.nickname, userData.password)
		expect(result.success).toBe(true)
		expect(result.user.nickname).toBe(userData.nickname)
	})

	it('rejeita senha incorreta', async () => {
		await createUser()
		const result = await Login(userData.email, 'WrongPass1!')
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/inválidos/)
	})

	it('rejeita usuário inexistente', async () => {
		const result = await Login('nobody@example.com', userData.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/inválidos/)
	})

	it('rejeita quando identificador está ausente', async () => {
		const result = await Login('', userData.password)
		expect(result.success).toBe(false)
	})

	it('rejeita quando senha está ausente', async () => {
		const result = await Login(userData.email, '')
		expect(result.success).toBe(false)
	})

	it('retorna dados do usuário sem password_hash', async () => {
		await createUser()
		const result = await Login(userData.email, userData.password)
		expect(result.success).toBe(true)
		expect(result.user).not.toHaveProperty('password_hash')
	})

	it('usa mensagem genérica para falha (não vaza qual campo está errado)', async () => {
		await createUser()
		const wrongPass = await Login(userData.email, 'WrongPass1!')
		const noUser = await Login('nobody@example.com', userData.password)
		// Ambos devem retornar a mesma mensagem genérica
		expect(wrongPass.message).toBe(noUser.message)
	})
})
