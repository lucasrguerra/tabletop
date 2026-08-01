import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/**
 * Accounts the specs log in with. Passwords satisfy the app's complexity rule
 * (upper, lower, digit, symbol, 8+ chars).
 */
export const USERS = {
	facilitator: {
		name: 'Fernanda Facilitadora',
		email: 'facilitador@e2e.local',
		nickname: 'e2e_facilitador',
		password: 'E2e!Facilitador1',
		admin: true,
		facilitator: true,
	},
	participant: {
		name: 'Paulo Participante',
		email: 'participante@e2e.local',
		nickname: 'e2e_participante',
		password: 'E2e!Participante1',
		admin: false,
		facilitator: false,
	},
}

/**
 * Picks the first scenario available on disk, so the seed keeps working when
 * the scenario catalogue changes.
 */
function firstScenario() {
	const base = path.join(ROOT, 'scenarios')
	for (const category of fs.readdirSync(base)) {
		const category_path = path.join(base, category)
		if (!fs.statSync(category_path).isDirectory()) continue
		for (const type of fs.readdirSync(category_path)) {
			const type_path = path.join(category_path, type)
			if (!fs.statSync(type_path).isDirectory()) continue
			const file = fs.readdirSync(type_path).find((f) => f.endsWith('.json'))
			if (file) return { category, type, id: file.replace(/\.json$/, '') }
		}
	}
	throw new Error('Nenhum cenário encontrado em scenarios/')
}

/**
 * Populates the in-memory database with the two accounts and one running
 * training the specs need. Returns the ids the specs reference.
 */
export async function seed(uri) {
	process.env.MONGODB_URI = uri

	// bcryptjs directly rather than models/Password.js: the app's modules are
	// ESM `.js` that only Next transpiles, and plain node cannot import them.
	// Keep the cost factor in sync with models/Password.js.
	const salt = await bcrypt.genSalt(12)
	const hash = (plain) => bcrypt.hash(plain, salt)

	await mongoose.connect(uri)

	const users = mongoose.connection.collection('users')
	const trainings = mongoose.connection.collection('trainings')
	await users.deleteMany({})
	await trainings.deleteMany({})

	const ids = {}
	for (const [key, u] of Object.entries(USERS)) {
		const { insertedId } = await users.insertOne({
			name: u.name,
			email: u.email,
			nickname: u.nickname,
			password_hash: await hash(u.password),
			admin: u.admin,
			facilitator: u.facilitator,
			created_at: new Date(),
		})
		ids[key] = insertedId.toString()
	}

	const scenario = firstScenario()
	const { insertedId: training_id } = await trainings.insertOne({
		name: 'Treinamento E2E',
		description: 'Treinamento criado pelo seed dos testes end-to-end.',
		created_by: new mongoose.Types.ObjectId(ids.facilitator),
		scenario,
		access_type: 'code',
		access_code: 'E2E123',
		max_participants: 10,
		status: 'active',
		current_round: 1,
		started_at: new Date(),
		// Only the facilitator is enrolled. The participant account is left out
		// on purpose so the join-by-code flow has something to actually do.
		participants: [
			{
				user_id: new mongoose.Types.ObjectId(ids.facilitator),
				role: 'facilitator',
				status: 'accepted',
				joined_at: new Date(),
			},
		],
		created_at: new Date(),
	})

	await mongoose.connection.close()

	return { users: ids, training_id: training_id.toString(), access_code: 'E2E123' }
}
