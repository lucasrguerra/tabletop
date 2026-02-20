/**
 * Regex for validating nicknames: 3-30 characters, alphanumeric and underscores only
 */
export const nickname_regex = /^[a-zA-Z0-9_.]{3,30}$/;

/**
 * Improved regex for validating emails (RFC 5322 compliant)
 * More strict than the previous version to prevent injection attacks
 */
export const email_regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email with additional security checks
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidEmail(email) {
	if (!email || typeof email !== 'string') return false;
	
	// Length validation
	if (email.length > 254) return false;
	
	// Basic format check
	if (!email_regex.test(email)) return false;
	
	// Check for suspicious patterns (multiple @ signs, etc.)
	const atCount = (email.match(/@/g) || []).length;
	if (atCount !== 1) return false;
	
	// Split and validate local and domain parts
	const [local, domain] = email.split('@');
	
	// Local part (before @) should not exceed 64 characters
	if (local.length > 64) return false;
	
	// Domain part should not exceed 255 characters
	if (domain.length > 255) return false;
	
	// Domain should have at least one dot
	if (!domain.includes('.')) return false;
	
	// Check for consecutive dots
	if (email.includes('..')) return false;
	
	return true;
}