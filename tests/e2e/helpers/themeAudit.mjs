/**
 * Walks the rendered page looking for surfaces that fight the active theme.
 *
 * This is the check that would have caught the dark-mode regressions: elements
 * whose Tailwind classes never got a `dark:` counterpart keep their light
 * background and become white boxes on a dark page.
 *
 * Runs inside the browser, so it must stay self-contained.
 */
export function auditTheme(theme) {
	// Tailwind v4 emits oklch/lab, and Chromium reports computed colours in the
	// authored colour space. Painting onto a canvas makes the browser itself do
	// the conversion, so any CSS colour syntax resolves to plain RGBA.
	const canvas = document.createElement('canvas')
	canvas.width = canvas.height = 1
	const ctx = canvas.getContext('2d', { willReadFrequently: true })
	const cache = new Map()

	const parse = (color) => {
		if (!color || color === 'transparent' || color === 'none') return null
		if (cache.has(color)) return cache.get(color)

		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = '#000'
		ctx.fillStyle = color
		// An unparseable value leaves fillStyle at the previous colour; bail out
		// rather than reporting a bogus black surface.
		if (ctx.fillStyle === '#000000' && !/^(#000000|#000|black|rgba?\(0, ?0, ?0)/.test(color)) {
			cache.set(color, null)
			return null
		}
		ctx.fillRect(0, 0, 1, 1)
		const [r, g, b, alpha] = ctx.getImageData(0, 0, 1, 1).data
		const a = alpha / 255
		const out = a < 0.15 ? null : { r, g, b, a }
		cache.set(color, out)
		return out
	}
	const lum = ({ r, g, b }) => {
		const f = (v) => {
			v /= 255
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
		}
		return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
	}
	const contrast = (a, b) => {
		const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
		return (x + 0.05) / (y + 0.05)
	}

	const surfaces = []
	const text = []
	const seen = new Set()

	for (const el of document.querySelectorAll('body *')) {
		const rect = el.getBoundingClientRect()
		if (rect.width < 8 || rect.height < 8) continue
		const cs = getComputedStyle(el)
		if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.1) continue

		const label =
			el.tagName.toLowerCase() +
			(typeof el.className === 'string' && el.className
				? '.' + el.className.trim().split(/\s+/).slice(0, 4).join('.')
				: '')

		// Only checked in dark mode. The failure this catches is a missing
		// `dark:` variant leaving a light surface on a dark page. The mirror
		// case has no equivalent bug: dark surfaces in light mode (the footer,
		// code blocks, dark hero bands) are deliberate design.
		const bg = theme === 'dark' ? parse(cs.backgroundColor) : null
		if (bg) {
			const spread = Math.max(bg.r, bg.g, bg.b) - Math.min(bg.r, bg.g, bg.b)
			// Saturated brand fills (blue-600 buttons and the like) are meant to
			// look the same in both themes, so only near-neutral surfaces count.
			if (spread < 40 && lum(bg) > 0.55) {
				const key = 'bg|' + label + '|' + cs.backgroundColor
				if (!seen.has(key)) {
					seen.add(key)
					surfaces.push({
						element: label,
						background: cs.backgroundColor,
						width: Math.round(rect.width),
						height: Math.round(rect.height),
					})
				}
			}
		}

		// Contrast is only meaningful for a node rendering its own text.
		const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
		if (!own) continue
		const content = (el.textContent || '').trim()
		if (!content) continue

		const fg = parse(cs.color)
		if (!fg) continue

		// Near-white ink is only ever used on a coloured fill or gradient. That
		// fill is often painted by an absolutely positioned sibling rather than
		// an ancestor, which the walk below cannot see, so it would report a
		// false white-on-white.
		if (lum(fg) > 0.8) continue

		// Walk up for the nearest opaque backdrop. A gradient is a
		// background-image rather than a background-color, and white text on a
		// gradient is intentional, so those are skipped instead of reported.
		let node = el
		let backdrop = null
		let gradient = false
		while (node && !backdrop && !gradient) {
			const style = getComputedStyle(node)
			if (style.backgroundImage && style.backgroundImage !== 'none') gradient = true
			else {
				const c = parse(style.backgroundColor)
				if (c && c.a > 0.85) backdrop = c
			}
			node = node.parentElement
		}
		if (gradient || !backdrop) continue

		// Deliberately below WCAG AA (4.5): this suite guards theme regressions,
		// not accessibility. The app's muted token (`text-slate-400`) sits at
		// 2.63 on white by design and predates these tests, so enforcing AA here
		// would fail on day one for reasons unrelated to theming. The floor
		// catches text that is effectively invisible against its own backdrop.
		const ratio = contrast(fg, backdrop)
		if (ratio < 2) {
			const key = 'tx|' + label + '|' + cs.color
			if (!seen.has(key)) {
				seen.add(key)
				text.push({
					element: label,
					color: cs.color,
					background: `rgb(${backdrop.r}, ${backdrop.g}, ${backdrop.b})`,
					ratio: +ratio.toFixed(2),
					text: content.slice(0, 60),
				})
			}
		}
	}

	return { surfaces, text }
}

/** Renders findings as a readable assertion message. */
export function formatFindings({ surfaces, text }) {
	return [
		...surfaces.map(
			(s) => `  [FUNDO] ${s.background} ${s.width}x${s.height} em ${s.element}`
		),
		...text.map(
			(t) => `  [TEXTO] contraste ${t.ratio}: ${t.color} sobre ${t.background} — "${t.text}" em ${t.element}`
		),
	].join('\n')
}
