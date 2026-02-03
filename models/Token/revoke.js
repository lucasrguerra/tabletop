import Token from '@/database/schemas/Token';
import { hashToken } from '@/utils/jwt';

/**
 * Revoke (delete) a specific token
 * @param {string} token - JWT token to revoke
 * @returns {Promise<Object>} Revocation result
 */
export async function revokeToken(token) {
	try {
		const token_hash = hashToken(token);
		const result = await Token.deleteOne({ tokenHash: token_hash });

		if (result.deletedCount === 0) {
			return {
				success: false,
				message: 'Token não encontrado'
			};
		}

		return {
			success: true,
			message: 'Token revogado com sucesso'
		};
	} catch (error) {
		console.error('Error revoking token:', error);
		return {
			success: false,
			message: 'Erro ao revogar token'
		};
	}
}

/**
 * Revoke a token by its ID
 * @param {string} token_id - Token document ID
 * @param {string} user_id - User ID (for authorization)
 * @returns {Promise<Object>} Revocation result
 */
export async function revokeTokenById(token_id, user_id) {
	try {
		const result = await Token.deleteOne({ 
			_id: token_id,
			user_id 
		});

		if (result.deletedCount === 0) {
			return {
				success: false,
				message: 'Token não encontrado ou não autorizado'
			};
		}

		return {
			success: true,
			message: 'Sessão revogada com sucesso'
		};
	} catch (error) {
		console.error('Error revoking token by ID:', error);
		return {
			success: false,
			message: 'Erro ao revogar sessão'
		};
	}
}

/**
 * Revoke all tokens for a user except the current one
 * @param {string} user_id - User ID
 * @param {string} current_token - Current token to keep (optional)
 * @returns {Promise<Object>} Revocation result
 */
export async function revokeAllUserTokens(user_id, current_token = null) {
	try {
		const query = { user_id };
		
		if (current_token) {
			const current_token_hash = hashToken(current_token);
			query.tokenHash = { $ne: current_token_hash };
		}

		const result = await Token.deleteMany(query);

		return {
			success: true,
			message: `${result.deletedCount} sessão(ões) revogada(s)`,
			count: result.deletedCount
		};
	} catch (error) {
		console.error('Error revoking all user tokens:', error);
		return {
			success: false,
			message: 'Erro ao revogar sessões'
		};
	}
}
