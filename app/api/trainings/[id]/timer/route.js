import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withTrainingRole } from '@/utils/trainingAuth';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * PATCH /api/trainings/[id]/timer
 * Controls the round timer (manual timer controlled by facilitator)
 * Only facilitators can control the round timer
 * Supports actions: 'start', 'pause', 'reset'
 */
export const PATCH = withAuth(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		// Only facilitators can control round timer
		if (userRole !== 'facilitator') {
			return NextResponse.json(
				{
					success: false,
					message: 'Apenas facilitadores podem controlar o timer da rodada'
				},
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { action } = body;

		// Validate action
		const validActions = ['start', 'pause', 'reset'];
		if (!action || !validActions.includes(action)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Ação inválida. Use: start, pause ou reset'
				},
				{ status: 400 }
			);
		}

		await connectDatabase();

		// Get current training
		const currentTraining = await Training.findById(training.id);
		if (!currentTraining) {
			return NextResponse.json(
				{
					success: false,
					message: 'Treinamento não encontrado'
				},
				{ status: 404 }
			);
		}

		const updates = {};

		// Handle timer actions
		if (action === 'start') {
			// Start or resume round timer
			if (currentTraining.round_timer.is_paused) {
				updates['round_timer.started_at'] = new Date();
				updates['round_timer.is_paused'] = false;
			}
		} else if (action === 'pause') {
			// Pause round timer
			if (!currentTraining.round_timer.is_paused && currentTraining.round_timer.started_at) {
				const pauseTime = new Date();
				const sessionDuration = pauseTime - new Date(currentTraining.round_timer.started_at);
				updates['round_timer.elapsed_time'] = currentTraining.round_timer.elapsed_time + sessionDuration;
				updates['round_timer.is_paused'] = true;
				updates['round_timer.started_at'] = null;
			}
		} else if (action === 'reset') {
			// Reset round timer
			updates['round_timer.started_at'] = null;
			updates['round_timer.elapsed_time'] = 0;
			updates['round_timer.is_paused'] = true;
		}

		// Update training
		const updatedTraining = await Training.findByIdAndUpdate(
			training.id,
			{ $set: updates },
			{ new: true, runValidators: true }
		);

		return NextResponse.json({
			success: true,
			message: 'Timer da rodada atualizado com sucesso',
			round_timer: updatedTraining.round_timer
		}, { status: 200 });

	} catch (error) {
		console.error('Error in PATCH /api/trainings/[id]/timer:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao controlar timer da rodada'
			},
			{ status: 500 }
		);
	}
}, ['facilitator']));
