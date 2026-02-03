import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getPendingInvites from '@/models/Trainings/getPendingInvites';

/**
 * GET /api/trainings/invites
 * Gets all pending training invitations for the authenticated user
 * Requires authentication
 */
export const GET = withAuth(async (request, context, session) => {
	try {
		const user_id = session.user.id;

		// Get pending invites
		const result = await getPendingInvites(user_id);

		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					message: result.message
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			invites: result.invites
		});

	} catch (error) {
		console.error('Error in GET /api/trainings/invites:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar convites'
			},
			{ status: 500 }
		);
	}
});
