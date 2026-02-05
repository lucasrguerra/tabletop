import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getPendingInvites from '@/models/Trainings/getPendingInvites';
import respondToInvite from '@/models/Trainings/respondToInvite';

/**
 * GET /api/trainings/invites
 * Retrieves all pending invitations for the authenticated user
 * Requires authentication
 */
export const GET = withAuth(async (request, context, session) => {
	try {
		const user_id = session.user.id;

		// Get pending invitations
		const result = await getPendingInvites(user_id);

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
			invitations: result.invitations
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/trainings/invites:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar convites pendentes'
			},
			{ status: 500 }
		);
	}
});

/**
 * POST /api/trainings/invites
 * Responds to a training invitation (accept or decline)
 * Requires authentication
 */
export const POST = withAuth(async (request, context, session) => {
	try {
		const user_id = session.user.id;
		const body = await request.json();

		// Extract response data
		const { training_id, action } = body;

		if (!training_id || !action) {
			return NextResponse.json(
				{
					success: false,
					message: 'ID do treinamento e ação são obrigatórios'
				},
				{ status: 400 }
			);
		}

		// Respond to invitation
		const result = await respondToInvite(training_id, user_id, action);

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
			training: result.training
		}, { status: 200 });

	} catch (error) {
		console.error('Error in POST /api/trainings/invites:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao responder convite'
			},
			{ status: 500 }
		);
	}
});
