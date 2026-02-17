import Training from '@/database/schemas/Training';
import User from '@/database/schemas/User';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';
import createNotification from '@/models/Notifications/create';

/**
 * Responds to a training invitation (accept or decline)
 * 
 * @param {string} training_id - ID of the training
 * @param {string} user_id - ID of the user responding to invitation
 * @param {string} action - Action to take ('accept' or 'decline')
 * @returns {Promise<Object>} Object with success status and message
 * 
 * @example
 * const result = await respondToInvite('507f191e810c19729de860ea', '507f1f77bcf86cd799439011', 'accept');
 */
export default async function respondToInvite(training_id, user_id, action) {
	try {
		await connectDatabase();

		// Validate input
		if (!training_id || !user_id || !action) {
			return {
				success: false,
				message: 'Todos os campos são obrigatórios'
			};
		}

		// Validate ObjectId format
		if (!mongoose.Types.ObjectId.isValid(training_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
			return {
				success: false,
				message: 'ID inválido'
			};
		}

		// Validate action
		if (!['accept', 'decline'].includes(action)) {
			return {
				success: false,
				message: 'Ação inválida. Use: accept ou decline'
			};
		}

		// Find training
		const training = await Training.findById(training_id);

		if (!training) {
			return {
				success: false,
				message: 'Treinamento não encontrado'
			};
		}

		// Find pending invitation for this user
		const participant = training.participants.find(
			p => p.user_id.toString() === user_id && p.status === 'pending'
		);

		if (!participant) {
			return {
				success: false,
				message: 'Convite não encontrado ou já respondido'
			};
		}

		if (action === 'accept') {
			// Check if training is completed
			if (training.status === 'completed') {
				return {
					success: false,
					message: 'Não é possível aceitar convite para um treinamento finalizado'
				};
			}

			// Check if training has reached max participants
			const accepted_count = training.participants.filter(p => p.status === 'accepted').length;
			if (accepted_count >= training.max_participants) {
				return {
					success: false,
					message: 'Treinamento já atingiu o número máximo de participantes'
				};
			}

			// Accept invitation
			participant.status = 'accepted';
			participant.joined_at = new Date();

			await training.save();

			// Notify facilitators that the user accepted
			const responding_user = await User.findById(user_id).select('name nickname');
			const facilitators = training.participants.filter(
				p => p.role === 'facilitator' && p.status === 'accepted' && p.user_id.toString() !== user_id
			);
			for (const facilitator of facilitators) {
				await createNotification({
					user_id: facilitator.user_id.toString(),
					type: 'invite_accepted',
					title: 'Convite aceito',
					message: `${responding_user?.name || 'Um usuário'} aceitou o convite para o treinamento "${training.name}".`,
					training_id: training._id,
					metadata: {
						responding_user_id: user_id,
						responding_user_name: responding_user?.name,
						responding_user_nickname: responding_user?.nickname,
						role: participant.role,
					},
				});
			}

			return {
				success: true,
				message: 'Convite aceito com sucesso',
				training: {
					id: training._id.toString(),
					name: training.name,
					role: participant.role
				}
			};
		} else {
			// Decline invitation
			participant.status = 'declined';

			await training.save();

			// Notify facilitators that the user declined
			const responding_user = await User.findById(user_id).select('name nickname');
			const facilitators = training.participants.filter(
				p => p.role === 'facilitator' && p.status === 'accepted' && p.user_id.toString() !== user_id
			);
			for (const facilitator of facilitators) {
				await createNotification({
					user_id: facilitator.user_id.toString(),
					type: 'invite_declined',
					title: 'Convite recusado',
					message: `${responding_user?.name || 'Um usuário'} recusou o convite para o treinamento "${training.name}".`,
					training_id: training._id,
					metadata: {
						responding_user_id: user_id,
						responding_user_name: responding_user?.name,
						responding_user_nickname: responding_user?.nickname,
					},
				});
			}

			return {
				success: true,
				message: 'Convite recusado'
			};
		}

	} catch (error) {
		console.error('Error responding to invite:', error);
		return {
			success: false,
			message: 'Erro ao responder convite'
		};
	}
}
