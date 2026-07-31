import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getStudyArticles from '@/models/Studies/getStudyArticles';

/**
 * GET /api/studies
 *
 * Lists study articles, paginated.
 * Query params: category, content_type, difficulty, search, sort, page, limit
 *
 * Requires authentication.
 */
export const GET = withAuth(async (request) => {
	try {
		const { searchParams } = new URL(request.url);

		const filters = {};
		for (const key of ['category', 'content_type', 'difficulty', 'search', 'sort']) {
			const value = searchParams.get(key);
			if (value) { filters[key] = value; }
		}

		// Invalid page/limit values fall back to defaults inside the model.
		filters.page = searchParams.get('page');
		filters.limit = searchParams.get('limit');

		const result = await getStudyArticles(filters);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			articles: result.articles,
			pagination: result.pagination,
			facets: result.facets,
			library_total: result.library_total,
			count: result.count,
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/studies:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao listar artigos de estudo' },
			{ status: 500 }
		);
	}
});
