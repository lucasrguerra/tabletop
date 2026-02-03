import User from '@/database/schemas/User';

/**
 * Get one user by email or nickname
 * @param {string} identifier - Email or nickname
 * @param {boolean} with_password - Whether to include the password hash
 * @returns {Promise<Object|null>} User object or null if not found
 */
export default async function getOne(identifier, with_password = false) {
	try {
		const normalized_identifier = identifier.toLowerCase().trim();

        let user;
		if (normalized_identifier.includes('@')) {
			user = await User.findOne({ 
				email: normalized_identifier
			}).select(with_password ? '+password_hash' : '-password_hash');
		} else {
			user = await User.findOne({ 
				nickname: normalized_identifier
			}).select(with_password ? '+password_hash' : '-password_hash');
		}

		if (!user) { return null; }
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            nickname: user.nickname,
            password_hash: with_password ? user.password_hash : undefined,
        }

	} catch (error) {
		console.error('Error getting user by identifier:', error);
		return {
			success: false,
			message: 'Erro ao buscar usuário. Por favor, tente novamente.'
		}
	}
}