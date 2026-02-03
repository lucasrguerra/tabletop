import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import getOneUser from '@/models/User/getOne';

/**
 * Adds a participant to a training session with pending status
 * 
 * @param {string} training_id - ID of the training
 * @param {string} current_user_id - ID of the user performing the action
 * @param {string} nickname - Nickname of the user to be added
 * @param {string} role - Role of the user (facilitator, participant, observer)
 * @returns {Promise<Object>} Object with success status and message
 */
export default async function addParticipant(training_id, current_user_id, nickname, role = 'participant') {
	try {
		await connectDatabase();

		// Validate inputs
		if (!training_id || !current_user_id || !nickname) {
			return {
				success: false,
				message: 'Dados obrigatórios ausentes'
			};
		}

		// Validate role
		const validRoles = ['facilitator', 'participant', 'observer'];
		if (!validRoles.includes(role)) {
			return {
				success: false,
				message: 'Função inválida'
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

		// Check if current user is a facilitator with accepted status
		const current_user_participant = training.participants.find(
			p => p.user_id.toString() === current_user_id && 
			     p.role === 'facilitator' && 
			     p.status === 'accepted'
		);

		if (!current_user_participant) {
			return {
				success: false,
				message: 'Apenas facilitadores podem adicionar participantes',
				code: 'NOT_FACILITATOR'
			};
		}

		// Find user by nickname
		const user = await getOneUser(nickname);

		if (!user) {
			return {
				success: false,
				message: 'Usuário não encontrado com este nickname',
				code: 'USER_NOT_FOUND'
			};
		}

		// Check if user is already in the training (any status except declined)
		const existing_participant = training.participants.find(
			p => p.user_id.toString() === user.id
		);

		if (existing_participant) {
			// If user declined, they cannot be added again
			if (existing_participant.status === 'declined') {
				return {
					success: false,
					message: 'Este usuário recusou o convite e não pode ser adicionado novamente',
					code: 'USER_DECLINED'
				};
			}

			// If user has pending invite
			if (existing_participant.status === 'pending') {
				return {
					success: false,
					message: 'Este usuário já possui um convite pendente',
					code: 'ALREADY_PENDING'
				};
			}

			// If user already accepted
			if (existing_participant.status === 'accepted') {
				return {
					success: false,
					message: 'Este usuário já está participando do treinamento',
					code: 'ALREADY_ACCEPTED'
				};
			}
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

		// Add user with pending status - don't populate user data yet for privacy
		training.participants.push({
			user_id: user.id,
			role: role,
			status: 'pending',
			joined_at: new Date()
		});

		await training.save();

		return {
			success: true,
			message: 'Convite enviado com sucesso',
			participant: {
				id: user.id,
				nickname: user.nickname,
				role: role,
				status: 'pending'
			}
		};

	} catch (error) {
		console.error('Error adding participant:', error);
		return {
			success: false,
			message: 'Erro ao adicionar participante'
		};
	}
}
