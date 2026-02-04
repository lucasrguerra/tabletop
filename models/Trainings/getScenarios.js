import fs from 'fs';
import path from 'path';

/**
 * Returns all available scenarios for a specific incident type
 * 
 * @param {string} category_id - Category ID (e.g., 'NET_VOL')
 * @param {string} type_id - Type ID (e.g., 'NET_VOL_DNS_REFLECTION')
 * @returns {Promise<Object>} Object with success status, scenarios array, and optional error message
 * 
 * @example
 * const result = await getScenarios('NET_VOL', 'NET_VOL_DNS_REFLECTION');
 * if (result.success) {
 *   console.log(result.scenarios);
 * }
 */
export default async function getScenarios(category_id, type_id) {
	try {
		if (!category_id || !type_id) {
			return {
				success: false,
				message: 'Categoria e tipo são obrigatórios',
				scenarios: []
			};
		}

		const scenarios_base_path = path.join(process.cwd(), 'scenarios');
		const category_path = path.join(scenarios_base_path, category_id);

		// Check if category folder exists
		if (!fs.existsSync(category_path)) {
			return {
				success: true,
				scenarios: [],
				message: 'Nenhum cenário disponível para esta categoria'
			};
		}

		const type_path = path.join(category_path, type_id);

		// Check if type folder exists
		if (!fs.existsSync(type_path)) {
			return {
				success: true,
				scenarios: [],
				message: 'Nenhum cenário disponível para este tipo de incidente'
			};
		}

		// Read all JSON files in the type folder
		const files = fs.readdirSync(type_path);
		const json_files = files.filter(file => file.endsWith('.json'));

		const scenarios = [];

		for (const file of json_files) {
			const file_path = path.join(type_path, file);
			const file_content = fs.readFileSync(file_path, 'utf-8');
			const scenario_data = JSON.parse(file_content);

			// Extract relevant information for listing
			scenarios.push({
				id: scenario_data.id,
				category: scenario_data.category,
				type: scenario_data.type,
				title: scenario_data.title,
				description: scenario_data.description,
				metadata: scenario_data.metadata,
			});
		}

		return {
			success: true,
			scenarios,
			count: scenarios.length
		};
	} catch (error) {
		console.error('Error reading scenarios:', error);
		return {
			success: false,
			message: 'Erro ao carregar cenários',
			scenarios: []
		};
	}
}
