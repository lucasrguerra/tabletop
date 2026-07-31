import fs from 'fs';
import path from 'path';

const DIFFICULTY_ORDER = { Basico: 0, Intermediario: 1, Avancado: 2 };

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

/**
 * Study articles are static files shipped with the application, so the whole
 * index is read from disk once and kept in memory. Before this, every request
 * to the listing re-read and re-parsed every article file.
 */
let article_cache = null;

/** Drops the in-memory index. Used by tests and after content changes. */
export function clearStudyArticleCache() {
	article_cache = null;
}

function loadArticles() {
	if (article_cache) { return article_cache; }

	const studies_base = path.resolve(process.cwd(), 'studies');
	if (!fs.existsSync(studies_base)) {
		article_cache = [];
		return article_cache;
	}

	const articles = [];
	collectArticles(studies_base, studies_base, articles);

	// Stable base order: glossaries last, then category, then difficulty.
	articles.sort((a, b) => {
		if (a.content_type === 'GLOSSARIO' && b.content_type !== 'GLOSSARIO') { return 1; }
		if (a.content_type !== 'GLOSSARIO' && b.content_type === 'GLOSSARIO') { return -1; }
		const catCompare = (a.category?.id || '').localeCompare(b.category?.id || '');
		if (catCompare !== 0) { return catCompare; }
		return (DIFFICULTY_ORDER[a.metadata?.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.metadata?.difficulty] ?? 1);
	});

	article_cache = articles;
	return article_cache;
}

/** Normalises text so search ignores case and accents ("trafego" finds "tráfego"). */
function normalise(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

/** Everything a free-text query should be able to match. */
function searchableText(article) {
	return normalise([
		article.title,
		article.description,
		article.category?.name,
		(article.tags || []).join(' '),
	].join(' '));
}

function parseReadTime(article) {
	const match = String(article.metadata?.estimatedReadTime || '').match(/\d+/);
	return match ? parseInt(match[0], 10) : 0;
}

const SORTERS = {
	relevance: null, // keeps the curated base order
	title: (a, b) => (a.title || '').localeCompare(b.title || '', 'pt-BR'),
	difficulty: (a, b) =>
		(DIFFICULTY_ORDER[a.metadata?.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.metadata?.difficulty] ?? 1),
	readTime: (a, b) => parseReadTime(a) - parseReadTime(b),
	recent: (a, b) =>
		new Date(b.metadata?.lastUpdate || 0) - new Date(a.metadata?.lastUpdate || 0),
};

export const SORT_OPTIONS = Object.keys(SORTERS);

/**
 * Lists study articles with filtering, free-text search, sorting and pagination.
 * Returns metadata only (no content body) for index/listing views.
 *
 * Facet counts are computed over the filtered-but-not-paginated set, so the
 * category chips and sidebar stay accurate while the reader pages through.
 *
 * @param {Object} filters
 * @param {string} [filters.category] - Category ID (e.g. 'NET_ROUT')
 * @param {string} [filters.content_type] - 'CONCEITO'|'PROCEDIMENTO'|'FERRAMENTA'|'GLOSSARIO'
 * @param {string} [filters.difficulty] - 'Basico'|'Intermediario'|'Avancado'
 * @param {string} [filters.search] - Free text over title, description, tags and category
 * @param {string} [filters.sort] - relevance | title | difficulty | readTime | recent
 * @param {number} [filters.page] - 1-based page number
 * @param {number} [filters.limit] - Page size (capped at MAX_PAGE_SIZE)
 */
export default async function getStudyArticles(filters = {}) {
	try {
		const all = loadArticles();

		let filtered = all;

		if (filters.category) {
			filtered = filtered.filter(a => a.category?.id === filters.category);
		}
		if (filters.content_type) {
			filtered = filtered.filter(a => a.content_type === filters.content_type);
		}
		if (filters.difficulty) {
			filtered = filtered.filter(a => a.metadata?.difficulty === filters.difficulty);
		}

		const query = normalise(filters.search).trim();
		if (query) {
			// Every whitespace-separated term must appear somewhere in the article.
			const terms = query.split(/\s+/);
			filtered = filtered.filter(a => {
				const haystack = searchableText(a);
				return terms.every(term => haystack.includes(term));
			});
		}

		// Facets describe the current result set, not the current page.
		const facets = buildFacets(filtered);

		const sorter = SORTERS[filters.sort];
		if (sorter) {
			filtered = [...filtered].sort(sorter);
		}

		const total = filtered.length;
		const limit = clampLimit(filters.limit);
		const total_pages = Math.max(1, Math.ceil(total / limit));
		const page = clampPage(filters.page, total_pages);
		const start = (page - 1) * limit;

		return {
			success: true,
			articles: filtered.slice(start, start + limit),
			pagination: {
				page,
				limit,
				total,
				total_pages,
				has_prev: page > 1,
				has_next: page < total_pages,
			},
			facets,
			// Size of the whole library, ignoring filters — used for "X de Y".
			library_total: all.length,
			count: total,
		};

	} catch (error) {
		console.error('Error listing study articles:', error);
		return {
			success: false,
			message: 'Erro ao listar artigos',
			articles: [],
			pagination: {
				page: 1, limit: DEFAULT_PAGE_SIZE, total: 0,
				total_pages: 1, has_prev: false, has_next: false,
			},
			facets: { categories: {}, content_types: {}, difficulties: {} },
			library_total: 0,
			count: 0,
		};
	}
}

function clampLimit(value) {
	const parsed = parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) { return DEFAULT_PAGE_SIZE; }
	return Math.min(parsed, MAX_PAGE_SIZE);
}

function clampPage(value, total_pages) {
	const parsed = parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) { return 1; }
	return Math.min(parsed, total_pages);
}

function buildFacets(articles) {
	const categories = {};
	const content_types = {};
	const difficulties = {};

	for (const a of articles) {
		if (a.category?.id) { categories[a.category.id] = (categories[a.category.id] || 0) + 1; }
		if (a.content_type) { content_types[a.content_type] = (content_types[a.content_type] || 0) + 1; }
		const d = a.metadata?.difficulty;
		if (d) { difficulties[d] = (difficulties[d] || 0) + 1; }
	}

	return { categories, content_types, difficulties };
}

/**
 * Recursively collects article metadata (without the 'content' field) from all JSON files.
 */
function collectArticles(dir, base_dir, articles) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const full_path = path.join(dir, entry.name);
		const resolved = path.resolve(full_path);

		if (!resolved.startsWith(base_dir + path.sep) && resolved !== base_dir) {
			continue;
		}

		if (entry.isDirectory()) {
			collectArticles(full_path, base_dir, articles);
		} else if (entry.isFile() && entry.name.endsWith('.json')) {
			try {
				const file_content = fs.readFileSync(resolved, 'utf-8');
				const data = JSON.parse(file_content);

				// Return metadata only — exclude the heavy 'content' field
				const { content, ...metadata } = data;
				articles.push(metadata);
			} catch (e) {
				console.warn(`Failed to parse study file: ${resolved}`, e.message);
			}
		}
	}
}
