import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import rateLimit, { rateLimiters, _resetRateLimitState } from '@/utils/rateLimit'

function makeRequest(url = 'http://localhost/api/test', ip = '203.0.113.10') {
	const headers = new Headers()
	headers.set('x-forwarded-for', ip)
	return new Request(url, { method: 'POST', headers })
}

describe('rateLimit', () => {
	beforeEach(() => {
		_resetRateLimitState()
		vi.useRealTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('permite requisições até o limite configurado', async () => {
		const config = { max_requests: 3, window_ms: 1000 }
		for (let i = 0; i < 3; i++) {
			expect(await rateLimit(makeRequest(), config)).toBeNull()
		}
	})

	it('bloqueia com 429 ao ultrapassar o limite', async () => {
		const config = { max_requests: 2, window_ms: 1000 }
		await rateLimit(makeRequest(), config)
		await rateLimit(makeRequest(), config)

		const blocked = await rateLimit(makeRequest(), config)
		expect(blocked).not.toBeNull()
		expect(blocked.status).toBe(429)
		expect(blocked.headers.get('Retry-After')).toBeTruthy()
	})

	// Regressão: a checagem de expiração lia `limit_data.resetTime`, mas a entrada
	// é gravada como `reset_time`. A comparação era sempre `now > undefined` === false,
	// então a janela nunca reiniciava pelo caminho da requisição e o contador
	// crescia indefinidamente, mantendo o cliente bloqueado além de window_ms.
	it('reinicia a janela após window_ms expirar', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

		const config = { max_requests: 2, window_ms: 1000 }
		expect(await rateLimit(makeRequest(), config)).toBeNull()
		expect(await rateLimit(makeRequest(), config)).toBeNull()
		expect((await rateLimit(makeRequest(), config)).status).toBe(429)

		// Avança para além da janela — o cliente deve poder requisitar de novo.
		vi.advanceTimersByTime(1500)

		expect(await rateLimit(makeRequest(), config)).toBeNull()
		expect(await rateLimit(makeRequest(), config)).toBeNull()
		expect((await rateLimit(makeRequest(), config)).status).toBe(429)
	})

	it('não vaza contagem entre URLs diferentes', async () => {
		const config = { max_requests: 1, window_ms: 1000 }
		expect(await rateLimit(makeRequest('http://localhost/api/a'), config)).toBeNull()
		expect(await rateLimit(makeRequest('http://localhost/api/b'), config)).toBeNull()
	})

	it('não vaza contagem entre clientes diferentes', async () => {
		const config = { max_requests: 1, window_ms: 1000 }
		expect(await rateLimit(makeRequest('http://localhost/api/a', '203.0.113.1'), config)).toBeNull()
		expect(await rateLimit(makeRequest('http://localhost/api/a', '203.0.113.2'), config)).toBeNull()
	})

	it('aceita identificador customizado no lugar do IP', async () => {
		const config = { max_requests: 1, window_ms: 1000 }
		expect(await rateLimit(makeRequest(), config, 'user-1')).toBeNull()
		expect(await rateLimit(makeRequest(), config, 'user-2')).toBeNull()
		expect((await rateLimit(makeRequest(), config, 'user-1')).status).toBe(429)
	})

	it('ignora IPs privados no x-forwarded-for e usa o primeiro IP público', async () => {
		const config = { max_requests: 1, window_ms: 1000 }
		const headers = new Headers()
		headers.set('x-forwarded-for', '10.0.0.1, 198.51.100.7')
		const req = () => new Request('http://localhost/api/test', { method: 'POST', headers })

		expect(await rateLimit(req(), config)).toBeNull()
		// Mesmo IP público → deve contar como o mesmo cliente.
		expect((await rateLimit(req(), config)).status).toBe(429)
	})

	it('rateLimiters.strict aplica 5 requisições', async () => {
		for (let i = 0; i < 5; i++) {
			expect(await rateLimiters.strict(makeRequest(), 'strict-user')).toBeNull()
		}
		expect((await rateLimiters.strict(makeRequest(), 'strict-user')).status).toBe(429)
	})
})
