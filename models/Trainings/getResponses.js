import Response from '@/database/schemas/Response';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import readScenario from '@/models/Trainings/readScenario';

/**
 * Retrieves responses for a training, filtered by role:
 * - Participants: only their own responses
 * - Facilitators: all participant responses with summary stats
 *
 * @param {Object} params
 * @param {string} params.training_id - Training MongoDB ID
 * @param {string} params.user_id - Requesting user's ID
 * @param {string} params.user_role - User's role in this training
 * @param {number} [params.round_id] - Optional: filter by specific round
 * @returns {Promise<Object>} Result with responses and summary
 */
export async function getResponses({ training_id, user_id, user_role, round_id }) {
	try {
		await connectDatabase();

		const query = { training_id };

		// Participants and observers can only see their own responses
		if (user_role !== 'facilitator') {
			query.user_id = user_id;
		}

		// Optional round filter
		if (typeof round_id === 'number' && round_id >= 0) {
			query.round_id = round_id;
		}

		const responses = await Response.find(query)
			.populate('user_id', 'name nickname')
			.sort({ round_id: 1, submitted_at: 1 })
			.lean();

		// Load scenario to enrich responses with justifications
		const justificationMap = await buildJustificationMap(training_id);

		// Build summary statistics
		const summary = buildSummary(responses, user_role);

		// Format responses for output
		const formattedResponses = responses.map(r => ({
			id: r._id,
			user: user_role === 'facilitator' ? {
				id: r.user_id._id,
				name: r.user_id.name,
				nickname: r.user_id.nickname,
			} : undefined,
			round_id: r.round_id,
			question_id: r.question_id,
			question_type: r.question_type,
			answer: r.answer,
			is_correct: r.is_correct,
			points_earned: r.points_earned,
			points_possible: r.points_possible,
			submitted_at: r.submitted_at,
			justification: justificationMap.get(`${r.round_id}:${r.question_id}`) || null,
		}));

		return {
			success: true,
			responses: formattedResponses,
			summary,
		};

	} catch (error) {
		console.error('Error in getResponses:', error);
		return { success: false, message: 'Erro ao buscar respostas', statusCode: 500 };
	}
}

/**
 * Loads the scenario for a training and builds a map of round:question -> justification.
 */
async function buildJustificationMap(training_id) {
	const map = new Map();
	try {
		const training = await Training.findById(training_id).lean();
		if (!training?.scenario) return map;

		const result = await readScenario(
			training.scenario.id,
			training.scenario.category,
			training.scenario.type
		);
		if (!result.success) return map;

		const rounds = result.scenario.rounds || [];
		for (let ri = 0; ri < rounds.length; ri++) {
			for (const q of (rounds[ri].questions || [])) {
				if (q.justification) {
					map.set(`${ri}:${q.id}`, q.justification);
				}
			}
		}
	} catch (err) {
		console.error('Error building justification map:', err);
	}
	return map;
}

/**
 * Builds summary statistics from a set of responses.
 */
function buildSummary(responses, userRole) {
	if (responses.length === 0) {
		return {
			total_responses: 0,
			total_points_earned: 0,
			total_points_possible: 0,
			percentage: 0,
			correct_count: 0,
			incorrect_count: 0,
		};
	}

	const total_points_earned = responses.reduce((sum, r) => sum + r.points_earned, 0);
	const total_points_possible = responses.reduce((sum, r) => sum + r.points_possible, 0);
	const correct_count = responses.filter(r => r.is_correct).length;

	const summary = {
		total_responses: responses.length,
		total_points_earned,
		total_points_possible,
		percentage: total_points_possible > 0
			? Math.round((total_points_earned / total_points_possible) * 10000) / 100
			: 0,
		correct_count,
		incorrect_count: responses.length - correct_count,
	};

	// Facilitators get per-participant breakdown
	if (userRole === 'facilitator') {
		const byUser = {};
		for (const r of responses) {
			const uid = r.user_id._id.toString();
			if (!byUser[uid]) {
				byUser[uid] = {
					user: { id: uid, name: r.user_id.name, nickname: r.user_id.nickname },
					total_responses: 0,
					points_earned: 0,
					points_possible: 0,
					correct_count: 0,
				};
			}
			byUser[uid].total_responses++;
			byUser[uid].points_earned += r.points_earned;
			byUser[uid].points_possible += r.points_possible;
			if (r.is_correct) byUser[uid].correct_count++;
		}

		summary.participants = Object.values(byUser).map(p => ({
			...p,
			percentage: p.points_possible > 0
				? Math.round((p.points_earned / p.points_possible) * 10000) / 100
				: 0,
		}));
	}

	return summary;
}
