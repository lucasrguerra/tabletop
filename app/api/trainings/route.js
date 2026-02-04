import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getUserTrainings from '@/models/Trainings/getUserTrainings';

/**
 * GET /api/trainings
 * Retrieves all trainings that the user is participating in
 * Requires authentication
 */
export const GET = withAuth(async (request, context, session) => {
	try {
		const user_id = session.user.id;

		// Extract pagination parameters from query string
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page')) || 1;
		const limit = parseInt(searchParams.get('limit')) || 10;
		const status = searchParams.get('status') || 'all';
		const participation_type = searchParams.get('participation_type') || 'all';

		// Get trainings for user with pagination
		const result = await getUserTrainings(user_id, { page, limit, status, participation_type });

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
			trainings: result.trainings,
			pagination: result.pagination
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/trainings:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar treinamentos'
			},
			{ status: 500 }
		);
	}
});
