import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import getAvailableTrainings from '@/models/Trainings/getAvailableTrainings';
import joinTraining from '@/models/Trainings/joinTraining';

/**
 * GET /api/trainings/access
 * Retrieves all available trainings that the user can join
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

		// Get available trainings for user
		const result = await getAvailableTrainings(user_id, { page, limit, status });

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
		console.error('Error in GET /api/trainings/access:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar treinamentos disponíveis'
			},
			{ status: 500 }
		);
	}
});

/**
 * POST /api/trainings/access
 * Joins a training (open or with access code)
 * Requires authentication
 */
export const POST = withAuth(withCsrf(async (request, context, session) => {
	try {
		const user_id = session.user.id;
		const body = await request.json();

		// Extract training_id and optional access_code
		const { training_id, access_code } = body;

		// Either training_id or access_code must be provided
		if (!training_id && !access_code) {
			return NextResponse.json(
				{
					success: false,
					message: 'ID do treinamento ou código de acesso é obrigatório'
				},
				{ status: 400 }
			);
		}

		// Join training
		const result = await joinTraining(training_id, user_id, { access_code });

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
		console.error('Error in POST /api/trainings/access:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao entrar no treinamento'
			},
			{ status: 500 }
		);
	}
}));
