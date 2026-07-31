import { describe, it, expect, beforeEach } from 'vitest'
import getStudyArticles, {
	clearStudyArticleCache, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE,
} from '@/models/Studies/getStudyArticles'

describe('getStudyArticles', () => {
	beforeEach(() => {
		clearStudyArticleCache()
	})

	it('lê a biblioteca de estudos do disco', async () => {
		const res = await getStudyArticles()
		expect(res.success).toBe(true)
		expect(res.library_total).toBeGreaterThan(0)
		expect(res.articles.length).toBeGreaterThan(0)
	})

	it('nunca devolve o corpo do artigo na listagem', async () => {
		const res = await getStudyArticles({ limit: MAX_PAGE_SIZE })
		for (const a of res.articles) {
			expect(a).not.toHaveProperty('content')
			expect(a.id).toBeTruthy()
			expect(a.title).toBeTruthy()
		}
	})

	describe('paginação', () => {
		it('usa o tamanho de página padrão quando não é informado', async () => {
			const res = await getStudyArticles()
			expect(res.pagination.limit).toBe(DEFAULT_PAGE_SIZE)
			expect(res.articles.length).toBeLessThanOrEqual(DEFAULT_PAGE_SIZE)
		})

		it('respeita page e limit', async () => {
			const p1 = await getStudyArticles({ page: 1, limit: 5 })
			const p2 = await getStudyArticles({ page: 2, limit: 5 })

			expect(p1.articles).toHaveLength(5)
			expect(p2.articles).toHaveLength(5)
			expect(p1.pagination.has_prev).toBe(false)
			expect(p2.pagination.has_prev).toBe(true)

			// Páginas não podem se sobrepor.
			const ids1 = p1.articles.map(a => a.id)
			const ids2 = p2.articles.map(a => a.id)
			expect(ids1.some(id => ids2.includes(id))).toBe(false)
		})

		it('percorrer todas as páginas cobre a biblioteca inteira, sem repetir', async () => {
			const first = await getStudyArticles({ limit: 5 })
			const seen = []

			for (let p = 1; p <= first.pagination.total_pages; p++) {
				const page = await getStudyArticles({ page: p, limit: 5 })
				seen.push(...page.articles.map(a => a.id))
			}

			expect(seen).toHaveLength(first.pagination.total)
			expect(new Set(seen).size).toBe(first.pagination.total)
		})

		it('limita o tamanho de página ao máximo permitido', async () => {
			const res = await getStudyArticles({ limit: 5000 })
			expect(res.pagination.limit).toBe(MAX_PAGE_SIZE)
		})

		it('trata page e limit inválidos sem quebrar', async () => {
			for (const bad of ['abc', '-3', '0', '', null, undefined]) {
				const res = await getStudyArticles({ page: bad, limit: bad })
				expect(res.success).toBe(true)
				expect(res.pagination.page).toBe(1)
				expect(res.pagination.limit).toBe(DEFAULT_PAGE_SIZE)
			}
		})

		it('prende a página ao total disponível em vez de devolver vazio', async () => {
			const res = await getStudyArticles({ page: 9999, limit: 5 })
			expect(res.pagination.page).toBe(res.pagination.total_pages)
			expect(res.articles.length).toBeGreaterThan(0)
			expect(res.pagination.has_next).toBe(false)
		})

		it('total_pages é ao menos 1 mesmo sem resultados', async () => {
			const res = await getStudyArticles({ search: 'zzz-nao-existe-zzz' })
			expect(res.pagination.total).toBe(0)
			expect(res.pagination.total_pages).toBe(1)
			expect(res.articles).toEqual([])
		})
	})

	describe('filtros', () => {
		it('filtra por categoria', async () => {
			const res = await getStudyArticles({ category: 'NET_VOL', limit: MAX_PAGE_SIZE })
			expect(res.articles.length).toBeGreaterThan(0)
			for (const a of res.articles) {
				expect(a.category.id).toBe('NET_VOL')
			}
		})

		it('filtra por tipo de conteúdo', async () => {
			const res = await getStudyArticles({ content_type: 'GLOSSARIO', limit: MAX_PAGE_SIZE })
			expect(res.articles.length).toBeGreaterThan(0)
			for (const a of res.articles) {
				expect(a.content_type).toBe('GLOSSARIO')
			}
		})

		it('filtra por dificuldade', async () => {
			const res = await getStudyArticles({ difficulty: 'Basico', limit: MAX_PAGE_SIZE })
			for (const a of res.articles) {
				expect(a.metadata.difficulty).toBe('Basico')
			}
		})

		it('combina filtros', async () => {
			const res = await getStudyArticles({
				category: 'NET_VOL', content_type: 'CONCEITO', limit: MAX_PAGE_SIZE,
			})
			for (const a of res.articles) {
				expect(a.category.id).toBe('NET_VOL')
				expect(a.content_type).toBe('CONCEITO')
			}
		})
	})

	describe('busca', () => {
		it('encontra por termo no título', async () => {
			const all = await getStudyArticles({ limit: MAX_PAGE_SIZE })
			const target = all.articles[0]
			const term = target.title.split(' ')[0]

			const res = await getStudyArticles({ search: term, limit: MAX_PAGE_SIZE })
			expect(res.articles.map(a => a.id)).toContain(target.id)
		})

		it('ignora acentos e caixa', async () => {
			const comAcento = await getStudyArticles({ search: 'tráfego', limit: MAX_PAGE_SIZE })
			const semAcento = await getStudyArticles({ search: 'TRAFEGO', limit: MAX_PAGE_SIZE })
			expect(semAcento.count).toBe(comAcento.count)
		})

		it('exige que todos os termos apareçam', async () => {
			const um = await getStudyArticles({ search: 'dns', limit: MAX_PAGE_SIZE })
			const dois = await getStudyArticles({ search: 'dns zzzzinexistente', limit: MAX_PAGE_SIZE })
			expect(um.count).toBeGreaterThan(0)
			expect(dois.count).toBe(0)
		})

		it('busca vazia ou só espaços não filtra nada', async () => {
			const base = await getStudyArticles({ limit: MAX_PAGE_SIZE })
			for (const q of ['', '   ', null, undefined]) {
				const res = await getStudyArticles({ search: q, limit: MAX_PAGE_SIZE })
				expect(res.count).toBe(base.count)
			}
		})
	})

	describe('ordenação', () => {
		it('ordena por título', async () => {
			const res = await getStudyArticles({ sort: 'title', limit: MAX_PAGE_SIZE })
			const titles = res.articles.map(a => a.title)
			expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'pt-BR')))
		})

		it('ordena por dificuldade, do básico ao avançado', async () => {
			const order = { Basico: 0, Intermediario: 1, Avancado: 2 }
			const res = await getStudyArticles({ sort: 'difficulty', limit: MAX_PAGE_SIZE })
			const values = res.articles.map(a => order[a.metadata?.difficulty] ?? 1)
			expect(values).toEqual([...values].sort((a, b) => a - b))
		})

		it('sort desconhecido não quebra e mantém a ordem base', async () => {
			const base = await getStudyArticles({ limit: MAX_PAGE_SIZE })
			const res = await getStudyArticles({ sort: 'nao-existe', limit: MAX_PAGE_SIZE })
			expect(res.articles.map(a => a.id)).toEqual(base.articles.map(a => a.id))
		})
	})

	describe('facetas', () => {
		// As facetas alimentam os chips de categoria e a barra lateral. Se
		// contassem só a página atual, os números mudariam ao paginar.
		it('contam o resultado filtrado inteiro, não apenas a página', async () => {
			const pagina = await getStudyArticles({ limit: 3 })
			const tudo = await getStudyArticles({ limit: MAX_PAGE_SIZE })

			expect(pagina.articles).toHaveLength(3)
			expect(pagina.facets).toEqual(tudo.facets)

			const somaCategorias = Object.values(pagina.facets.categories)
				.reduce((s, n) => s + n, 0)
			expect(somaCategorias).toBe(pagina.pagination.total)
		})

		it('refletem o filtro aplicado', async () => {
			const res = await getStudyArticles({ category: 'NET_VOL', limit: MAX_PAGE_SIZE })
			expect(Object.keys(res.facets.categories)).toEqual(['NET_VOL'])
		})

		it('library_total ignora filtros', async () => {
			const tudo = await getStudyArticles({ limit: MAX_PAGE_SIZE })
			const filtrado = await getStudyArticles({ category: 'NET_VOL', limit: MAX_PAGE_SIZE })
			expect(filtrado.library_total).toBe(tudo.library_total)
			expect(filtrado.count).toBeLessThan(tudo.count)
		})
	})

	it('o cache devolve o mesmo conjunto entre chamadas', async () => {
		const a = await getStudyArticles({ limit: MAX_PAGE_SIZE })
		const b = await getStudyArticles({ limit: MAX_PAGE_SIZE })
		expect(b.articles.map(x => x.id)).toEqual(a.articles.map(x => x.id))
	})
})
