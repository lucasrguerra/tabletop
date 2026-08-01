import { test, expect, login, USERS, fixtures } from './helpers/fixtures.mjs'

/**
 * The business paths a user cannot afford to lose: creating an account, signing
 * in, joining a training by code, and driving a live session.
 *
 * These only run under the `light` project — they exercise behaviour, not
 * appearance, so running them twice would only double the runtime.
 */
test.describe('fluxos críticos', () => {
	test.skip(({ theme }) => theme === 'dark', 'comportamento não depende do tema')

	test('cadastro cria conta e leva ao login', async ({ page }) => {
		const unique = Date.now().toString().slice(-8)
		await page.goto('/register')

		await page.fill('input[name="name"]', 'Novo Usuário E2E')
		await page.fill('input[name="email"]', `novo${unique}@e2e.local`)
		await page.fill('input[name="nickname"]', `novo_${unique}`)
		await page.fill('input[name="password"]', 'Novo!Usuario1')
		await page.fill('input[name="confirmPassword"]', 'Novo!Usuario1')
		await page.click('button[type="submit"]')

		await page.waitForURL('**/login', { timeout: 30_000 })

		// The account must be usable, not merely created.
		await page.fill('input[name="identifier"]', `novo_${unique}`)
		await page.fill('input[name="password"]', 'Novo!Usuario1')
		await page.click('button[type="submit"]')
		await page.waitForURL('**/dashboard', { timeout: 30_000 })
	})

	test('cadastro rejeita email já em uso', async ({ page }) => {
		await page.goto('/register')
		await page.fill('input[name="name"]', 'Duplicado')
		await page.fill('input[name="email"]', USERS.facilitator.email)
		await page.fill('input[name="nickname"]', `dup_${Date.now().toString().slice(-6)}`)
		await page.fill('input[name="password"]', 'Duplicado!1')
		await page.fill('input[name="confirmPassword"]', 'Duplicado!1')
		await page.click('button[type="submit"]')

		await expect(page.getByText(/já está em uso/i)).toBeVisible()
		expect(new URL(page.url()).pathname).toBe('/register')
	})

	test('login rejeita senha incorreta', async ({ page }) => {
		await page.goto('/login')
		await page.fill('input[name="identifier"]', USERS.facilitator.nickname)
		await page.fill('input[name="password"]', 'SenhaErrada!9')
		await page.click('button[type="submit"]')

		await page.waitForTimeout(2500)
		expect(new URL(page.url()).pathname).toBe('/login')
	})

	test('login e logout completam o ciclo', async ({ page }) => {
		await login(page, 'participant')
		expect(new URL(page.url()).pathname).toBe('/dashboard')

		// Logout is gated by a native confirm(), which Playwright dismisses by
		// default — leaving the session untouched.
		page.once('dialog', (dialog) => dialog.accept())

		// The layout keeps the sidebar translated out of the viewport until the
		// drawer is opened, so the logout button is unclickable before that.
		await page.getByRole('button', { name: /abrir menu/i }).click()
		await page.getByRole('button', { name: 'Encerrar Sessão' }).click()

		// Logout revokes the token, signs out and redirects. Navigating before
		// that chain settles would cancel it mid-flight.
		await page.waitForURL(/\/login/, { timeout: 30_000 })

		// The session must really be gone, not just navigated away from.
		await page.goto('/dashboard')
		await page.waitForURL(/\/login/, { timeout: 20_000 })
	})

	test('participante entra no treinamento por código de acesso', async ({ page }) => {
		await login(page, 'participant')
		await page.goto('/dashboard/trainings/access')

		// The page offers both open-access and code-based entry, so the code
		// form is targeted explicitly rather than by button label.
		await page.locator('#access_code').fill(fixtures.access_code)
		await page.locator('form').filter({ has: page.locator('#access_code') })
			.getByRole('button', { name: /entrar no treinamento/i })
			.click()

		await page.waitForURL(/\/dashboard\/trainings\/[a-f0-9]{24}/, { timeout: 30_000 })
		expect(page.url()).toContain(fixtures.training_id)
	})

	test('facilitador avança a rodada do treinamento', async ({ page }) => {
		await login(page, 'facilitator')
		await page.goto(`/dashboard/trainings/${fixtures.training_id}/facilitator`)

		// Relative to whatever round the session is on: the suite shares one
		// database, so an earlier test may already have advanced it.
		const indicator = page.getByText(/Rodada \d+ de \d+/i).first()
		await expect(indicator).toBeVisible()
		const current = Number((await indicator.textContent()).match(/Rodada (\d+)/)[1])

		await page.getByRole('button', { name: /próxima/i }).first().click()
		await expect(page.getByText(new RegExp(`Rodada ${current + 1} de`, 'i')).first())
			.toBeVisible()

		// State must be persisted server-side, not only in React state.
		await page.reload()
		await expect(page.getByText(new RegExp(`Rodada ${current + 1} de`, 'i')).first())
			.toBeVisible()
	})

	test('escolher categoria revela os tipos de incidente', async ({ page }) => {
		await login(page, 'facilitator')
		await page.goto('/dashboard/trainings/new')

		// The first step discloses progressively rather than paginating: the
		// incident types belonging to a category only render once it is picked.
		const incident = page.getByRole('button', { name: /expiração de certificado/i })
		await expect(incident).toBeHidden()

		await page.getByRole('button', { name: /governança e jurídico/i }).click()
		await expect(incident).toBeVisible()

		// "Voltar" stays disabled while the wizard is still on its first step.
		await expect(page.getByRole('button', { name: 'Voltar', exact: true })).toBeDisabled()
	})
})
