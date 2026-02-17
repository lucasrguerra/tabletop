import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import { withTrainingRole } from '@/utils/trainingAuth';
import { submitAnswer } from '@/models/Trainings/submitAnswer';
import { getResponses } from '@/models/Trainings/getResponses';

/**
 * POST /api/trainings/[id]/responses
 * Submit an answer to a question.
 * Only accepted participants (not facilitators/observers) can submit.
 * The backend reads the correct answer from the scenario file, validates,
 * grades, and stores the result. The correct answer is never sent to the client.
 */
export const POST = withAuth(withCsrf(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		const body = await request.json();
		const { round_id, question_id, answer } = body;

		// Basic input validation
		if (typeof round_id !== 'number' || round_id < 0) {
			return NextResponse.json(
				{ success: false, message: 'round_id deve ser um número >= 0' },
				{ status: 400 }
			);
		}

		if (!question_id || typeof question_id !== 'string') {
			return NextResponse.json(
				{ success: false, message: 'question_id é obrigatório e deve ser uma string' },
				{ status: 400 }
			);
		}

		if (answer === undefined || answer === null) {
			return NextResponse.json(
				{ success: false, message: 'answer é obrigatório' },
				{ status: 400 }
			);
		}

		const result = await submitAnswer({
			training_id: training.id,
			user_id: session.user.id,
			round_id,
			question_id,
			answer,
		});

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: result.statusCode || 400 }
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Resposta enviada com sucesso',
			response: result.response,
		}, { status: 201 });

	} catch (error) {
		console.error('Error in POST /api/trainings/[id]/responses:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao enviar resposta' },
			{ status: 500 }
		);
	}
}, ['participant'])));

/**
 * GET /api/trainings/[id]/responses
 * Get responses for a training.
 * - Participants: see only their own responses
 * - Facilitators: see all participant responses with summary stats
 * 
 * Optional query param: ?round=N to filter by round
 */
export const GET = withAuth(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		const { searchParams } = new URL(request.url);
		const roundParam = searchParams.get('round');

		const params = {
			training_id: training.id,
			user_id: session.user.id,
			user_role: userRole,
		};

		if (roundParam !== null) {
			const roundNum = parseInt(roundParam, 10);
			if (!isNaN(roundNum) && roundNum >= 0) {
				params.round_id = roundNum;
			}
		}

		const result = await getResponses(params);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: result.statusCode || 500 }
			);
		}

		return NextResponse.json({
			success: true,
			responses: result.responses,
			summary: result.summary,
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/trainings/[id]/responses:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao buscar respostas' },
			{ status: 500 }
		);
	}
}, ['participant', 'facilitator']));
