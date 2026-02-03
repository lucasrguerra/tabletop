import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Declines a training invitation
 * 
 * @param {string} training_id - ID of the training
 * @param {string} user_id - ID of the user declining the invitation
 * @returns {Promise<Object>} Object with success status and message
 */
export default async function declineInvite(training_id, user_id) {
	try {
		await connectDatabase();

		// Validate inputs
		if (!training_id || !user_id) {
			return {
				success: false,
				message: 'Dados obrigatórios ausentes'
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

		// Find user's participant record
		const participant = training.participants.find(
			p => p.user_id.toString() === user_id
		);

		if (!participant) {
			return {
				success: false,
				message: 'Você não foi convidado para este treinamento',
				code: 'NOT_INVITED'
			};
		}

		// Check if already declined
		if (participant.status === 'declined') {
			return {
				success: false,
				message: 'Você já recusou este convite',
				code: 'ALREADY_DECLINED'
			};
		}

		// Check if already accepted
		if (participant.status === 'accepted') {
			return {
				success: false,
				message: 'Você já aceitou este convite e está participando do treinamento',
				code: 'ALREADY_ACCEPTED'
			};
		}

		// Decline the invitation
		participant.status = 'declined';
		participant.responded_at = new Date();

		await training.save();

		return {
			success: true,
			message: 'Convite recusado'
		};

	} catch (error) {
		console.error('Error declining invite:', error);
		return {
			success: false,
			message: 'Erro ao recusar convite'
		};
	}
}
