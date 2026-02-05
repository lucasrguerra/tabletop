import Token from '@/database/schemas/Token';

/**
 * Get all active tokens/sessions for a user
 * @param {string} user_id - User ID
 * @returns {Promise<Object>} List of active sessions
 */
export default async function getUserTokens(user_id) {
	try {
		const tokens = await Token.find({
			user_id: user_id,
			expires_at: { $gt: new Date() }
		})
		.select('_id token_id created_at expires_at user_agent ip_address')
		.sort({ created_at: -1 })
		.lean();

		return {
			success: true,
			tokens
		};
	} catch (error) {
		console.error('Error fetching user tokens:', error);
		return {
			success: false,
			message: 'Erro ao buscar sessões',
			tokens: []
		};
	}
}
