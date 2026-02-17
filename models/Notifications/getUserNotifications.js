import Notification from '@/database/schemas/Notification';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Retrieves notifications for a user with pagination
 * 
 * @param {string} user_id - ID of the user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.filter - Filter: 'all', 'read', 'unread' (default: 'all')
 * @returns {Promise<Object>} Object with success status and notifications
 */
export default async function getUserNotifications(user_id, options = {}) {
	try {
		await connectDatabase();

		if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
			return { success: false, message: 'ID de usuário inválido' };
		}

		const page = Math.max(1, options.page || 1);
		const limit = Math.min(50, Math.max(1, options.limit || 20));
		const filter = options.filter || 'all';

		const query = { user_id };
		if (filter === 'read') query.is_read = true;
		if (filter === 'unread') query.is_read = false;

		const [notifications, total, unread_count] = await Promise.all([
			Notification.find(query)
				.sort({ created_at: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.lean(),
			Notification.countDocuments(query),
			Notification.countDocuments({ user_id, is_read: false }),
		]);

		return {
			success: true,
			notifications: notifications.map(n => ({
				id: n._id.toString(),
				type: n.type,
				title: n.title,
				message: n.message,
				training_id: n.training_id?.toString() || null,
				metadata: n.metadata,
				is_read: n.is_read,
				created_at: n.created_at,
			})),
			unread_count,
			pagination: {
				page,
				limit,
				total,
				total_pages: Math.ceil(total / limit),
			}
		};
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return { success: false, message: 'Erro ao buscar notificações' };
	}
}
