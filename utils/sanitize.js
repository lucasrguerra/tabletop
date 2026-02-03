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
		throw new Error('Invalid input format');
	}

	// Convert to string and check for MongoDB operators
	const str = String(input);
	
	// Reject inputs containing MongoDB operators
	const mongo_operators = ['$', '{', '}', '[', ']'];
	for (const op of mongo_operators) {
		if (str.includes(op)) {
			throw new Error('Invalid input format');
		}
	}

	return str;
}

/**
 * Sanitize an object's string fields to prevent NoSQL injection
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} fields - Field names to sanitize
 * @returns {Object} Object with sanitized fields
 */
export function sanitizeObject(obj, fields) {
	const sanitized = { ...obj };
	
	for (const field of fields) {
		if (sanitized[field] !== undefined && sanitized[field] !== null) {
			sanitized[field] = sanitizeInput(sanitized[field]);
		}
	}
	
	return sanitized;
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
		throw new Error('Email must be a string');
	}
	
	// Additional email-specific sanitization
	const trimmed = sanitized.trim().toLowerCase();
	
	// Max length check
	if (trimmed.length > 254) {
		throw new Error('Email too long');
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
		throw new Error('Nickname must be a string');
	}
	
	const trimmed = sanitized.trim().toLowerCase();
	
	// Length check
	if (trimmed.length < 3 || trimmed.length > 30) {
		throw new Error('Nickname must be between 3 and 30 characters');
	}
	
	// Only allow alphanumeric and underscores
	if (!/^[a-z0-9_]+$/.test(trimmed)) {
		throw new Error('Nickname can only contain letters, numbers, and underscores');
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
		throw new Error('Name must be a string');
	}
	
	const trimmed = sanitized.trim();
	
	// Length check
	if (trimmed.length < 3 || trimmed.length > 100) {
		throw new Error('Name must be between 3 and 100 characters');
	}
	
	// Remove any HTML tags or special characters that could be dangerous
	const cleaned = trimmed.replace(/<[^>]*>/g, '');
	
	if (cleaned !== trimmed) {
		throw new Error('Name contains invalid characters');
	}
	
	return cleaned;
}
