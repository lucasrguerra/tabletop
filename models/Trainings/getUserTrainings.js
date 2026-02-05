import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Retrieves all trainings that a user is participating in
 * 
 * @param {string} user_id - ID of the user
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.status - Status filter ('all', 'not_started', 'active', 'paused', 'completed')
 * @param {string} options.participation_type - Type of participation filter ('all', 'facilitator', 'participant', 'observer')
 * @returns {Promise<Object>} Object with success status, trainings list, and pagination metadata
 * 
 * @example
 * const result = await getUserTrainings('507f191e810c19729de860ea', { page: 1, limit: 10, status: 'all', participation_type: 'all' });
 */
export default async function getUserTrainings(user_id, options = {}) {
	try {
		await connectDatabase();

		// Validate input
		if (!user_id) {
			return {
				success: false,
				message: 'ID do usuário é obrigatório'
			};
		}

		// Pagination parameters
		const page = Math.max(1, parseInt(options.page) || 1);
		const limit = Math.min(50, Math.max(1, parseInt(options.limit) || 10));
		const skip = (page - 1) * limit;

		// Base query
		const query = {
			'participants': {
				$elemMatch: {
					user_id: user_id,
					status: 'accepted'
				}
			}
		};

		// Apply status filter if not 'all'
		if (options.status && options.status !== 'all') {
			const valid_statuses = ['not_started', 'active', 'paused', 'completed'];
			if (!valid_statuses.includes(options.status)) {
				return {
					success: false,
					message: 'Status inválido para filtro'
				};
			}
			query.status = options.status;
		}

		// Apply participation_type filter if not 'all'
		if (options.participation_type && options.participation_type !== 'all') {
			const valid_types = ['facilitator', 'participant', 'observer'];
			if (!valid_types.includes(options.participation_type)) {
				return {
					success: false,
					message: 'Tipo de participação inválido para filtro'
				};
			}
			query['participants'].$elemMatch.role = options.participation_type;
		}

		// Count total documents
		const total = await Training.countDocuments(query);

		// Find trainings with pagination
		const trainings = await Training.find(query)
			.populate('created_by', 'name email nickname')
			.sort({ created_at: -1 }) // Most recent first
			.skip(skip)
			.limit(limit)
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
					name: training.created_by.name,
					nickname: training.created_by.nickname
				},
				scenario: training.scenario,
				access_type: training.access_type,
				max_participants: training.max_participants,
				participants_count: training.participants.length,
				status: training.status,
				user_role: participant.role,
				joined_at: participant.joined_at,
				created_at: training.created_at,
				started_at: training.started_at,
				completed_at: training.completed_at
			};
		});

		// Calculate pagination metadata
		const total_pages = Math.ceil(total / limit);
		const has_next = page < total_pages;
		const has_prev = page > 1;

		return {
			success: true,
			trainings: trainings_with_role,
			pagination: {
				current_page: page,
				total_pages,
				total_items: total,
				items_per_page: limit,
				has_next,
				has_prev
			}
		};

	} catch (error) {
		console.error('Error retrieving user trainings:', error);
		return {
			success: false,
			message: 'Erro ao buscar treinamentos'
		};
	}
}
