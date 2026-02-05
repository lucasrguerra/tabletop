import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { generate } from '@/models/Trainings/accessCode';

/**
 * GET /api/trainings/access-code/generate
 * Generates a new unique access code for training sessions
 * Requires authentication
 */
export const GET = withAuth(async (request, context, session) => {
    try {
        const access_code = await generate();
        
        return NextResponse.json({
            success: true,
            access_code: access_code
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error in GET /api/trainings/access-code/generate:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao gerar código de acesso'
            },
            { status: 500 }
        );
    }
});
