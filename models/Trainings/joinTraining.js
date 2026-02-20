import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import accessCode, { validateFormat } from '@/models/Trainings/accessCode';
import mongoose from 'mongoose';
import { constantTimeCompare } from '@/utils/timingSafe';

/**
 * Adds a user as a participant to a training
 * 
 * @param {string|null} training_id - ID of the training (optional if access_code is provided)
 * @param {string} user_id - ID of the user joining
 * @param {Object} options - Join options
 * @param {string} options.access_code - Access code (required for code-protected trainings or to find training)
 * @returns {Promise<Object>} Object with success status and message
 * 
 * @example
 * const result = await joinTraining('507f191e810c19729de860ea', '507f1f77bcf86cd799439011', { access_code: 'ABC123' });
 * const result = await joinTraining(null, '507f1f77bcf86cd799439011', { access_code: 'ABC123' });
 */
export default async function joinTraining(training_id, user_id, options = {}) {
	try {
		await connectDatabase();

		// Validate user_id
		if (!user_id) {
			return {
				success: false,
				message: 'ID do usuário é obrigatório'
			};
		}

		let training;

		// If no training_id provided, try to find by access_code
		if (!training_id && options.access_code) {
			// Validate access code format first
			if (!validateFormat(options.access_code)) {
				return {
					success: false,
					message: 'Código de acesso inválido'
				};
			}

			// Find training by access code
			training = await Training.findOne({
				access_code: options.access_code,
				access_type: 'code',
				status: { $ne: 'completed' }
			});

			if (!training) {
				return {
					success: false,
					message: 'Nenhum treinamento encontrado com este código de acesso'
				};
			}
		} else if (training_id) {
			// Validate ObjectId format
			if (!mongoose.Types.ObjectId.isValid(training_id)) {
				return {
					success: false,
					message: 'ID do treinamento inválido'
				};
			}

			// Find training by ID
			training = await Training.findById(training_id);
		} else {
			return {
				success: false,
				message: 'ID do treinamento ou código de acesso é obrigatório'
			};
		}

		// Check if training exists

		if (!training) {
			return {
				success: false,
				message: 'Treinamento não encontrado'
			};
		}

		// Check if training is completed
		if (training.status === 'completed') {
			return {
				success: false,
				message: 'Não é possível entrar em um treinamento finalizado'
			};
		}

		// Check if user is already a participant
		const existing_participant = training.participants.find(
			p => p.user_id.toString() === user_id
		);

		if (existing_participant) {
			return {
				success: false,
				message: 'Você já está participando deste treinamento'
			};
		}

		// Check if training has reached max participants
		if (training.participants.length >= training.max_participants) {
			return {
				success: false,
				message: 'Treinamento já atingiu o número máximo de participantes'
			};
		}

		// Validate access code if required
		if (training.access_type === 'code') {
			if (!options.access_code) {
				return {
					success: false,
					message: 'Código de acesso é obrigatório para este treinamento'
				};
			}

			// Validate the provided access code format
			if (!validateFormat(options.access_code)) {
				return {
					success: false,
					message: 'Código de acesso inválido'
				};
			}

			// Check if the access code matches the training's code (timing-safe)
			if (!constantTimeCompare(training.access_code, options.access_code)) {
				return {
					success: false,
					message: 'Código de acesso incorreto para este treinamento'
				};
			}
		}

		// Add user as participant
		training.participants.push({
			user_id: user_id,
			role: 'participant',
			status: 'accepted',
			joined_at: new Date()
		});

		// Save training
		await training.save();

		return {
			success: true,
			message: 'Você entrou no treinamento com sucesso',
			training: {
				id: training._id.toString(),
				name: training.name,
				description: training.description,
				status: training.status
			}
		};

	} catch (error) {
		console.error('Error joining training:', error);
		return {
			success: false,
			message: 'Erro ao entrar no treinamento'
		};
	}
}
