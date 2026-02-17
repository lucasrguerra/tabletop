import Notification from '@/database/schemas/Notification';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Marks one or all notifications as read for a user
 * 
 * @param {string} user_id - ID of the user
 * @param {string|null} notification_id - ID of a specific notification, or null to mark all as read
 * @returns {Promise<Object>} Object with success status
 */
export default async function markAsRead(user_id, notification_id = null) {
	try {
		await connectDatabase();

		if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
			return { success: false, message: 'ID de usuário inválido' };
		}

		if (notification_id) {
			if (!mongoose.Types.ObjectId.isValid(notification_id)) {
				return { success: false, message: 'ID de notificação inválido' };
			}

			const result = await Notification.updateOne(
				{ _id: notification_id, user_id },
				{ $set: { is_read: true } }
			);

			if (result.matchedCount === 0) {
				return { success: false, message: 'Notificação não encontrada' };
			}

			return { success: true, message: 'Notificação marcada como lida' };
		}

		// Mark all as read
		await Notification.updateMany(
			{ user_id, is_read: false },
			{ $set: { is_read: true } }
		);

		return { success: true, message: 'Todas as notificações marcadas como lidas' };
	} catch (error) {
		console.error('Error marking notifications as read:', error);
		return { success: false, message: 'Erro ao marcar notificações como lidas' };
	}
}
