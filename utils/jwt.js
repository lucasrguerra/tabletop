import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
const TOKEN_EXPIRY = '30d';

if (!JWT_SECRET) {
	throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables');
}

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode in the token
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.nickname - User nickname
 * @returns {Object} Token object with token and token_id
 */
export function generateToken(payload) {
	const token_id = crypto.randomBytes(16).toString('hex');
	
	const token = jwt.sign(
		{
			...payload,
			token_id: token_id, // Unique identifier for this specific token
			type: 'session'
		},
		JWT_SECRET,
		{
			expiresIn: TOKEN_EXPIRY,
			issuer: 'tabletop-app',
			audience: 'tabletop-users'
		}
	);

	return { token, token_id };
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
	try {
		const decoded = jwt.verify(token, JWT_SECRET, {
			issuer: 'tabletop-app',
			audience: 'tabletop-users'
		});
		return decoded;
	} catch (error) {
		console.error('Token verification failed:', error.message);
		return null;
	}
}

/**
 * Decode token without verification (for extracting tokenId)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function decodeToken(token) {
	try {
		return jwt.decode(token);
	} catch (error) {
		console.error('Token decode failed:', error.message);
		return null;
	}
}

/**
 * Hash a token for secure storage
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get expiration date for a token
 * @returns {Date} Expiration date (30 days from now)
 */
export function getTokenExpiry() {
	return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}
