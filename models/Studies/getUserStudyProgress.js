import dbConnect from '@/database/database';
import StudyProgress from '@/database/schemas/StudyProgress';

/**
 * Fetches the study progress document for a user.
 *
 * @param {string} user_id - MongoDB ObjectId of the user
 * @returns {Promise<Object>} Object with success status and progress data
 */
export default async function getUserStudyProgress(user_id) {
    try {
        await dbConnect();

        const progress = await StudyProgress.findOne({ user_id }).lean();

        if (!progress) {
            return {
                success: true,
                progress: null,
                articles: []
            };
        }

        return {
            success: true,
            progress,
            articles: progress.articles || []
        };

    } catch (error) {
        console.error('Error fetching study progress:', error);
        return {
            success: false,
            message: 'Erro ao buscar progresso',
            progress: null,
            articles: []
        };
    }
}
