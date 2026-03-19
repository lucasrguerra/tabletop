import fs from 'fs';
import path from 'path';

/**
 * Validates a path component to prevent directory traversal attacks.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
function isSafePathComponent(component) {
    if (typeof component !== 'string' || component.length === 0 || component.length > 100) {
        return false;
    }
    return /^[a-zA-Z0-9_-]+$/.test(component);
}

/**
 * Reads a study article JSON file by searching for its ID across all category/type subdirectories.
 *
 * @param {string} article_id - The article ID (kebab-case, must match the "id" field in the JSON)
 * @returns {Promise<Object>} Object with success status, article data, and optional error message
 */
export default async function readStudyArticle(article_id) {
    try {
        if (!article_id) {
            return {
                success: false,
                message: 'ID do artigo é obrigatório',
                article: null
            };
        }

        if (!isSafePathComponent(article_id)) {
            return {
                success: false,
                message: 'ID contém caracteres inválidos',
                article: null
            };
        }

        const studies_base = path.resolve(process.cwd(), 'studies');

        if (!fs.existsSync(studies_base)) {
            return {
                success: false,
                message: 'Diretório de estudos não encontrado',
                article: null
            };
        }

        // Walk the studies/ directory tree to find the article by ID
        const found = findArticleFile(studies_base, article_id, studies_base);

        if (!found) {
            return {
                success: false,
                message: 'Artigo não encontrado',
                article: null
            };
        }

        const file_content = fs.readFileSync(found, 'utf-8');
        const article_data = JSON.parse(file_content);

        return {
            success: true,
            article: article_data
        };

    } catch (error) {
        console.error('Error reading study article:', error);
        return {
            success: false,
            message: 'Erro ao ler o artigo',
            article: null
        };
    }
}

/**
 * Recursively searches for a JSON file matching the given article_id.
 * Returns the resolved file path if found, null otherwise.
 */
function findArticleFile(dir, article_id, base_dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const full_path = path.join(dir, entry.name);

        // Security: ensure we stay within the studies base directory
        const resolved = path.resolve(full_path);
        if (!resolved.startsWith(base_dir + path.sep) && resolved !== base_dir) {
            continue;
        }

        if (entry.isDirectory()) {
            const result = findArticleFile(full_path, article_id, base_dir);
            if (result) return result;
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            // Check if this file matches the article_id without reading full content
            const name_without_ext = entry.name.replace(/\.json$/, '');
            if (name_without_ext === article_id) {
                return resolved;
            }
        }
    }

    return null;
}
