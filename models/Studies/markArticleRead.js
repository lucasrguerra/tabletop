import dbConnect from '@/database/database';
import StudyProgress from '@/database/schemas/StudyProgress';

/**
 * Marks a study article as read or completed for a user.
 * Uses atomic upsert: creates the progress document if it doesn't exist,
 * pushes a new article entry or updates existing one.
 *
 * @param {string} user_id - MongoDB ObjectId of the user
 * @param {Object} payload - Article info
 * @param {string} payload.article_id - Article ID (kebab-case)
 * @param {string} payload.category - Category ID (e.g., 'NET_ROUT')
 * @param {string} payload.content_type - Content type ('CONCEITO', etc.)
 * @param {string} payload.action - 'read' or 'complete'
 * @returns {Promise<Object>} Object with success status and updated progress
 */
export default async function markArticleRead(user_id, payload) {
    try {
        await dbConnect();

        const { article_id, category, content_type, action } = payload;
        const now = new Date();

        // Check if article already exists in the user's progress
        const existing = await StudyProgress.findOne(
            { user_id, 'articles.article_id': article_id },
            { 'articles.$': 1 }
        ).lean();

        let updated;

        if (existing) {
            // Article already tracked — update last_read_at and increment read_count
            const update = {
                $set: {
                    'articles.$.last_read_at': now,
                    last_activity_at: now
                },
                $inc: {
                    'articles.$.read_count': 1
                }
            };

            if (action === 'complete') {
                update.$set['articles.$.completed'] = true;
                update.$set['articles.$.completed_at'] = now;
                update.$inc['total_completed'] = 1;
            }

            updated = await StudyProgress.findOneAndUpdate(
                { user_id, 'articles.article_id': article_id },
                update,
                { new: true }
            ).lean();
        } else {
            // New article — push to array
            const new_entry = {
                article_id,
                category,
                content_type,
                first_read_at: now,
                last_read_at: now,
                read_count: 1,
                completed: action === 'complete',
                completed_at: action === 'complete' ? now : null
            };

            const inc_update = { total_read: 1, 'articles_count': 1 };
            if (action === 'complete') {
                inc_update.total_completed = 1;
            }

            updated = await StudyProgress.findOneAndUpdate(
                { user_id },
                {
                    $push: { articles: new_entry },
                    $set: { last_activity_at: now },
                    $inc: inc_update
                },
                { new: true, upsert: true }
            ).lean();
        }

        return {
            success: true,
            progress: updated
        };

    } catch (error) {
        console.error('Error marking article read:', error);
        return {
            success: false,
            message: 'Erro ao registrar progresso'
        };
    }
}
