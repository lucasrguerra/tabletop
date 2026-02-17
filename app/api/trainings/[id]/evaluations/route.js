import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import { withTrainingRole } from '@/utils/trainingAuth';
import { submitEvaluation } from '@/models/Trainings/submitEvaluation';
import { getEvaluations } from '@/models/Trainings/getEvaluations';

/**
 * POST /api/trainings/[id]/evaluations
 * Submit a training evaluation. Only accepted participants can submit, once per training.
 */
export const POST = withAuth(withCsrf(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		const body = await request.json();
		const { overall_rating, scenario_rating, difficulty_rating, would_recommend, comment } = body;

		const result = await submitEvaluation({
			training_id: training.id,
			user_id: session.user.id,
			overall_rating,
			scenario_rating,
			difficulty_rating,
			would_recommend,
			comment,
		});

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: result.statusCode || 400 }
			);
		}

		return NextResponse.json({
			success: true,
			message: result.message,
			evaluation: result.evaluation,
		}, { status: 201 });

	} catch (error) {
		console.error('Error in POST /api/trainings/[id]/evaluations:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao enviar avaliação' },
			{ status: 500 }
		);
	}
}, ['participant'])));

/**
 * GET /api/trainings/[id]/evaluations
 * Get evaluations for a training.
 * - Participants: their own evaluation (to check if already submitted)
 * - Facilitators: all evaluations with aggregated statistics
 */
export const GET = withAuth(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		const result = await getEvaluations({
			training_id: training.id,
			user_id: session.user.id,
			user_role: userRole,
		});

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: result.statusCode || 500 }
			);
		}

		return NextResponse.json({
			success: true,
			...result,
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/trainings/[id]/evaluations:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao buscar avaliações' },
			{ status: 500 }
		);
	}
}, ['participant', 'facilitator']));
