import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Retrieves all pending training invitations for a user
 * 
 * @param {string} user_id - ID of the user
 * @returns {Promise<Object>} Object with success status and list of pending invitations
 * 
 * @example
 * const result = await getPendingInvites('507f1f77bcf86cd799439011');
 */
export default async function getPendingInvites(user_id) {
	try {
		await connectDatabase();

		// Validate input
		if (!user_id) {
			return {
				success: false,
				message: 'ID do usuário é obrigatório'
			};
		}

		// Find trainings where user has pending invitation
		const trainings = await Training.find({
			'participants': {
				$elemMatch: {
					user_id: user_id,
					status: 'pending'
				}
			}
		})
		.populate('created_by', 'name nickname')
		.sort({ created_at: -1 })
		.lean();

		// Map trainings to include invitation details
		const invitations = trainings.map(training => {
			const invitation = training.participants.find(
				p => p.user_id.toString() === user_id && p.status === 'pending'
			);

			return {
				training_id: training._id.toString(),
				training_name: training.name,
				training_description: training.description,
				created_by: {
					name: training.created_by.name,
					nickname: training.created_by.nickname
				},
				scenario: training.scenario,
				invited_role: invitation.role,
				status: training.status,
				participants_count: training.participants.filter(p => p.status === 'accepted').length,
				max_participants: training.max_participants,
				created_at: training.created_at
			};
		});

		return {
			success: true,
			invitations
		};

	} catch (error) {
		console.error('Error retrieving pending invites:', error);
		return {
			success: false,
			message: 'Erro ao buscar convites pendentes'
		};
	}
}
