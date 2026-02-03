import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Creates a new training session
 * 
 * @param {Object} data - Training data
 * @param {string} data.session_name - Name of the training session
 * @param {string} data.session_description - Description of the session
 * @param {string} data.user_id - ID of the user creating the training
 * @param {Object} data.scenario - Selected scenario details
 * @param {string} data.scenario.category_id - Category ID
 * @param {string} data.scenario.type_id - Type ID
 * @param {string} data.scenario.scenario_id - Scenario ID
 * @param {string} data.scenario.scenario_title - Scenario title
 * @param {string} data.access_type - Access type ('open' or 'code')
 * @param {string} [data.access_code] - Access code (required if access_type is 'code')
 * @param {number} data.max_participants - Maximum number of participants
 * @returns {Promise<Object>} Object with success status, training data, and optional error message
 * 
 * @example
 * const result = await createTraining({
 *   session_name: 'Treinamento DNS Reflection',
 *   session_description: 'Simulação de ataque DDoS',
 *   user_id: '507f1f77bcf86cd799439011',
 *   scenario: {
 *     category_id: 'NET_VOL',
 *     type_id: 'NET_VOL_DNS_REFLECTION',
 *     scenario_id: 'dns-amplification-scenario',
 *     scenario_title: 'Ataque de Amplificação DNS'
 *   },
 *   access_type: 'open',
 *   max_participants: 15
 * });
 */
export default async function createTraining(data) {
	try {
		await connectDatabase();

		// Validate required fields
		if (!data.session_name || !data.user_id || !data.scenario) {
			return {
				success: false,
				message: 'Campos obrigatórios ausentes'
			};
		}

		// Validate scenario data
		if (!data.scenario.category_id || !data.scenario.type_id || 
		    !data.scenario.scenario_id || !data.scenario.scenario_title) {
			return {
				success: false,
				message: 'Dados do cenário incompletos'
			};
		}

		// Validate access code if required
		if (data.access_type === 'code' && !data.access_code) {
			return {
				success: false,
				message: 'Código de acesso é obrigatório quando o tipo de acesso é "code"'
			};
		}

		// Create training object
		const training = new Training({
			name: data.session_name,
			description: data.session_description || '',
			created_by: data.user_id,
			scenario: {
				category_id: data.scenario.category_id,
				type_id: data.scenario.type_id,
				scenario_id: data.scenario.scenario_id,
				scenario_title: data.scenario.scenario_title
			},
			access_type: data.access_type || 'open',
			access_code: data.access_code || undefined,
			max_participants: parseInt(data.max_participants) || 15,
			status: 'scheduled',
			participants: [{
				user_id: data.user_id,
				role: 'facilitator',
				joined_at: new Date()
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
