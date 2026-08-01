import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/**
 * Static guard for dark-mode coverage.
 *
 * The browser suite only sees the routes it visits; this catches a missing
 * `dark:` variant the moment it is written, in any file, in milliseconds and
 * without a server. It is deliberately conservative: it only flags light
 * surface utilities, which are the ones that turn into white boxes.
 */

const NEUTRALS = ['slate', 'gray', 'zinc', 'neutral', 'stone']
const COLORS = [
	...NEUTRALS, 'blue', 'emerald', 'green', 'amber', 'yellow', 'red', 'indigo',
	'purple', 'rose', 'cyan', 'teal', 'orange', 'violet', 'pink', 'sky', 'lime',
]

// Two different failure modes, so two different rules.
//
// Surfaces (bg/border): only pale tints turn into white boxes on a dark page.
// A saturated fill like `bg-blue-600` is a solid brand button that is meant to
// look identical in both themes, so it is not a gap.
const SURFACE_SHADES = ['50', '100', '200', '300']
// Text: dark ink needs lightening in dark mode. `text-white` is excluded — it
// only ever sits on a coloured fill or gradient, which stays put.
const INK_SHADES = ['600', '700', '800', '900']

const PROPS = ['bg', 'text', 'border']

const SURFACE_TOKEN = new RegExp(
	`^((?:[a-z-]+:)*)(bg|border)-(?:white|(?:${COLORS.join('|')})-(?:${SURFACE_SHADES.join('|')}))(?:/\\d+)?$`
)
const INK_TOKEN = new RegExp(
	`^((?:[a-z-]+:)*)(text)-(?:${COLORS.join('|')})-(?:${INK_SHADES.join('|')})(?:/\\d+)?$`
)
const DARK_TOKEN = new RegExp(`^dark:((?:[a-z-]+:)*)(${PROPS.join('|')})-`)

/**
 * Surfaces that are dark by design in both themes, so a `dark:` variant would
 * be wrong rather than missing.
 */
const EXEMPT_FILES = new Set([
	'components/Footer.jsx', // permanently dark gradient footer
])

/** A class string sitting on an intentionally dark surface. */
const DARK_SURFACE = new RegExp(
	`(?:^|\\s)(?:bg|from|via|to)-(?:${NEUTRALS.join('|')})-(?:700|800|900|950)(?:/\\d+)?(?:\\s|$)`
)

function jsxFiles(dir, acc = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) jsxFiles(full, acc)
		else if (entry.name.endsWith('.jsx')) acc.push(full)
	}
	return acc
}

/**
 * Extracts candidate class strings: every quoted literal, plus the static
 * chunks of `className={`...`}` templates (whose `${...}` may contain quotes,
 * which is exactly where a previous sweep missed several files).
 */
function classStrings(src) {
	const out = []

	// Single-line literals anywhere (covers class maps in config objects).
	for (const m of src.matchAll(/(["'`])((?:[^"'`\\\n]|\\.)*?)\1/g)) out.push(m[2])

	// Multi-line `className="..."`. Long class lists are routinely wrapped, and
	// missing them is what let the original regressions through.
	for (const m of src.matchAll(/className=(["'])((?:[^"'\\]|\\.)*?)\1/gs)) out.push(m[2])

	const MARK = 'className={`'
	let i = 0
	while ((i = src.indexOf(MARK, i)) >= 0) {
		const start = i + MARK.length
		let j = start
		let depth = 0
		let chunk = start
		while (j < src.length) {
			if (src[j] === '\\') { j += 2; continue }
			if (src.startsWith('${', j) && depth === 0) {
				out.push(src.slice(chunk, j))
				depth++
				j += 2
				continue
			}
			if (depth) {
				if (src[j] === '{') depth++
				else if (src[j] === '}') { depth--; if (depth === 0) chunk = j + 1 }
			} else if (src[j] === '`') {
				out.push(src.slice(chunk, j))
				break
			}
			j++
		}
		i = j + 1
	}

	return out
}

/** Class strings whose light utilities lack a matching dark: variant. */
function findGaps(src) {
	const gaps = []
	for (const body of classStrings(src)) {
		const tokens = body.split(/\s+/).filter(Boolean)
		if (!tokens.length) continue
		if (DARK_SURFACE.test(' ' + tokens.join(' ') + ' ')) continue

		const covered = new Set()
		for (const t of tokens) {
			const m = DARK_TOKEN.exec(t)
			if (m) covered.add(m[1] + m[2])
		}

		for (const t of tokens) {
			if (t.startsWith('dark:')) continue
			const m = SURFACE_TOKEN.exec(t) || INK_TOKEN.exec(t)
			if (!m) continue
			if (!covered.has(m[1] + m[2])) gaps.push(t)
		}
	}
	return gaps
}

describe('cobertura de dark mode nas classes Tailwind', () => {
	const files = [
		...jsxFiles(path.join(ROOT, 'app')),
		...jsxFiles(path.join(ROOT, 'components')),
	]

	it('encontra arquivos JSX para analisar', () => {
		expect(files.length).toBeGreaterThan(30)
	})

	it('nenhum utilitário de superfície clara fica sem par dark:', () => {
		const offenders = []

		for (const file of files) {
			const rel = path.relative(ROOT, file)
			if (EXEMPT_FILES.has(rel)) continue

			const gaps = findGaps(fs.readFileSync(file, 'utf8'))
			if (gaps.length) offenders.push(`${rel}: ${[...new Set(gaps)].join(', ')}`)
		}

		expect(
			offenders,
			'Utilitários claros sem variante dark: (adicione o par ou, se a superfície ' +
				'for escura por design, inclua o arquivo em EXEMPT_FILES):\n' +
				offenders.join('\n')
		).toEqual([])
	})
})

describe('tokens globais de tema', () => {
	const css = fs.readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8')

	it('declara color-scheme nos dois temas', () => {
		// Without it the browser paints scrollbars, selects and native tooltips
		// light regardless of the Tailwind classes.
		expect(css).toMatch(/:root\s*\{[^}]*color-scheme:\s*light/s)
		expect(css).toMatch(/\.dark\s*\{[^}]*color-scheme:\s*dark/s)
	})

	it('expõe as variáveis de gráfico nos dois temas', () => {
		// Recharts renders SVG and cannot use `dark:` utilities.
		expect(css).toMatch(/:root\s*\{[^}]*--chart-grid/s)
		expect(css).toMatch(/\.dark\s*\{[^}]*--chart-grid/s)
		expect(css).toMatch(/:root\s*\{[^}]*--chart-axis/s)
		expect(css).toMatch(/\.dark\s*\{[^}]*--chart-axis/s)
	})

	it('não deixa cores fixas nos eixos e grades dos gráficos', () => {
		const charts = ['components/Trainings/TrainingStatsDashboard.jsx',
			'components/Trainings/ParticipantResultsDashboard.jsx',
			'app/dashboard/admin/page.jsx']

		for (const rel of charts) {
			const src = fs.readFileSync(path.join(ROOT, rel), 'utf8')
			const hardcoded = [...src.matchAll(/(?:CartesianGrid|PolarGrid)[^/>]*stroke="(#[0-9a-fA-F]{3,8})"/g)]
			expect(hardcoded.map((m) => m[1]), `${rel} tem grade com cor fixa`).toEqual([])
		}
	})
})
