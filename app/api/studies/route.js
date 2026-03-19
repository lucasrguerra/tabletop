import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getStudyArticles from '@/models/Studies/getStudyArticles';

/**
 * GET /api/studies
 * Lists study articles with optional filters.
 * Query params: category, content_type, difficulty
 * Requires authentication
 */
export const GET = withAuth(async (request) => {
    try {
        const { searchParams } = new URL(request.url);

        const filters = {};
        const category = searchParams.get('category');
        const content_type = searchParams.get('content_type');
        const difficulty = searchParams.get('difficulty');

        if (category) filters.category = category;
        if (content_type) filters.content_type = content_type;
        if (difficulty) filters.difficulty = difficulty;

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
            count: result.count
        }, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/studies:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao listar artigos de estudo' },
            { status: 500 }
        );
    }
});
