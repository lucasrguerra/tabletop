import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import declineInvite from '@/models/Trainings/declineInvite';

/**
 * POST /api/trainings/[id]/decline
 * Declines a training invitation
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

		// Decline invitation
		const result = await declineInvite(id, user_id);

		if (!result.success) {
			// Return appropriate status code based on error
			let status = 400;
			if (result.code === 'NOT_INVITED') {
				status = 403;
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
		console.error('Error in POST /api/trainings/[id]/decline:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao recusar convite'
			},
			{ status: 500 }
		);
	}
}));
