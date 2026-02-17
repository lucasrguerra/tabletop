import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import { withTrainingRole } from '@/utils/trainingAuth';
import deleteTraining from '@/models/Trainings/deleteTraining';

/**
 * GET /api/trainings/[id]
 * Retrieves a specific training with role-based data filtering
 * Returns different data based on user's role (facilitator/participant/observer)
 * Requires authentication and training participation
 */
export const GET = withAuth(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		// Training data is already filtered by withTrainingRole middleware
		// based on the user's role (facilitator/participant/observer)
		
		return NextResponse.json({
			success: true,
			training,
			userRole
		}, { status: 200 });

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
}));

/**
 * DELETE /api/trainings/[id]
 * Deletes a training and all associated responses and evaluations
 * Only facilitators can delete trainings
 */
export const DELETE = withAuth(withCsrf(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		const result = await deleteTraining(training.id, session.user.id);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			success: true,
			message: result.message
		}, { status: 200 });

	} catch (error) {
		console.error('Error in DELETE /api/trainings/[id]:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao deletar treinamento'
			},
			{ status: 500 }
		);
	}
}, ['facilitator'])));
