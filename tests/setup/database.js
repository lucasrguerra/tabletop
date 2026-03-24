import mongoose from 'mongoose'
import { beforeEach, afterAll } from 'vitest'

/**
 * Helper para testes de integração com MongoDB.
 * Limpa todas as coleções antes de cada teste e fecha a conexão ao final.
 * Chamar dentro de um describe block.
 */
export function useTestDatabase() {
	beforeEach(async () => {
		const collections = mongoose.connection.collections
		for (const key in collections) {
			await collections[key].deleteMany({})
		}
	})

	afterAll(async () => {
		if (mongoose.connection.readyState !== 0) {
			await mongoose.connection.close()
		}
	})
}
