import { test, expect, fixtures } from './helpers/fixtures.mjs'
import { auditTheme, formatFindings } from './helpers/themeAudit.mjs'

/**
 * Guards against the dark-mode regressions: pages whose components never got a
 * `dark:` counterpart render light surfaces on a dark page (and vice versa).
 *
 * Runs under both the `light` and `dark` projects.
 */

const PUBLIC_ROUTES = ['/', '/login', '/register']

const AUTHED_ROUTES = [
	'/dashboard',
	'/dashboard/admin',
	'/dashboard/studies',
	'/dashboard/trainings',
	'/dashboard/trainings/new',
	'/dashboard/trainings/access',
	'/dashboard/trainings/invites',
	'/dashboard/sessions',
]

/** Lets client-side data land before the page is measured. */
async function settle(page) {
	await page.waitForLoadState('networkidle').catch(() => {})
	await page.waitForTimeout(600)
}

async function expectNoThemeIssues(page, theme, route) {
	await settle(page)

	const applied = await page.evaluate(() => document.documentElement.classList.contains('dark'))
	expect(applied, `${route}: classe .dark deveria estar ${theme === 'dark' ? 'presente' : 'ausente'}`)
		.toBe(theme === 'dark')

	const findings = await page.evaluate(auditTheme, theme)
	const total = findings.surfaces.length + findings.text.length
	expect(
		total,
		`${route} no tema ${theme} tem ${total} problema(s) de contraste/superfície:\n${formatFindings(findings)}`
	).toBe(0)
}

test.describe('cobertura de tema', () => {
	for (const route of PUBLIC_ROUTES) {
		test(`rota pública ${route}`, async ({ themedPage, theme }) => {
			await themedPage.goto(route)
			await expectNoThemeIssues(themedPage, theme, route)
		})
	}

	for (const route of AUTHED_ROUTES) {
		test(`rota autenticada ${route}`, async ({ authedPage, theme }) => {
			await authedPage.goto(route)
			await expectNoThemeIssues(authedPage, theme, route)
		})
	}

	test('console do facilitador', async ({ authedPage, theme }) => {
		const route = `/dashboard/trainings/${fixtures.training_id}/facilitator`
		await authedPage.goto(route)
		// The console only counts once it actually rendered; an access error
		// page would otherwise pass the audit while proving nothing.
		await expect(authedPage.getByText(/Controle de Rodadas/i)).toBeVisible()
		await expectNoThemeIssues(authedPage, theme, route)
	})

	test('ranking público', async ({ themedPage, theme }) => {
		const route = `/ranking/${fixtures.training_id}`
		await themedPage.goto(route)
		await expectNoThemeIssues(themedPage, theme, route)
	})
})

test.describe('controle de tema', () => {
	test('o seletor troca e persiste o tema', async ({ page }) => {
		await page.goto('/login')

		const initial = await page.evaluate(() =>
			document.documentElement.classList.contains('dark')
		)

		await page.getByRole('button', { name: /alternar tema/i }).click()
		await page.getByRole('menuitem', { name: initial ? /claro/i : /escuro/i }).click()

		await expect
			.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
			.toBe(!initial)

		// Survives a reload: the inline script in layout.jsx must read the same
		// storage key the provider writes.
		await page.reload()
		await expect
			.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
			.toBe(!initial)
	})

	test('o script anti-flash roda antes de qualquer bundle', async ({ request }) => {
		// A flash of the wrong theme cannot be observed reliably from a test, so
		// the guarantee that prevents it is asserted instead: the inline script
		// that sets the .dark class must be in <head>, ahead of every bundle.
		const html = await (await request.get('/login')).text()

		const inline = html.indexOf('tabletop-theme')
		expect(inline, 'script inline de tema ausente do HTML servido').toBeGreaterThan(-1)

		const head_end = html.indexOf('</head>')
		expect(inline, 'o script de tema deve estar dentro do <head>').toBeLessThan(head_end)

		// It must be inline and render-blocking. Next emits its own bundles
		// earlier in <head>, but those are async and only hydrate later; what
		// prevents the flash is this script running while the parser is in the
		// head, before the body paints.
		const tag = html.lastIndexOf('<script', inline)
		const open = html.slice(tag, html.indexOf('>', tag) + 1)
		expect(open, 'o script de tema não pode ter src').not.toMatch(/\ssrc=/)
		expect(open, 'o script de tema não pode ser async/defer').not.toMatch(/\s(async|defer)/)
	})

	test('o tema salvo é aplicado já no primeiro documento', async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem('tabletop-theme', 'dark'))
		await page.goto('/login', { waitUntil: 'domcontentloaded' })

		// No waiting and no React: if the class is only added by the provider's
		// effect, it would not be here yet.
		const applied = await page.evaluate(() =>
			document.documentElement.classList.contains('dark')
		)
		expect(applied, 'a classe .dark deve existir já no DOMContentLoaded').toBe(true)
	})

	test('color-scheme acompanha o tema', async ({ themedPage, theme }) => {
		await themedPage.goto('/login')
		// Drives the native widgets — scrollbars, selects, date pickers and
		// tooltips stay light without it, whatever the Tailwind classes say.
		const scheme = await themedPage.evaluate(
			() => getComputedStyle(document.documentElement).colorScheme
		)
		expect(scheme).toBe(theme)
	})
})
