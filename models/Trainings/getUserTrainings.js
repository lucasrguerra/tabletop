import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Retrieves all trainings that a user is participating in
 * 
 * @param {string} user_id - ID of the user
 * @returns {Promise<Object>} Object with success status and trainings list
 * 
 * @example
 * const result = await getUserTrainings('507f191e810c19729de860ea');
 */
export default async function getUserTrainings(user_id) {
	try {
		await connectDatabase();

		// Validate input
		if (!user_id) {
			return {
				success: false,
				message: 'ID do usuário é obrigatório'
			};
		}

		// Find all trainings where user is a participant with accepted status
		const trainings = await Training.find({
			'participants': {
				$elemMatch: {
					user_id: user_id,
					status: 'accepted'
				}
			}
		})
			.populate('created_by', 'name email nickname')
			.sort({ created_at: -1 }) // Most recent first
			.lean();

		// Map trainings with user's role
		const trainings_with_role = trainings.map(training => {
			const participant = training.participants.find(
				p => p.user_id.toString() === user_id && p.status === 'accepted'
			);

			return {
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
				max_participants: training.max_participants,
				participants_count: training.participants.length,
				timer: training.timer,
				status: training.status,
				user_role: participant ? participant.role : 'unknown',
				joined_at: participant ? participant.joined_at : null,
				created_at: training.created_at,
				scheduled_for: training.scheduled_for,
				started_at: training.started_at,
				completed_at: training.completed_at
			};
		});

		return {
			success: true,
			trainings: trainings_with_role
		};

	} catch (error) {
		console.error('Error retrieving user trainings:', error);
		return {
			success: false,
			message: 'Erro ao buscar treinamentos'
		};
	}
}
