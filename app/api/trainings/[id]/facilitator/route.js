import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import addFacilitator from '@/models/Trainings/addFacilitator';

/**
 * POST /api/trainings/[id]/facilitator
 * Adds a facilitator to the training session
 * Requires authentication and CSRF protection
 * Only accessible to current facilitators
 */
export const POST = withAuth(withCsrf(async (request, context, session) => {
	try {
		const params = await context.params;
		const { id } = params;
		const user_id = session.user.id;
		const body = await request.json();

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

		// Validate nickname
		if (!body.nickname) {
			return NextResponse.json(
				{
					success: false,
					message: 'Nickname é obrigatório'
				},
				{ status: 400 }
			);
		}

		// Add facilitator
		const result = await addFacilitator(id, user_id, body.nickname);

		if (!result.success) {
			// Return appropriate status code based on error
			let status = 400;
			if (result.code === 'NOT_FACILITATOR') {
				status = 403;
			} else if (result.code === 'USER_NOT_FOUND') {
				status = 404;
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
			message: result.message,
			facilitator: result.facilitator
		});

	} catch (error) {
		console.error('Error in POST /api/trainings/[id]/facilitator:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao adicionar facilitador'
			},
			{ status: 500 }
		);
	}
}));
