import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getOneTraining from '@/models/Trainings/getOne';

/**
 * GET /api/trainings/[id]
 * Retrieves a specific training session with FULL data
 * Requires authentication
 * Only accessible to FACILITATORS of the training
 * Note: Participants should use /api/trainings/[id]/participant
 * Note: For role checking only, use /api/trainings/[id]/role
 */
export const GET = withAuth(async (request, context, session) => {
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

		// Get training data
		const result = await getOneTraining(id, user_id);

		if (!result.success) {
			// Return appropriate status code based on error
			const status = result.code === 'NOT_PARTICIPANT' ? 403 : 404;
			return NextResponse.json(
				{
					success: false,
					message: result.message
				},
				{ status }
			);
		}

		// Return full training data (only for facilitators)
		return NextResponse.json({
			success: true,
			training: result.training,
			user_role: result.user_role,
			is_facilitator: result.is_facilitator
		});

	} catch (error) {
		console.error('Error in GET /api/trainings/[id]:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar treinamento'
			},
			{ status: 500 }
		);
	}
});
