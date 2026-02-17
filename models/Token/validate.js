import Token from '@/database/schemas/Token';
import { hashToken } from '@/utils/jwt';

/**
 * Validate if a token exists in the database and is not expired
 * @param {string} token - JWT token to validate
 * @returns {Promise<Object>} Validation result with token document if valid
 */
export default async function validateToken(token) {
	try {
		const token_hash = hashToken(token);

		const tokenDoc = await Token.findOne({
			token_hash: token_hash,
			expires_at: { $gt: new Date() }
		}).populate('user_id', 'name email nickname');

		if (!tokenDoc) {
			return {
				valid: false,
				message: 'Token inválido ou expirado'
			};
		}

		return {
			valid: true,
			token: tokenDoc,
			user: tokenDoc.user_id
		};
	} catch (error) {
		console.error('Error validating token:', error);
		return {
			valid: false,
			message: 'Erro ao validar token'
		};
	}
}
