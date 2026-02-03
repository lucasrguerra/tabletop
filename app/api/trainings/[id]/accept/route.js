import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import acceptInvite from '@/models/Trainings/acceptInvite';

/**
 * POST /api/trainings/[id]/accept
 * Accepts a training invitation
 * Requires authentication and CSRF protection
 */
export const POST = withAuth(withCsrf(async (request, context, session) => {
	try {
		const params = await context.params;
		const { id } = params;
		const user_id = session.user.id;

		// Validate training ID
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					message: 'ID do treinamento não fornecido'
				},
				{ status: 400 }
			);
		}

		// Accept invitation
		const result = await acceptInvite(id, user_id);

		if (!result.success) {
			// Return appropriate status code based on error
			let status = 400;
			if (result.code === 'NOT_INVITED') {
				status = 403;
			} else if (result.code === 'TRAINING_FULL') {
				status = 409;
			}

			return NextResponse.json(
				{
					success: false,
					message: result.message
				},
				{ status }
			);
		}

		return NextResponse.json({
			success: true,
			message: result.message
		});

	} catch (error) {
		console.error('Error in POST /api/trainings/[id]/accept:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao aceitar convite'
			},
			{ status: 500 }
		);
	}
}));
