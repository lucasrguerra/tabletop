import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import getOneUser from '@/models/User/getOne';

/**
 * Adds a facilitator to a training session
 * 
 * @param {string} training_id - ID of the training
 * @param {string} current_user_id - ID of the user performing the action
 * @param {string} nickname - Nickname of the user to be added as facilitator
 * @returns {Promise<Object>} Object with success status and message
 */
export default async function addFacilitator(training_id, current_user_id, nickname) {
	try {
		await connectDatabase();

		// Validate inputs
		if (!training_id || !current_user_id || !nickname) {
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

		// Check if current user is a facilitator
		const current_user_participant = training.participants.find(
			p => p.user_id.toString() === current_user_id && p.role === 'facilitator'
		);

		if (!current_user_participant) {
			return {
				success: false,
				message: 'Apenas facilitadores podem adicionar outros facilitadores',
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

		// Check if user is already in the training
		const existing_participant = training.participants.find(
			p => p.user_id.toString() === user.id
		);

		if (existing_participant) {
			if (existing_participant.role === 'facilitator') {
				return {
					success: false,
					message: 'Este usuário já é facilitador deste treinamento',
					code: 'ALREADY_FACILITATOR'
				};
			}
			
			// Update existing participant to facilitator
			existing_participant.role = 'facilitator';
			await training.save();

			return {
				success: true,
				message: 'Participante promovido a facilitador com sucesso',
				facilitator: {
					id: user.id,
					name: user.name,
					email: user.email,
					nickname: user.nickname
				}
			};
		}

		// Check if training is full
		if (training.participants.length >= training.max_participants) {
			return {
				success: false,
				message: 'Treinamento está com o número máximo de participantes',
				code: 'TRAINING_FULL'
			};
		}

		// Add user as facilitator
		training.participants.push({
			user_id: user.id,
			role: 'facilitator',
			joined_at: new Date()
		});

		await training.save();

		return {
			success: true,
			message: 'Facilitador adicionado com sucesso',
			facilitator: {
				id: user.id,
				name: user.name,
				email: user.email,
				nickname: user.nickname
			}
		};

	} catch (error) {
		console.error('Error adding facilitator:', error);
		return {
			success: false,
			message: 'Erro ao adicionar facilitador'
		};
	}
}
