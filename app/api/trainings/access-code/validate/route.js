import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import { validate } from '@/models/Trainings/code';

/**
 * POST /api/trainings/access-code/validate
 * Validates if a given access code is valid for training sessions
 * Requires authentication and CSRF protection
 */
export const POST = withAuth(withCsrf(async (request, context, session) => {
    try {
        const { access_code } = await request.json();
        const is_valid = await validate(access_code);

        return NextResponse.json({
            success: true,
            is_valid: is_valid
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error in POST /api/trainings/access-code/validate:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao validar código de acesso'
            },
            { status: 500 }
        );
    }
}));