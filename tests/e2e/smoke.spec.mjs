import { test, expect, fixtures } from './helpers/fixtures.mjs'

/**
 * Every route must render without console errors or failed requests. Catches
 * crashes and broken data fetching that a theme audit would walk straight past.
 */

const ROUTES = [
	{ path: '/', auth: false },
	{ path: '/login', auth: false },
	{ path: '/register', auth: false },
	{ path: '/dashboard', auth: true },
	{ path: '/dashboard/admin', auth: true },
	{ path: '/dashboard/studies', auth: true },
	{ path: '/dashboard/trainings', auth: true },
	{ path: '/dashboard/trainings/new', auth: true },
	{ path: '/dashboard/trainings/access', auth: true },
	{ path: '/dashboard/trainings/invites', auth: true },
	{ path: '/dashboard/sessions', auth: true },
]

/** Noise that says nothing about the page's health. */
const IGNORED = [
	/favicon/i,
	/Download the React DevTools/i,
	/websocket/i,
	/socket\.io/i,
	// Next prefetches route payloads on link hover/viewport and aborts them
	// when the page goes away; an aborted prefetch is not a failure.
	/[?&]_rsc=/,
]

function watch(page) {
	const problems = []
	page.on('console', (msg) => {
		if (msg.type() !== 'error') return
		const text = msg.text()
		if (IGNORED.some((re) => re.test(text))) return
		problems.push(`console: ${text}`)
	})
	page.on('pageerror', (err) => problems.push(`exceção: ${err.message}`))
	page.on('requestfailed', (req) => {
		if (IGNORED.some((re) => re.test(req.url()))) return
		problems.push(`requisição falhou: ${req.url()} (${req.failure()?.errorText})`)
	})
	page.on('response', (res) => {
		if (res.status() >= 500) problems.push(`HTTP ${res.status()} em ${res.url()}`)
	})
	return problems
}

test.describe('fumaça das rotas', () => {
	for (const route of ROUTES) {
		test(`${route.path} carrega sem erros`, async ({ page, authedPage, theme }) => {
			const target = route.auth ? authedPage : page
			const problems = watch(target)

			if (!route.auth) {
				await target.addInitScript((t) => localStorage.setItem('tabletop-theme', t), theme)
			}
			await target.goto(route.path)
			await target.waitForLoadState('networkidle').catch(() => {})

			await expect(target.locator('body')).toBeVisible()
			expect(problems, `${route.path}:\n  ${problems.join('\n  ')}`).toEqual([])
		})
	}

	test('página de treinamento do facilitador carrega sem erros', async ({ authedPage }) => {
		const problems = watch(authedPage)
		await authedPage.goto(`/dashboard/trainings/${fixtures.training_id}/facilitator`)
		await expect(authedPage.getByText(/Controle de Rodadas/i)).toBeVisible()
		expect(problems, problems.join('\n')).toEqual([])
	})
})

test.describe('proteção de rotas', () => {
	// Deliberately uses a fresh `page`, i.e. no session cookie.
	for (const path of ['/dashboard', '/dashboard/admin', '/dashboard/sessions']) {
		test(`${path} exige autenticação`, async ({ page }) => {
			await page.goto(path)
			await page.waitForURL(/\/login/, { timeout: 20_000 })
			expect(new URL(page.url()).pathname).toBe('/login')
		})
	}
})
