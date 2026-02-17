import fs from 'fs';
import path from 'path';

/**
 * Validates a path component to prevent directory traversal attacks.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * @param {string} component - Path component to validate
 * @returns {boolean} True if safe, false if potentially malicious
 */
function isSafePathComponent(component) {
    if (typeof component !== 'string' || component.length === 0 || component.length > 100) {
        return false;
    }
    // Only allow alphanumeric, hyphens, underscores (no dots, slashes, etc.)
    return /^[a-zA-Z0-9_-]+$/.test(component);
}

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

        // Validate path components to prevent directory traversal
        if (!isSafePathComponent(category) || !isSafePathComponent(type) || !isSafePathComponent(scenario_id)) {
            return {
                success: false,
                message: 'Parâmetros contêm caracteres inválidos',
                scenario: null
            };
        }

        const scenarios_base = path.resolve(process.cwd(), 'scenarios');
        const scenario_path = path.join(scenarios_base, category, type, `${scenario_id}.json`);

        // Ensure resolved path is within the scenarios directory
        const resolved_path = path.resolve(scenario_path);
        if (!resolved_path.startsWith(scenarios_base + path.sep)) {
            return {
                success: false,
                message: 'Caminho de cenário inválido',
                scenario: null
            };
        }

        if (!fs.existsSync(resolved_path)) {
            return {
                success: false,
                message: 'Cenário não encontrado',
                scenario: null
            };
        }

        const file_content = fs.readFileSync(resolved_path, 'utf-8');
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