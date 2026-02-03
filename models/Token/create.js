import Token from '@/database/schemas/Token';
import { hashToken, getTokenExpiry } from '@/utils/jwt';

/**
 * Create and store a new token in the database
 * @param {string} user_id - User ID
 * @param {string} token - JWT token to store (will be hashed)
 * @param {string} token_id - Token ID from JWT payload
 * @param {Object} metadata - Optional metadata (userAgent, ipAddress)
 * @returns {Promise<Object>} Created token document
 */
export default async function createToken(user_id, token, token_id, metadata = {}) {
	try {
		const token_hash = hashToken(token);
		const expires_at = getTokenExpiry();

		const tokenDoc = await Token.create({
			user_id: user_id,
			token_hash: token_hash,
			token_id: token_id,
			expires_at: expires_at,
			user_agent: metadata.userAgent || null,
			ip_address: metadata.ipAddress || null,
		});

		return {
			success: true,
			token: tokenDoc
		};
	} catch (error) {
		console.error('Error creating token:', error);
		return {
			success: false,
			message: 'Erro ao criar token'
		};
	}
}
