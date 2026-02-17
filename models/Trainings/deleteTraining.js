import Training from '@/database/schemas/Training';
import Response from '@/database/schemas/Response';
import Evaluation from '@/database/schemas/Evaluation';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Deletes a training and all associated responses and evaluations.
 * Only the facilitator (creator) should be allowed to delete.
 *
 * @param {string} trainingId - The training ID to delete
 * @param {string} userId - The user requesting deletion (must be facilitator)
 * @returns {Promise<Object>} Result with success status and message
 */
export default async function deleteTraining(trainingId, userId) {
	try {
		await connectDatabase();

		if (!trainingId || !userId) {
			return { success: false, message: 'IDs são obrigatórios' };
		}

		if (!mongoose.Types.ObjectId.isValid(trainingId)) {
			return { success: false, message: 'ID do treinamento inválido' };
		}

		const training = await Training.findById(trainingId);

		if (!training) {
			return { success: false, message: 'Treinamento não encontrado' };
		}

		// Verify the requesting user is the facilitator
		const facilitator = training.participants.find(
			p => p.user_id.toString() === userId && p.role === 'facilitator'
		);

		if (!facilitator) {
			return { success: false, message: 'Apenas o facilitador pode deletar o treinamento' };
		}

		// Delete all associated data
		await Response.deleteMany({ training_id: trainingId });
		await Evaluation.deleteMany({ training_id: trainingId });
		await Training.findByIdAndDelete(trainingId);

		return {
			success: true,
			message: 'Treinamento deletado com sucesso'
		};
	} catch (error) {
		console.error('Error deleting training:', error);
		return {
			success: false,
			message: 'Erro ao deletar treinamento'
		};
	}
}
