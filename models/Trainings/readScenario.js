import fs from 'fs';
import path from 'path';

/**
 * Reads a scenario JSON file based on category, type, and scenario IDs
 * 
 * @param {string} scenario_id - Scenario ID
 * @param {string} category - Category ID (e.g., 'NET_VOL')
 * @param {string} type - Type ID (e.g., 'NET_VOL_DNS_REFLECTION')
 * @returns {Promise<Object>} Object with success status, scenario data, and optional error message
 * 
 * @example
 * const result = await readScenario('dns-amplification-scenario');
 * if (result.success) {
 *   console.log(result.scenario);
 */
export default async function readScenario(scenario_id, category, type) {
    try {
        if (!scenario_id || !category || !type) {
            return {
                success: false,
                message: 'IDs de cenário, categoria e tipo são obrigatórios',
                scenario: null
            };
        }

        const scenario_path = path.join(
            process.cwd(),
            'scenarios',
            category,
            type,
            `${scenario_id}.json`
        );

        if (!fs.existsSync(scenario_path)) {
            return {
                success: false,
                message: 'Cenário não encontrado',
                scenario: null
            };
        }
        console.log('Reading scenario from path:', scenario_path);

        const file_content = fs.readFileSync(scenario_path, 'utf-8');
        const scenario_data = JSON.parse(file_content);

        return {
            success: true,
            scenario: scenario_data
        };
        
    } catch (error) {
        console.error('Error reading scenario:', error);
        return {
            success: false,
            message: 'Erro ao ler o cenário',
            scenario: null
        };
    }
}