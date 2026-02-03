import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Retrieves all pending invitations for a user
 * 
 * @param {string} user_id - ID of the user
 * @returns {Promise<Object>} Object with success status and pending invites list
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

		// Find all trainings where user has pending invite
		const trainings = await Training.find({
			'participants': {
				$elemMatch: {
					user_id: user_id,
					status: 'pending'
				}
			}
		})
			.populate('created_by', 'name email nickname')
			.sort({ created_at: -1 })
			.lean();

		// Map trainings with minimal info
		const pending_invites = trainings.map(training => {
			const participant = training.participants.find(
				p => p.user_id.toString() === user_id && p.status === 'pending'
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
				max_participants: training.max_participants,
				participants_count: training.participants.filter(p => p.status === 'accepted').length,
				status: training.status,
				invited_role: participant ? participant.role : 'unknown',
				invited_at: participant ? participant.joined_at : null,
				created_at: training.created_at,
				scheduled_for: training.scheduled_for
			};
		});

		return {
			success: true,
			invites: pending_invites
		};

	} catch (error) {
		console.error('Error retrieving pending invites:', error);
		return {
			success: false,
			message: 'Erro ao buscar convites pendentes'
		};
	}
}
