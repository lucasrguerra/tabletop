import User from '@/database/schemas/User';
import getOne from '@/models/User/getOne';
import { hash, isComplex } from '@/models/Password';
import { nickname_regex, isValidEmail } from '@/utils/regexes';

/**
 * Register a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} nickname - User's nickname
 * @param {string} password - User's password
 * @returns {Promise<Object>} Result object with success status and message/user data
 */
export default async function register(name, email, nickname, password) {
	try {
		if (!name || !email || !nickname || !password) {
			return { 
				success: false, 
				message: 'Todos os campos são obrigatórios'
			};
		}

		if (name.trim().length < 3 || name.length > 100) {
			return { 
				success: false, 
				message: 'O nome deve ter entre 3 e 100 caracteres'
			};
		}

		if (!isValidEmail(email)) {
			return { 
				success: false, 
				message: 'Email inválido' 
			};
		}

		if (!nickname_regex.test(nickname)) {
			return { 
				success: false, 
				message: 'O nickname deve conter apenas letras, números e underscores e ter entre 3 e 30 caracteres' 
			};
		}

		if (!isComplex(password)) {
			return { 
				success: false, 
				message: 'A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais' 
			};
		}

		const normalized_email = email.toLowerCase().trim();
		const normalized_nickname = nickname.toLowerCase().trim();

		const existing_user_by_email = await getOne(normalized_email);
		if (existing_user_by_email) {
			return { 
				success: false, 
				message: 'Este email já está em uso'
			};
		}

		const existing_user_by_nickname = await getOne(normalized_nickname, 'nickname');
		if (existing_user_by_nickname) {
			return { 
				success: false, 
				message: 'Este nickname já está em uso'
			};
		}

		const password_hash = await hash(password);
		const newUser = new User({
			name: name.trim(),
			email: normalized_email,
			nickname: normalized_nickname,
			password_hash: password_hash,
		});

		await newUser.save();

		return {
			success: true,
			message: 'Usuário registrado com sucesso',
			user: {
				id: newUser._id.toString(),
				name: newUser.name,
				email: newUser.email,
				nickname: newUser.nickname,
			}
		};

	} catch (error) {
		console.error('Erro ao registrar usuário:', error);
		
		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			return { 
				success: false, 
				message: `Este ${field === 'email' ? 'email' : 'nickname'} já está em uso` 
			};
		}

		return { 
			success: false, 
			message: 'Erro ao registrar usuário. Por favor, tente novamente.' 
		};
	}
}
