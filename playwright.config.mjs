import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT || 3210)

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.mjs',
	globalSetup: './tests/e2e/setup/globalSetup.mjs',

	// The suite drives one shared server and one seeded database, so tests must
	// not race each other for that state.
	workers: 1,
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	timeout: 60_000,
	expect: { timeout: 10_000 },
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		viewport: { width: 1440, height: 1000 },
	},

	// The theme suite runs twice, once per colour scheme, so a regression in
	// either direction fails the build.
	projects: [
		{
			name: 'light',
			use: { ...devices['Desktop Chrome'], theme: 'light' },
		},
		{
			name: 'dark',
			use: { ...devices['Desktop Chrome'], theme: 'dark' },
		},
	],
})
