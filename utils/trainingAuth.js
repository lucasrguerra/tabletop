import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Retrieves a training and validates if user has access to it
 * Returns the training data and user's role if authorized
 * 
 * @param {string} training_id - Training ID
 * @param {string} user_id - User ID requesting access
 * @returns {Promise<Object>} Object with success, training, userRole, and optional error message
 */
export async function getTrainingWithRole(training_id, user_id) {
	try {
		await connectDatabase();

		// Validate IDs
		if (!training_id || !user_id) {
			return {
				success: false,
				message: 'IDs são obrigatórios',
				statusCode: 400
			};
		}

		// Validate MongoDB ObjectId format
		if (!mongoose.Types.ObjectId.isValid(training_id)) {
			return {
				success: false,
				message: 'ID do treinamento inválido',
				statusCode: 400
			};
		}

		// Find training and populate creator info
		const training = await Training.findById(training_id)
			.populate('created_by', 'name email nickname')
			.populate('participants.user_id', 'name email nickname')
			.lean();

		if (!training) {
			return {
				success: false,
				message: 'Treinamento não encontrado',
				statusCode: 404
			};
		}

		// Check if user is a participant with accepted status
		const participant = training.participants.find(
			p => p.user_id._id.toString() === user_id && p.status === 'accepted'
		);

		if (!participant) {
			return {
				success: false,
				message: 'Você não tem acesso a este treinamento',
				statusCode: 403
			};
		}

		return {
			success: true,
			training,
			userRole: participant.role
		};

	} catch (error) {
		console.error('Error in getTrainingWithRole:', error);
		return {
			success: false,
			message: 'Erro ao buscar treinamento',
			statusCode: 500
		};
	}
}

/**
 * Filters training data based on user's role
 * Removes sensitive information for non-facilitators
 * 
 * @param {Object} training - Training object (from database)
 * @param {string} userRole - User's role ('facilitator', 'participant', 'observer')
 * @returns {Object} Filtered training data
 */
export function filterTrainingByRole(training, userRole) {
	// Create base training object with common fields
	const filtered = {
		id: training._id.toString(),
		name: training.name,
		description: training.description,
		created_by: {
			id: training.created_by._id.toString(),
			name: training.created_by.name,
			nickname: training.created_by.nickname
		},
		scenario: training.scenario,
		access_type: training.access_type,
		max_participants: training.max_participants,
		status: training.status,
		current_round: training.current_round || 0,
		timer: {
			started_at: training.timer?.started_at || null,
			elapsed_time: training.timer?.elapsed_time || 0,
			is_paused: training.timer?.is_paused !== false
		},
		created_at: training.created_at,
		started_at: training.started_at,
		completed_at: training.completed_at
	};

	// FACILITATOR: Full access to all data
	if (userRole === 'facilitator') {
		filtered.access_code = training.access_code;
		filtered.participants = training.participants.map(p => ({
			user: {
				name: p.user_id.name,
				email: p.user_id.email,
				nickname: p.user_id.nickname
			},
			role: p.role,
			status: p.status,
			joined_at: p.joined_at
		}));
	}
	// PARTICIPANT & OBSERVER: Limited access
	else {
		// Do NOT include access_code
		// Only show accepted participants without emails
		filtered.participants = training.participants
			.filter(p => p.status === 'accepted')
			.map(p => ({
				user: {
					name: p.user_id.name,
					nickname: p.user_id.nickname
				},
				role: p.role,
				joined_at: p.joined_at
			}));
	}

	filtered.participants_count = filtered.participants.length;

	return filtered;
}

/**
 * Higher-order function to wrap API route handlers with training authorization
 * Validates user access to training and passes filtered data to handler
 * 
 * @param {Function} handler - API route handler (request, context, session, training, userRole)
 * @param {Array<string>} allowedRoles - Optional array of allowed roles (e.g., ['facilitator'])
 * @returns {Function} Wrapped handler
 */
export function withTrainingRole(handler, allowedRoles = null) {
	return async (request, context, session) => {
		// Await params (Next.js 15+ requirement)
		const params = await context.params;
		const training_id = params.id;
		const user_id = session.user.id;

		// Get training and validate access
		const result = await getTrainingWithRole(training_id, user_id);

		if (!result.success) {
			return new Response(
				JSON.stringify({
					success: false,
					message: result.message
				}),
				{
					status: result.statusCode,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		const { training, userRole } = result;

		// Check if user's role is allowed (if role restrictions are specified)
		if (allowedRoles && !allowedRoles.includes(userRole)) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Você não tem permissão para realizar esta ação'
				}),
				{
					status: 403,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Filter training data based on role
		const filteredTraining = filterTrainingByRole(training, userRole);

		// Call the original handler with filtered training and userRole
		return handler(request, context, session, filteredTraining, userRole);
	};
}
