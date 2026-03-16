/**
 * Server-side Socket.io utility
 * Used by API routes to emit events to connected clients.
 * Requires the custom server (server.mjs) to set global.io.
 */

/**
 * Get the Socket.io server instance
 * @returns {import('socket.io').Server | null}
 */
function getIO() {
	return global.io || null;
}

/**
 * Emit a training update event to all clients in a training room.
 * Clients should refetch training data when they receive this event.
 * @param {string} trainingId - The training ID
 * @param {object} [data] - Optional data to send with the event
 */
export function emitTrainingUpdate(trainingId, data = {}) {
	const io = getIO();
	if (io) {
		io.to(`training:${trainingId}`).emit('training:updated', {
			trainingId,
			timestamp: Date.now(),
			...data,
		});
	}
}

/**
 * Emit a response submitted event to all clients in a training room.
 * Used when a participant submits an answer.
 * @param {string} trainingId - The training ID
 * @param {object} [data] - Optional data to send with the event
 */
export function emitResponseUpdate(trainingId, data = {}) {
	const io = getIO();
	if (io) {
		io.to(`training:${trainingId}`).emit('training:response-submitted', {
			trainingId,
			timestamp: Date.now(),
			...data,
		});
	}
}

/**
 * Emit a notification event to a specific user.
 * @param {string} userId - The user ID
 * @param {object} [data] - Optional notification data
 */
export function emitNotification(userId, data = {}) {
	const io = getIO();
	if (io) {
		io.to(`user:${userId}`).emit('notification:new', {
			userId,
			timestamp: Date.now(),
			...data,
		});
	}
}
