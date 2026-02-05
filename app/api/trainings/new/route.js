import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import createTraining from '@/models/Trainings/create';

/**
 * POST /api/trainings/new
 * Creates a new training session
 * Requires authentication and CSRF protection
 */
export const POST = withAuth(withCsrf(async (request, context, session) => {
    try {
        const body = await request.json();
        
        // Extract user ID from authenticated session
        const user_id = session.user.id;
        
        // Validate required fields
        if (!body.name || !body.description || !body.scenario.category || !body.scenario.type || !body.scenario.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Campos obrigatórios ausentes'
                },
                { status: 400 }
            );
        }

        // Prepare data for training creation
        const training_data = {
            name: body.name,
            description: body.description,
            user_id: user_id,
            scenario: {
                id: body.scenario.id,
                category: body.scenario.category,
                type: body.scenario.type
            },
            access_type: body.access_type || 'open',
            access_code: body.access_code,
            max_participants: body.max_participants || 15
        };

        // Create training
        const result = await createTraining(training_data);
        
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json({
            success: true,
            training: result.training,
            message: result.message
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error in POST /api/trainings:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao criar treinamento'
            },
            { status: 500 }
        );
    }
}));
