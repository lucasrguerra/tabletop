import Evaluation from '@/database/schemas/Evaluation';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Submit an evaluation for a completed training.
 * Each participant can only submit one evaluation per training.
 *
 * @param {Object} params
 * @param {string} params.training_id - Training ID
 * @param {string} params.user_id - User ID
 * @param {number} params.overall_rating - 1-5
 * @param {number} params.scenario_rating - 1-5
 * @param {number} params.difficulty_rating - 1-5
 * @param {boolean} params.would_recommend
 * @param {string} [params.comment] - Optional comment (max 1000 chars)
 * @returns {Promise<Object>}
 */
export async function submitEvaluation({ training_id, user_id, overall_rating, scenario_rating, difficulty_rating, would_recommend, comment }) {
	try {
		await connectDatabase();

		// Verify training exists and is completed
		const training = await Training.findById(training_id).lean();
		if (!training) {
			return { success: false, message: 'Treinamento não encontrado', statusCode: 404 };
		}
		if (training.status !== 'completed') {
			return { success: false, message: 'Avaliações só podem ser enviadas após a conclusão do treinamento', statusCode: 400 };
		}

		// Verify user is an accepted participant (not facilitator)
		const participant = training.participants.find(
			p => p.user_id.toString() === user_id && p.role === 'participant' && p.status === 'accepted'
		);
		if (!participant) {
			return { success: false, message: 'Apenas participantes aceitos podem avaliar o treinamento', statusCode: 403 };
		}

		// Check if already evaluated
		const existing = await Evaluation.findOne({ training_id, user_id }).lean();
		if (existing) {
			return { success: false, message: 'Você já avaliou este treinamento', statusCode: 409 };
		}

		// Validate ratings
		for (const [field, value] of Object.entries({ overall_rating, scenario_rating, difficulty_rating })) {
			if (typeof value !== 'number' || value < 1 || value > 5 || !Number.isInteger(value)) {
				return { success: false, message: `${field} deve ser um número inteiro entre 1 e 5`, statusCode: 400 };
			}
		}

		if (typeof would_recommend !== 'boolean') {
			return { success: false, message: 'would_recommend deve ser verdadeiro ou falso', statusCode: 400 };
		}

		const sanitizedComment = typeof comment === 'string' ? comment.trim().slice(0, 1000) : '';

		const evaluation = new Evaluation({
			training_id,
			user_id,
			overall_rating,
			scenario_rating,
			difficulty_rating,
			would_recommend,
			comment: sanitizedComment,
		});

		await evaluation.save();

		return {
			success: true,
			message: 'Avaliação enviada com sucesso',
			evaluation: {
				id: evaluation._id.toString(),
				overall_rating: evaluation.overall_rating,
				scenario_rating: evaluation.scenario_rating,
				difficulty_rating: evaluation.difficulty_rating,
				would_recommend: evaluation.would_recommend,
				comment: evaluation.comment,
				submitted_at: evaluation.submitted_at,
			},
		};
	} catch (error) {
		console.error('Error in submitEvaluation:', error);

		if (error.code === 11000) {
			return { success: false, message: 'Você já avaliou este treinamento', statusCode: 409 };
		}

		return { success: false, message: 'Erro ao enviar avaliação', statusCode: 500 };
	}
}
