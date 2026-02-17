import Notification from '@/database/schemas/Notification';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Creates a new notification for a user
 * 
 * @param {Object} params - Notification parameters
 * @param {string} params.user_id - ID of the user to notify
 * @param {string} params.type - Notification type
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string|null} params.training_id - Related training ID
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Object with success status
 */
export default async function createNotification({ user_id, type, title, message, training_id = null, metadata = {} }) {
	try {
		await connectDatabase();

		if (!user_id || !type || !title || !message) {
			return { success: false, message: 'Campos obrigatórios ausentes' };
		}

		if (!mongoose.Types.ObjectId.isValid(user_id)) {
			return { success: false, message: 'ID de usuário inválido' };
		}

		const notification = await Notification.create({
			user_id,
			type,
			title,
			message,
			training_id,
			metadata,
		});

		return {
			success: true,
			notification: {
				id: notification._id.toString(),
				type: notification.type,
				title: notification.title,
				message: notification.message,
			}
		};
	} catch (error) {
		console.error('Error creating notification:', error);
		return { success: false, message: 'Erro ao criar notificação' };
	}
}
