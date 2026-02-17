import Evaluation from '@/database/schemas/Evaluation';
import connectDatabase from '@/database/database';

/**
 * Get evaluations for a training.
 * - Participants: get only their own evaluation (to check if already submitted)
 * - Facilitators: get all evaluations with aggregated statistics
 *
 * @param {Object} params
 * @param {string} params.training_id
 * @param {string} params.user_id
 * @param {string} params.user_role
 * @returns {Promise<Object>}
 */
export async function getEvaluations({ training_id, user_id, user_role }) {
	try {
		await connectDatabase();

		// Participant: only their own evaluation
		if (user_role !== 'facilitator') {
			const evaluation = await Evaluation.findOne({ training_id, user_id }).lean();

			return {
				success: true,
				evaluation: evaluation ? {
					id: evaluation._id.toString(),
					overall_rating: evaluation.overall_rating,
					scenario_rating: evaluation.scenario_rating,
					difficulty_rating: evaluation.difficulty_rating,
					would_recommend: evaluation.would_recommend,
					comment: evaluation.comment,
					submitted_at: evaluation.submitted_at,
				} : null,
				has_evaluated: !!evaluation,
			};
		}

		// Facilitator: all evaluations + stats
		const evaluations = await Evaluation.find({ training_id })
			.populate('user_id', 'name nickname')
			.sort({ submitted_at: -1 })
			.lean();

		const total = evaluations.length;

		if (total === 0) {
			return {
				success: true,
				evaluations: [],
				stats: {
					total: 0,
					avg_overall: 0,
					avg_scenario: 0,
					avg_difficulty: 0,
					recommend_percentage: 0,
					rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
				},
			};
		}

		const sumOverall = evaluations.reduce((s, e) => s + e.overall_rating, 0);
		const sumScenario = evaluations.reduce((s, e) => s + e.scenario_rating, 0);
		const sumDifficulty = evaluations.reduce((s, e) => s + e.difficulty_rating, 0);
		const recommendCount = evaluations.filter(e => e.would_recommend).length;

		const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		for (const e of evaluations) {
			distribution[e.overall_rating]++;
		}

		const formattedEvaluations = evaluations.map(e => ({
			id: e._id.toString(),
			user: {
				name: e.user_id.name,
				nickname: e.user_id.nickname,
			},
			overall_rating: e.overall_rating,
			scenario_rating: e.scenario_rating,
			difficulty_rating: e.difficulty_rating,
			would_recommend: e.would_recommend,
			comment: e.comment,
			submitted_at: e.submitted_at,
		}));

		return {
			success: true,
			evaluations: formattedEvaluations,
			stats: {
				total,
				avg_overall: Math.round((sumOverall / total) * 10) / 10,
				avg_scenario: Math.round((sumScenario / total) * 10) / 10,
				avg_difficulty: Math.round((sumDifficulty / total) * 10) / 10,
				recommend_percentage: Math.round((recommendCount / total) * 100),
				rating_distribution: distribution,
			},
		};
	} catch (error) {
		console.error('Error in getEvaluations:', error);
		return { success: false, message: 'Erro ao buscar avaliações', statusCode: 500 };
	}
}
