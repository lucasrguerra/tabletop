import { describe, it, expect, beforeAll } from 'vitest'
import connectDatabase from '@/database/database'
import register from '@/models/User/register'
import { useTestDatabase } from '../../setup/database'

describe('register() — integração', () => {
	beforeAll(async () => {
		await connectDatabase()
	})

	useTestDatabase()

	const validUser = {
		name: 'Test User',
		email: 'test@example.com',
		nickname: 'testuser',
		password: 'Password1!',
	}

	it('registra novo usuário com dados válidos', async () => {
		const result = await register(validUser.name, validUser.email, validUser.nickname, validUser.password)
		expect(result.success).toBe(true)
		expect(result.user.email).toBe('test@example.com')
		expect(result.user.nickname).toBe('testuser')
		expect(result.user).not.toHaveProperty('password_hash')
	})

	it('retorna id de string no resultado', async () => {
		const result = await register(validUser.name, validUser.email, validUser.nickname, validUser.password)
		expect(result.success).toBe(true)
		expect(typeof result.user.id).toBe('string')
	})

	it('rejeita quando campos obrigatórios estão ausentes', async () => {
		const result = await register('', validUser.email, validUser.nickname, validUser.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/obrigatórios/)
	})

	it('rejeita nome muito curto', async () => {
		const result = await register('Jo', validUser.email, validUser.nickname, validUser.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/3 e 100/)
	})

	it('rejeita email inválido', async () => {
		const result = await register(validUser.name, 'notanemail', validUser.nickname, validUser.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Email inválido/)
	})

	it('rejeita nickname com caracteres inválidos', async () => {
		const result = await register(validUser.name, validUser.email, 'invalid nick!', validUser.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/nickname/)
	})

	it('rejeita senha fraca (sem caractere especial)', async () => {
		const result = await register(validUser.name, validUser.email, validUser.nickname, 'WeakPass1')
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/senha/)
	})

	it('rejeita email duplicado', async () => {
		await register(validUser.name, validUser.email, validUser.nickname, validUser.password)
		const result = await register('Other User', validUser.email, 'othernick', validUser.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/email já está em uso/)
	})

	it('rejeita nickname duplicado (case-insensitive)', async () => {
		await register(validUser.name, validUser.email, validUser.nickname, validUser.password)
		const result = await register('Other User', 'other@example.com', 'TestUser', validUser.password)
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/nickname já está em uso/)
	})

	it('normaliza email para minúsculas', async () => {
		const result = await register(validUser.name, 'User@EXAMPLE.COM', 'anothernick', validUser.password)
		expect(result.success).toBe(true)
		expect(result.user.email).toBe('user@example.com')
	})
})
