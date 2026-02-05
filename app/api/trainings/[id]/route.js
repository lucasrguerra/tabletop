import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withTrainingRole } from '@/utils/trainingAuth';

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
