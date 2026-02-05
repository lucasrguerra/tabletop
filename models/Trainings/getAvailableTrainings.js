import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Retrieves all available trainings that a user can join
 * Returns open trainings where the user is not yet a participant
 * 
 * @param {string} user_id - ID of the user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.status - Status filter ('all', 'not_started', 'active', 'paused')
 * @returns {Promise<Object>} Object with success status, trainings list, and pagination metadata
 * 
 * @example
 * const result = await getAvailableTrainings('507f191e810c19729de860ea', { page: 1, limit: 10 });
 */
export default async function getAvailableTrainings(user_id, options = {}) {
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

		// Base query - only open trainings where user is not already a participant
		const query = {
			access_type: 'open',
			status: { $ne: 'completed' }, // Exclude completed trainings
			'participants.user_id': { $ne: user_id } // User is not a participant yet
		};

		// Apply status filter if provided
		if (options.status && options.status !== 'all') {
			const valid_statuses = ['not_started', 'active', 'paused'];
			if (!valid_statuses.includes(options.status)) {
				return {
					success: false,
					message: 'Status inválido para filtro'
				};
			}
			query.status = options.status;
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

		// Map trainings to response format
		const available_trainings = trainings.map(training => ({
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
			created_at: training.created_at,
			started_at: training.started_at
		}));

		// Calculate pagination metadata
		const total_pages = Math.ceil(total / limit);
		const has_next = page < total_pages;
		const has_prev = page > 1;

		return {
			success: true,
			trainings: available_trainings,
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
		console.error('Error retrieving available trainings:', error);
		return {
			success: false,
			message: 'Erro ao buscar treinamentos disponíveis'
		};
	}
}
