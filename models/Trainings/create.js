import accessCode from '@/models/Trainings/code';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import readScenario from './readScenario';

/**
 * Creates a new training session
 * 
 * @param {Object} data - Training data
 * @param {string} data.name - Name of the training session
 * @param {string} data.description - Description of the session
 * @param {string} data.user_id - ID of the user creating the training
 * @param {string} data.scenario - Scenario information
 * @param {string} data.scenario.id - Scenario ID
 * @param {string} data.scenario.category - Scenario category
 * @param {string} data.scenario.type - Scenario type
 * @param {string} data.access_type - Access type ('open' or 'code')
 * @param {string} [data.access_code] - Access code (required if access_type is 'code')
 * @param {number} data.max_participants - Maximum number of participants
 * @returns {Promise<Object>} Object with success status, training data, and optional error message
 * 
 * @example
 * const result = await createTraining({
 *   name: 'Treinamento DNS Reflection',
 *   description: 'Simulação de ataque DDoS',
 *   user_id: '507f1f77bcf86cd799439011',
 *   scenario_id: 'dns-amplification-scenario',
 *   access_type: 'open',
 *   max_participants: 15
 * });
 */
export default async function createTraining(data) {
	try {
		await connectDatabase();

		// Validate required fields
		if (!data.name || !data.description || !data.user_id || !data.scenario) {
			return {
				success: false,
				message: 'Campos obrigatórios ausentes'
			};
		}

		// Validate access code if required
		if (data.access_type === 'code' && !data.access_code) {
			return {
				success: false,
				message: 'Código de acesso é obrigatório quando o tipo de acesso é "code"'
			};
		}

		if (data.access_type === 'code') {
			const is_valid_code = await accessCode.validate(data.access_code);
			if (!is_valid_code) {
				return {
					success: false,
					message: 'Código de acesso inválido'
				};
			}
		}

		const scenario_result = await readScenario(
			data.scenario.id,
			data.scenario.category,
			data.scenario.type
		);
		if (!scenario_result.success) {
			return {
				success: false,
				message: 'Cenário inválido: ' + scenario_result.message
			};
		}
		const scenario_data = scenario_result.scenario;

		// Create training object
		const training = new Training({
			name: data.name,
			description: data.description || '',
			created_by: data.user_id,
			scenario: {
				id: scenario_data.id,
				category: scenario_data.category.id,
				type: scenario_data.category.type,
				title: scenario_data.title,
				description: scenario_data.description
			},
			access_type: data.access_type || 'open',
			access_code: data.access_code || undefined,
			max_participants: parseInt(data.max_participants) || 15,
			status: 'not_started',
			participants: [{
				user_id: data.user_id,
				role: 'facilitator',
				status: 'accepted',
				joined_at: new Date(),
			}]
		});

		// Save to database
		await training.save();

		return {
			success: true,
			training: {
				id: training._id.toString(),
				name: training.name,
				description: training.description,
				scenario: training.scenario,
				access_type: training.access_type,
				access_code: training.access_code,
				max_participants: training.max_participants,
				status: training.status,
				created_at: training.created_at
			},
			message: 'Treinamento criado com sucesso'
		};
	} catch (error) {
		console.error('Error creating training:', error);
		
		// Handle duplicate key error
		if (error.code === 11000) {
			return {
				success: false,
				message: 'Já existe um treinamento com esses dados'
			};
		}

		return {
			success: false,
			message: 'Erro ao criar treinamento'
		};
	}
}
