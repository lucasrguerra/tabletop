import fs from 'fs';
import path from 'path';

/**
 * Lists all study articles with optional filtering.
 * Returns only metadata fields (no content body) for index/listing views.
 *
 * @param {Object} filters - Optional filters
 * @param {string} [filters.category] - Filter by category ID (e.g., 'NET_ROUT')
 * @param {string} [filters.content_type] - Filter by content type ('CONCEITO','PROCEDIMENTO','FERRAMENTA','GLOSSARIO')
 * @param {string} [filters.difficulty] - Filter by difficulty ('Basico','Intermediario','Avancado')
 * @returns {Promise<Object>} Object with success status and articles array
 */
export default async function getStudyArticles(filters = {}) {
    try {
        const studies_base = path.resolve(process.cwd(), 'studies');

        if (!fs.existsSync(studies_base)) {
            return {
                success: true,
                articles: [],
                count: 0
            };
        }

        const articles = [];
        collectArticles(studies_base, studies_base, articles);

        // Apply filters
        let filtered = articles;

        if (filters.category) {
            filtered = filtered.filter(a => a.category?.id === filters.category);
        }

        if (filters.content_type) {
            filtered = filtered.filter(a => a.content_type === filters.content_type);
        }

        if (filters.difficulty) {
            filtered = filtered.filter(a => a.metadata?.difficulty === filters.difficulty);
        }

        // Sort: glossaries last, then by category, then by difficulty order
        const DIFFICULTY_ORDER = { Basico: 0, Intermediario: 1, Avancado: 2 };
        filtered.sort((a, b) => {
            if (a.content_type === 'GLOSSARIO' && b.content_type !== 'GLOSSARIO') return 1;
            if (a.content_type !== 'GLOSSARIO' && b.content_type === 'GLOSSARIO') return -1;
            const catCompare = (a.category?.id || '').localeCompare(b.category?.id || '');
            if (catCompare !== 0) return catCompare;
            return (DIFFICULTY_ORDER[a.metadata?.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.metadata?.difficulty] ?? 1);
        });

        return {
            success: true,
            articles: filtered,
            count: filtered.length
        };

    } catch (error) {
        console.error('Error listing study articles:', error);
        return {
            success: false,
            message: 'Erro ao listar artigos',
            articles: [],
            count: 0
        };
    }
}

/**
 * Recursively collects article metadata (without the 'content' field) from all JSON files.
 */
function collectArticles(dir, base_dir, articles) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const full_path = path.join(dir, entry.name);
        const resolved = path.resolve(full_path);

        if (!resolved.startsWith(base_dir + path.sep) && resolved !== base_dir) {
            continue;
        }

        if (entry.isDirectory()) {
            collectArticles(full_path, base_dir, articles);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            try {
                const file_content = fs.readFileSync(resolved, 'utf-8');
                const data = JSON.parse(file_content);

                // Return metadata only — exclude the heavy 'content' field
                const { content, ...metadata } = data;
                articles.push(metadata);
            } catch (e) {
                console.warn(`Failed to parse study file: ${resolved}`, e.message);
            }
        }
    }
}
