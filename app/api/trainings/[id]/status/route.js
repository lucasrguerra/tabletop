import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import { withTrainingRole } from '@/utils/trainingAuth';
import Training from '@/database/schemas/Training';
import Response from '@/database/schemas/Response';
import Evaluation from '@/database/schemas/Evaluation';
import connectDatabase from '@/database/database';

/**
 * PATCH /api/trainings/[id]/status
 * Updates the status of a training session
 * Only facilitators can change training status
 * Handles status transitions: not_started -> active -> paused/completed
 */
export const PATCH = withAuth(withCsrf(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		// Only facilitators can change training status
		if (userRole !== 'facilitator') {
			return NextResponse.json(
				{
					success: false,
					message: 'Apenas facilitadores podem alterar o status do treinamento'
				},
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { status: newStatus } = body;

		// Validate new status
		const validStatuses = ['not_started', 'active', 'paused', 'completed'];
		if (!newStatus || !validStatuses.includes(newStatus)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Status inválido'
				},
				{ status: 400 }
			);
		}

		await connectDatabase();

		// Get current training (training.id is a string from filtered data)
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

		const updates = {
			status: newStatus
		};

		// Handle status-specific updates
		if (newStatus === 'active') {
			// Starting or resuming training
			if (currentTraining.status === 'not_started') {
				const now = new Date();
				updates.started_at = now;
				updates['training_timer.started_at'] = now;
				updates['training_timer.is_paused'] = false;
				// Also start round timer since the first round begins immediately
				updates['round_timer.started_at'] = now;
				updates['round_timer.elapsed_time'] = 0;
				updates['round_timer.is_paused'] = false;
			} else if (currentTraining.status === 'paused') {
				// Resuming from pause
				updates['training_timer.started_at'] = new Date();
				updates['training_timer.is_paused'] = false;
			}
		} else if (newStatus === 'paused') {
			// Pausing training
			const pauseTime = new Date();

			if (currentTraining.status === 'active' && currentTraining.training_timer.started_at) {
				// Calculate elapsed time and update
				const sessionDuration = pauseTime - new Date(currentTraining.training_timer.started_at);
				updates['training_timer.elapsed_time'] = currentTraining.training_timer.elapsed_time + sessionDuration;
				updates['training_timer.is_paused'] = true;
				updates['training_timer.started_at'] = null;
			}

			// Also pause round timer if it's running
			if (!currentTraining.round_timer.is_paused && currentTraining.round_timer.started_at) {
				const roundDuration = pauseTime - new Date(currentTraining.round_timer.started_at);
				updates['round_timer.elapsed_time'] = currentTraining.round_timer.elapsed_time + roundDuration;
				updates['round_timer.is_paused'] = true;
				updates['round_timer.started_at'] = null;
			}
		} else if (newStatus === 'completed') {
			// Completing training
			const endTime = new Date();

			if (!currentTraining.completed_at) {
				updates.completed_at = endTime;
			}
			
			// If training timer is running, stop it
			if (currentTraining.status === 'active' && currentTraining.training_timer.started_at) {
				const sessionDuration = endTime - new Date(currentTraining.training_timer.started_at);
				updates['training_timer.elapsed_time'] = currentTraining.training_timer.elapsed_time + sessionDuration;
			}
			
			updates['training_timer.is_paused'] = true;
			updates['training_timer.started_at'] = null;

			// Also stop round timer if it's running
			if (!currentTraining.round_timer.is_paused && currentTraining.round_timer.started_at) {
				const roundDuration = endTime - new Date(currentTraining.round_timer.started_at);
				updates['round_timer.elapsed_time'] = currentTraining.round_timer.elapsed_time + roundDuration;
			}
			updates['round_timer.is_paused'] = true;
			updates['round_timer.started_at'] = null;
		} else if (newStatus === 'not_started') {
			// Resetting training (only from completed)
			if (currentTraining.status === 'completed') {
				updates.started_at = null;
				updates.completed_at = null;
				updates.current_round = 0;
				updates['training_timer.started_at'] = null;
				updates['training_timer.elapsed_time'] = 0;
				updates['training_timer.is_paused'] = true;
				// Also reset round timer
				updates['round_timer.started_at'] = null;
				updates['round_timer.elapsed_time'] = 0;
				updates['round_timer.is_paused'] = true;

				// Clear all responses when resetting training
				await Response.deleteMany({ training_id: training.id });
				// Clear all evaluations when resetting training
				await Evaluation.deleteMany({ training_id: training.id });
			} else {
				return NextResponse.json(
					{
						success: false,
						message: 'Só é possível resetar treinamentos concluídos'
					},
					{ status: 400 }
				);
			}
		}

		// Update training
		const updatedTraining = await Training.findByIdAndUpdate(
			training.id,
			{ $set: updates },
			{ new: true, runValidators: true }
		);

		return NextResponse.json({
			success: true,
			message: 'Status atualizado com sucesso',
			training: {
				_id: updatedTraining._id,
				status: updatedTraining.status,
				started_at: updatedTraining.started_at,
				completed_at: updatedTraining.completed_at,
				current_round: updatedTraining.current_round,
				training_timer: updatedTraining.training_timer,
				round_timer: updatedTraining.round_timer
			}
		}, { status: 200 });

	} catch (error) {
		console.error('Error in PATCH /api/trainings/[id]/status:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao atualizar status do treinamento'
			},
			{ status: 500 }
		);
	}
}, ['facilitator'])));
