import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import readStudyArticle from '@/models/Studies/readStudyArticle';

/**
 * GET /api/studies/[id]
 * Returns a single study article with full content.
 * Requires authentication
 */
export const GET = withAuth(async (request, context) => {
    try {
        const { id } = await context.params;

        const result = await readStudyArticle(id);

        if (!result.success) {
            const status = result.message === 'Artigo não encontrado' ? 404 : 400;
            return NextResponse.json(
                { success: false, message: result.message },
                { status }
            );
        }

        return NextResponse.json({
            success: true,
            article: result.article
        }, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/studies/[id]:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao buscar artigo de estudo' },
            { status: 500 }
        );
    }
});
