import { MongoMemoryServer } from 'mongodb-memory-server'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seed } from './seed.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
export const PORT = Number(process.env.E2E_PORT || 3210)
export const BASE_URL = `http://localhost:${PORT}`

let mongod
let server

/**
 * Waits for the Next.js server to answer, so tests never race the boot.
 */
async function waitForServer(url, timeout_ms = 90_000) {
	const deadline = Date.now() + timeout_ms
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url, { redirect: 'manual' })
			if (res.status < 500) return
		} catch {
			// not listening yet
		}
		await new Promise((r) => setTimeout(r, 500))
	}
	throw new Error(`Servidor não respondeu em ${url} dentro de ${timeout_ms}ms`)
}

export default async function globalSetup() {
	// The theme suite asserts on compiled CSS. `next dev` serves a cached
	// stylesheet that can lag behind edits, which would make those assertions
	// report stale results, so E2E always runs against a production build.
	if (!existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
		throw new Error(
			'Build de produção ausente. Rode `npm run build` antes dos testes E2E ' +
				'(ou use `npm run test:e2e`, que já faz isso).'
		)
	}

	mongod = await MongoMemoryServer.create()
	const uri = `${mongod.getUri().split('?')[0].replace(/\/[^/]*$/, '/')}tabletop_e2e`

	const env = {
		...process.env,
		NODE_ENV: 'production',
		PORT: String(PORT),
		MONGODB_URI: uri,
		NEXTAUTH_URL: BASE_URL,
		NEXTAUTH_SECRET: 'e2e-nextauth-secret-minimum-32-chars',
		JWT_SECRET: 'e2e-jwt-secret-minimum-32-characters',
		CSRF_SECRET: 'e2e-csrf-secret-minimum-32-character',
	}

	const fixtures = await seed(uri)

	server = spawn('node', ['server.mjs'], { cwd: ROOT, env, stdio: 'pipe' })
	const log = []
	server.stdout.on('data', (d) => log.push(d.toString()))
	server.stderr.on('data', (d) => log.push(d.toString()))
	server.on('exit', (code) => {
		if (code) console.error('[e2e] servidor caiu:\n' + log.join(''))
	})

	try {
		await waitForServer(`${BASE_URL}/login`)
	} catch (err) {
		console.error('[e2e] saída do servidor:\n' + log.join(''))
		throw err
	}

	// Handed to the specs through the Playwright config's `use.baseURL` and an
	// env var, since global setup cannot export values directly.
	process.env.E2E_BASE_URL = BASE_URL
	process.env.E2E_FIXTURES = JSON.stringify(fixtures)

	return async () => {
		if (server) server.kill('SIGTERM')
		if (mongod) await mongod.stop()
	}
}
