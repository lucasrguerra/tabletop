import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Accepts a training invitation
 * 
 * @param {string} training_id - ID of the training
 * @param {string} user_id - ID of the user accepting the invitation
 * @returns {Promise<Object>} Object with success status and message
 */
export default async function acceptInvite(training_id, user_id) {
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

		// Check if already accepted
		if (participant.status === 'accepted') {
			return {
				success: false,
				message: 'Você já aceitou este convite',
				code: 'ALREADY_ACCEPTED'
			};
		}

		// Check if declined
		if (participant.status === 'declined') {
			return {
				success: false,
				message: 'Você recusou este convite anteriormente',
				code: 'ALREADY_DECLINED'
			};
		}

		// Check if training is full (only count accepted participants)
		const acceptedCount = training.participants.filter(p => p.status === 'accepted').length;
		if (acceptedCount >= training.max_participants) {
			return {
				success: false,
				message: 'Treinamento está com o número máximo de participantes',
				code: 'TRAINING_FULL'
			};
		}

		// Accept the invitation
		participant.status = 'accepted';
		participant.responded_at = new Date();

		await training.save();

		return {
			success: true,
			message: 'Convite aceito com sucesso'
		};

	} catch (error) {
		console.error('Error accepting invite:', error);
		return {
			success: false,
			message: 'Erro ao aceitar convite'
		};
	}
}
