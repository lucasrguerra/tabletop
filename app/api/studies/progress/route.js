import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import getUserStudyProgress from '@/models/Studies/getUserStudyProgress';
import markArticleRead from '@/models/Studies/markArticleRead';

const VALID_CONTENT_TYPES = ['CONCEITO', 'PROCEDIMENTO', 'FERRAMENTA', 'GLOSSARIO'];
const VALID_CATEGORIES = ['GOV_LEGAL', 'NET_ROUT', 'NET_VOL', 'PHY_L2', 'SCI_DATA', 'SEC_SYS'];
const VALID_ACTIONS = ['read', 'complete'];

/**
 * GET /api/studies/progress
 * Returns the authenticated user's study progress.
 */
export const GET = withAuth(async (request, context, session) => {
    try {
        const user_id = session.user.id;
        const result = await getUserStudyProgress(user_id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            progress: result.progress,
            articles: result.articles
        }, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/studies/progress:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao buscar progresso de estudos' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/studies/progress
 * Marks a study article as read or completed.
 * Body: { article_id, category, content_type, action: 'read' | 'complete' }
 */
export const POST = withAuth(withCsrf(async (request, context, session) => {
    try {
        const user_id = session.user.id;
        const body = await request.json();
        const { article_id, category, content_type, action } = body;

        // Validate required fields
        if (!article_id || typeof article_id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(article_id)) {
            return NextResponse.json(
                { success: false, message: 'article_id inválido' },
                { status: 400 }
            );
        }

        if (!VALID_CATEGORIES.includes(category)) {
            return NextResponse.json(
                { success: false, message: 'category inválida' },
                { status: 400 }
            );
        }

        if (!VALID_CONTENT_TYPES.includes(content_type)) {
            return NextResponse.json(
                { success: false, message: 'content_type inválido' },
                { status: 400 }
            );
        }

        if (!VALID_ACTIONS.includes(action)) {
            return NextResponse.json(
                { success: false, message: 'action deve ser "read" ou "complete"' },
                { status: 400 }
            );
        }

        const result = await markArticleRead(user_id, { article_id, category, content_type, action });

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            progress: result.progress
        }, { status: 200 });

    } catch (error) {
        console.error('Error in POST /api/studies/progress:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao registrar progresso' },
            { status: 500 }
        );
    }
}));
