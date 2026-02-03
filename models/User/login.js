import getOne from '@/models/User/getOne';
import { compare } from '@/models/Password';
import { generateToken } from '@/utils/jwt';
import createToken from '@/models/Token/create';
import { randomDelay } from '@/utils/timingSafe';

/**
 * Login a user with email/nickname and password
 * @param {string} identifier - Email or nickname
 * @param {string} password - Plain text password
 * @param {Object} metadata - Optional metadata (userAgent, ipAddress)
 * @returns {Promise<Object>} Result object with success status and message/user data/token
 */
export default async function Login(identifier, password, metadata = {}) {
	try {
		if (!identifier || !password) {
			await randomDelay();
			return {
				success: false,
				message: 'Email/Nickname ou senha inválidos'
			};
		}

		const user = await getOne(identifier, true);
		if (!user) {
			await randomDelay();
			return {
				success: false,
				message: 'Email/Nickname ou senha inválidos'
			};
		}

		const isPasswordValid = await compare(password, user.password_hash);
		if (!isPasswordValid) {
			await randomDelay();
			return {
				success: false,
				message: 'Email/Nickname ou senha inválidos'
			};
		}

		const { token, token_id } = generateToken({
			id: user.id,
			email: user.email,
			nickname: user.nickname,
			name: user.name
		});
		const tokenResult = await createToken(user.id, token, token_id, metadata);
		
		if (!tokenResult.success) {
			return {
				success: false,
				message: 'Erro ao criar sessão'
			};
		}

		return {
			success: true,
			message: 'Login realizado com sucesso',
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				nickname: user.nickname,
			}
		};
	} catch (error) {
		console.error('Error authenticating user');
		await randomDelay();
		return {
			success: false,
			message: 'Erro ao fazer login. Por favor, tente novamente.'
		};
	}
}