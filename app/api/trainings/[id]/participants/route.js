import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import inviteParticipant from '@/models/Trainings/inviteParticipant';

/**
 * POST /api/trainings/[id]/participants
 * Invites a user to participate in a training
 * Requires authentication and facilitator role
 */
export const POST = withAuth(async (request, context, session) => {
    try {
        const params = await context.params;
        const user_id = session.user.id;
        const training_id = params.id;
        const body = await request.json();

        // Extract invitation data
        const { nickname, role } = body;

        if (!nickname || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Nickname e papel são obrigatórios'
                },
                { status: 400 }
            );
        }

        // Invite participant
        const result = await inviteParticipant(training_id, nickname, role, user_id);

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
            message: result.message,
            participant: result.participant
        }, { status: 200 });

    } catch (error) {
        console.error('Error in POST /api/trainings/[id]/participants:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao enviar convite'
            },
            { status: 500 }
        );
    }
});
