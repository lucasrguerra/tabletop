import fs from 'fs';
import path from 'path';

/**
 * Returns all available incident categories and their types
 * 
 * @returns {Promise<Object>} Object with success status, categories array, and optional error message
 * 
 * @example
 * const result = await getCategories();
 * if (result.success) {
 *   console.log(result.categories);
 * }
 */
export default async function getCategories() {
	try {
		const categories_path = path.join(process.cwd(), 'scenarios', 'categories.json');
		
		// Read categories file
		const file_content = fs.readFileSync(categories_path, 'utf-8');
		const categories = JSON.parse(file_content);
		
		return {
			success: true,
			categories
		};
	} catch (error) {
		console.error('Error reading categories:', error);
		return {
			success: false,
			message: 'Erro ao carregar categorias',
			categories: []
		};
	}
}
