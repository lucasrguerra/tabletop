import { test as base, expect } from '@playwright/test'
import { USERS } from '../setup/seed.mjs'

/** Ids created by the seed, handed over by global setup. */
export const fixtures = JSON.parse(process.env.E2E_FIXTURES || '{}')

/**
 * Logs in through the real form so the CSRF and NextAuth cookie flow is
 * exercised, rather than being faked with a hand-built token.
 */
export async function login(page, who = 'facilitator') {
	const user = USERS[who]
	await page.goto('/login')
	await page.fill('input[name="identifier"]', user.nickname)
	await page.fill('input[name="password"]', user.password)
	await page.click('button[type="submit"]')
	await page.waitForURL('**/dashboard', { timeout: 30_000 })
}

/** Forces a theme before the app boots, matching the anti-flash script. */
export async function useTheme(page, theme) {
	await page.addInitScript((t) => {
		localStorage.setItem('tabletop-theme', t)
	}, theme)
}

/**
 * `authed` gives a page already logged in as the facilitator; `theme` reads the
 * THEME the current project is running under.
 */
export const test = base.extend({
	theme: [async ({}, use, testInfo) => {
		await use(testInfo.project.use.theme || 'light')
	}, { option: true }],

	themedPage: async ({ page, theme }, use) => {
		await useTheme(page, theme)
		await use(page)
	},

	authedPage: async ({ page, theme }, use) => {
		await useTheme(page, theme)
		await login(page, 'facilitator')
		await use(page)
	},
})

export { expect, USERS }
