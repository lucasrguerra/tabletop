import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Retrieves a specific training session by ID
 * 
 * @param {string} training_id - ID of the training to retrieve
 * @param {string} user_id - ID of the user requesting the training
 * @returns {Promise<Object>} Object with success status, training data, and role information
 * 
 * @example
 * const result = await getOneTraining('507f1f77bcf86cd799439011', '507f191e810c19729de860ea');
 */
export default async function getOneTraining(training_id, user_id) {
	try {
		await connectDatabase();

		// Validate inputs
		if (!training_id || !user_id) {
			return {
				success: false,
				message: 'ID do treinamento e ID do usuário são obrigatórios'
			};
		}

		// Find training by ID and populate creator info
		const training = await Training.findById(training_id)
			.populate('created_by', 'name email nickname')
			.populate('participants.user_id', 'name email nickname')
			.lean();

		if (!training) {
			return {
				success: false,
				message: 'Treinamento não encontrado'
			};
		}

		// Find user's role in the training
		const participant = training.participants.find(
			p => p.user_id._id.toString() === user_id
		);

		// Check if user is part of the training
		if (!participant) {
			return {
				success: false,
				message: 'Você não tem acesso a este treinamento',
				code: 'NOT_PARTICIPANT'
			};
		}

		// Check if user is the facilitator
		const is_facilitator = participant.role === 'facilitator';

		return {
			success: true,
			training: {
				id: training._id.toString(),
				name: training.name,
				description: training.description,
				created_by: {
					id: training.created_by._id.toString(),
					name: training.created_by.name,
					email: training.created_by.email,
					nickname: training.created_by.nickname
				},
				scenario: training.scenario,
				access_type: training.access_type,
				access_code: is_facilitator ? training.access_code : undefined, // Only show to facilitator
				max_participants: training.max_participants,
				timer: training.timer,
				status: training.status,
				participants: training.participants.map(p => ({
					id: p.user_id._id.toString(),
					name: p.user_id.name,
					email: p.user_id.email,
					nickname: p.user_id.nickname,
					role: p.role,
					joined_at: p.joined_at
				})),
				created_at: training.created_at,
				scheduled_for: training.scheduled_for,
				started_at: training.started_at,
				completed_at: training.completed_at
			},
			user_role: participant.role,
			is_facilitator: is_facilitator
		};

	} catch (error) {
		console.error('Error retrieving training:', error);
		return {
			success: false,
			message: 'Erro ao buscar treinamento'
		};
	}
}
