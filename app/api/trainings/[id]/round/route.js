import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import { withTrainingRole } from '@/utils/trainingAuth';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import readScenario from '@/models/Trainings/readScenario';

/**
 * PATCH /api/trainings/[id]/round
 * Updates the current round of a training session
 * Only facilitators can change rounds
 * Supports actions: 'next', 'previous', 'set' (with round number)
 */
export const PATCH = withAuth(withCsrf(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		// Only facilitators can change rounds
		if (userRole !== 'facilitator') {
			return NextResponse.json(
				{
					success: false,
					message: 'Apenas facilitadores podem alterar a rodada'
				},
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { action, round } = body;

		// Validate action
		const validActions = ['next', 'previous', 'set'];
		if (!action || !validActions.includes(action)) {
			return NextResponse.json(
				{
					success: false,
					message: 'Ação inválida. Use: next, previous ou set'
				},
				{ status: 400 }
			);
		}

		await connectDatabase();

		// Get current training with scenario data (training.id is a string from filtered data)
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

		// Read scenario to get total rounds
		const scenarioResult = await readScenario(
			currentTraining.scenario.id,
			currentTraining.scenario.category,
			currentTraining.scenario.type
		);

		if (!scenarioResult.success) {
			return NextResponse.json(
				{
					success: false,
					message: 'Erro ao carregar dados do cenário'
				},
				{ status: 500 }
			);
		}

		const totalRounds = scenarioResult.scenario.rounds?.length || 0;
		let newRound = currentTraining.current_round;

		// Calculate new round based on action
		if (action === 'next') {
			newRound = Math.min(currentTraining.current_round + 1, totalRounds - 1);
		} else if (action === 'previous') {
			newRound = Math.max(currentTraining.current_round - 1, 0);
		} else if (action === 'set') {
			if (typeof round !== 'number' || round < 0 || round >= totalRounds) {
				return NextResponse.json(
					{
						success: false,
						message: `Rodada inválida. Deve estar entre 0 e ${totalRounds - 1}`
					},
					{ status: 400 }
				);
			}
			newRound = round;
		}

		// Check if round actually changed
		if (newRound === currentTraining.current_round) {
			return NextResponse.json(
				{
					success: true,
					message: 'Rodada já está na posição solicitada',
					training: {
						_id: currentTraining._id,
						current_round: currentTraining.current_round,
						total_rounds: totalRounds
					}
				},
				{ status: 200 }
			);
		}

		// Update training: reset round timer and auto-start it when round changes
		const updatedTraining = await Training.findByIdAndUpdate(
			training.id,
			{ 
				$set: { 
					current_round: newRound,
					// Reset round timer and auto-start
					'round_timer.started_at': new Date(),
					'round_timer.elapsed_time': 0,
					'round_timer.is_paused': false
				} 
			},
			{ new: true, runValidators: true }
		);

		return NextResponse.json({
			success: true,
			message: 'Rodada atualizada com sucesso',
			training: {
				_id: updatedTraining._id,
				current_round: updatedTraining.current_round,
				total_rounds: totalRounds,
				current_round_data: scenarioResult.scenario.rounds[newRound]
			}
		}, { status: 200 });

	} catch (error) {
		console.error('Error in PATCH /api/trainings/[id]/round:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao atualizar rodada do treinamento'
			},
			{ status: 500 }
		);
	}
}, ['facilitator'])));
