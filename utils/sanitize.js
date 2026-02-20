/**
 * Sanitization utilities to prevent NoSQL injection and other attacks
 * 
 * IMPORTANT: Do NOT sanitize passwords!
 * Passwords should contain any characters (including $ { } [ ]) since they are:
 * - Only used for hashing (bcrypt)
 * - Never used directly in database queries
 * - Need to support all special characters for security
 */

/**
 * Sanitize user input to prevent NoSQL injection
 * Removes objects, arrays, and MongoDB operators from user input
 * @param {any} input - User input to sanitize
 * @returns {any} Sanitized input
 */
export function sanitizeInput(input) {
	if (input === null || input === undefined) {
		return input;
	}

	// If input is an object or array, reject it (common NoSQL injection pattern)
	if (typeof input === 'object') {
		throw new Error('Formato de entrada inválido');
	}

	// Convert to string and check for MongoDB operators
	const str = String(input);
	
	// Reject inputs containing MongoDB operators
	const mongo_operators = ['$', '{', '}', '[', ']'];
	for (const op of mongo_operators) {
		if (str.includes(op)) {
			throw new Error('Formato de entrada inválido');
		}
	}

	return str;
}

/**
 * Validate and sanitize email input
 * @param {string} email - Email to validate and sanitize
 * @returns {string} Sanitized email
 * @throws {Error} If email is invalid
 */
export function sanitizeEmail(email) {
	const sanitized = sanitizeInput(email);
	
	if (typeof sanitized !== 'string') {
		throw new Error('Email deve ser uma string');
	}
	
	// Additional email-specific sanitization
	const trimmed = sanitized.trim().toLowerCase();
	
	// Max length check
	if (trimmed.length > 254) {
		throw new Error('Email muito longo');
	}
	
	return trimmed;
}

/**
 * Validate and sanitize nickname input
 * @param {string} nickname - Nickname to validate and sanitize
 * @returns {string} Sanitized nickname
 * @throws {Error} If nickname is invalid
 */
export function sanitizeNickname(nickname) {
	const sanitized = sanitizeInput(nickname);
	
	if (typeof sanitized !== 'string') {
		throw new Error('Nickname deve ser uma string');
	}
	
	const trimmed = sanitized.trim().toLowerCase();
	
	// Length check
	if (trimmed.length < 3 || trimmed.length > 30) {
		throw new Error('O nickname deve ter entre 3 e 30 caracteres');
	}
	
	// Only allow alphanumeric, underscores, and dots
	if (!/^[a-z0-9_.]+$/.test(trimmed)) {
		throw new Error('O nickname deve conter apenas letras, números, pontos e underscores');
	}
	
	return trimmed;
}

/**
 * Validate and sanitize name input
 * @param {string} name - Name to validate and sanitize
 * @returns {string} Sanitized name
 * @throws {Error} If name is invalid
 */
export function sanitizeName(name) {
	const sanitized = sanitizeInput(name);
	
	if (typeof sanitized !== 'string') {
		throw new Error('Nome deve ser uma string');
	}
	
	const trimmed = sanitized.trim();
	
	// Length check
	if (trimmed.length < 3 || trimmed.length > 100) {
		throw new Error('O nome deve ter entre 3 e 100 caracteres');
	}
	
	// Remove any HTML tags or special characters that could be dangerous
	const cleaned = trimmed.replace(/<[^>]*>/g, '');
	
	if (cleaned !== trimmed) {
		throw new Error('O nome contém caracteres inválidos');
	}
	
	return cleaned;
}
