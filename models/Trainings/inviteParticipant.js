import Training from '@/database/schemas/Training';
import User from '@/database/schemas/User';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Invites a user to participate in a training
 * 
 * @param {string} training_id - ID of the training
 * @param {string} nickname - Nickname of the user to invite
 * @param {string} role - Role for the invited user ('facilitator', 'participant', 'observer')
 * @param {string} invited_by - ID of the user sending the invite (must be facilitator)
 * @returns {Promise<Object>} Object with success status and message
 * 
 * @example
 * const result = await inviteParticipant('507f191e810c19729de860ea', 'johndoe', 'participant', '507f1f77bcf86cd799439011');
 */
export default async function inviteParticipant(training_id, nickname, role, invited_by) {
	try {
		await connectDatabase();

		// Validate input
		if (!training_id || !nickname || !role || !invited_by) {
			return {
				success: false,
				message: 'Todos os campos são obrigatórios'
			};
		}

		// Validate ObjectId format
		if (!mongoose.Types.ObjectId.isValid(training_id) || !mongoose.Types.ObjectId.isValid(invited_by)) {
			return {
				success: false,
				message: 'ID inválido'
			};
		}

		// Validate role
		const valid_roles = ['facilitator', 'participant', 'observer'];
		if (!valid_roles.includes(role)) {
			return {
				success: false,
				message: 'Papel inválido. Use: facilitator, participant ou observer'
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

		// Check if training is completed
		if (training.status === 'completed') {
			return {
				success: false,
				message: 'Não é possível adicionar participantes a um treinamento finalizado'
			};
		}

		// Verify that the inviter is a facilitator
		const inviter = training.participants.find(
			p => p.user_id.toString() === invited_by && p.role === 'facilitator' && p.status === 'accepted'
		);

		if (!inviter) {
			return {
				success: false,
				message: 'Apenas facilitadores podem convidar participantes'
			};
		}

		// Find user by nickname
		const user = await User.findOne({ nickname: nickname.toLowerCase() });

		if (!user) {
			return {
				success: false,
				message: 'Usuário não encontrado com este nickname'
			};
		}

		// Check if user is already a participant (any status)
		const existing_participant = training.participants.find(
			p => p.user_id.toString() === user._id.toString()
		);

		if (existing_participant) {
			if (existing_participant.status === 'pending') {
				return {
					success: false,
					message: 'Este usuário já possui um convite pendente'
				};
			}
			if (existing_participant.status === 'accepted') {
				return {
					success: false,
					message: 'Este usuário já participa do treinamento'
				};
			}
			if (existing_participant.status === 'declined') {
				return {
					success: false,
					message: 'Este usuário recusou o convite anteriormente'
				};
			}
		}

		// Check if training has reached max participants (count only accepted)
		const accepted_count = training.participants.filter(p => p.status === 'accepted').length;
		if (accepted_count >= training.max_participants) {
			return {
				success: false,
				message: 'Treinamento já atingiu o número máximo de participantes'
			};
		}

		// Add user as participant with pending status
		training.participants.push({
			user_id: user._id,
			role: role,
			status: 'pending',
			joined_at: null // Will be set when user accepts
		});

		// Save training
		await training.save();

		return {
			success: true,
			message: `Convite enviado para ${nickname}`,
			participant: {
				user_id: user._id.toString(),
				nickname: user.nickname,
				role: role,
				status: 'pending'
			}
		};

	} catch (error) {
		console.error('Error inviting participant:', error);
		return {
			success: false,
			message: 'Erro ao enviar convite'
		};
	}
}
