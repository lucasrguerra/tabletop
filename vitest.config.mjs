import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		setupFiles: ['./tests/setup/env.js'],
		globalSetup: './tests/setup/globalSetup.js',
		include: ['tests/**/*.test.js'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['models/**', 'utils/**'],
			exclude: ['utils/useAuth.js', 'utils/useSocket.js', 'utils/useUserSocket.js'],
		},
		testTimeout: 30000,
		hookTimeout: 30000,
		pool: 'forks', // isola módulos com estado global (rateLimit, CSRF_SECRET)
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '.'),
		},
	},
})
