import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { constantTimeCompare } from '@/utils/timingSafe';

/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Generates and validates CSRF tokens using HMAC for stateless validation
 * This approach works across serverless instances without shared state
 */

const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET) {
	console.warn('[SECURITY] CSRF_SECRET is not set. CSRF tokens will not persist across server restarts. Set CSRF_SECRET in environment variables for production.');
}
const _csrf_secret = CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_VALIDITY_MS = 60 * 60 * 1000;

/**
 * Generate a CSRF token for a user session using HMAC
 * Format: timestamp.session_id.signature
 * @param {string} session_id - User session identifier
 * @returns {string} CSRF token
 */
export function generateCsrfToken(session_id) {
	if (!session_id) {
		throw new Error('session_id is required to generate CSRF token');
	}

	const timestamp = Date.now().toString();
	const message = `${timestamp}.${session_id}`;
	
	const hmac = crypto.createHmac('sha256', _csrf_secret);
	hmac.update(message);
	const signature = hmac.digest('hex');
	const token = `${timestamp}.${session_id}.${signature}`;

	return token;
}

/**
 * Validate a CSRF token using HMAC verification
 * @param {string} token - CSRF token to validate
 * @param {string} session_id - User session identifier
 * @returns {boolean} True if valid, false otherwise
 */
export function validateCsrfToken(token, session_id) {
	if (!token || !session_id) {
		return false;
	}

	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return false;
		}

		const [timestamp, token_session_id, signature] = parts;
		if (token_session_id !== session_id) {
			return false;
		}

		const token_time = parseInt(timestamp, 10);
		const now = Date.now();
		const age = now - token_time;
		
		if (age > TOKEN_VALIDITY_MS) {
			return false;
		}
		
		if (age < 0) {
			return false;
		}

		const message = `${timestamp}.${token_session_id}`;
		const hmac = crypto.createHmac('sha256', _csrf_secret);
		hmac.update(message);
		const expected_signature = hmac.digest('hex');

		// Use constant-time comparison to prevent timing attacks
		if (!constantTimeCompare(signature, expected_signature)) {
			return false;
		}

		return true;

	} catch (error) {
		console.log('Error validating CSRF token:', error);
		return false;
	}
}

/**
 * Higher-order function to wrap API route handlers with CSRF protection
 * @param {Function} handler - The route handler function to wrap
 * @returns {Function} Wrapped handler with CSRF validation
 * 
 * @example
 * export const POST = withCsrf(async (request) => {
 *   // Your handler logic here
 *   return NextResponse.json({ success: true });
 * });
 * 
 * @example
 * // Compose with withAuth
 * export const POST = withAuth(withCsrf(async (request, context, session) => {
 *   // Both auth and CSRF validated
 *   return NextResponse.json({ success: true });
 * }));
 */
export function withCsrf(handler) {
	return async (request, context, ...rest) => {
		try {
			// Extract CSRF token from header and session ID from cookie
			const csrf_token = request.headers.get('X-CSRF-Token');
			const session_id = request.cookies.get('csrf_session')?.value;

			// Check if both token and session exist
			if (!csrf_token || !session_id) {
				return NextResponse.json(
					{
						success: false,
						message: 'Token de segurança inválido ou ausente'
					},
					{ status: 403 }
				);
			}

			// Validate the CSRF token
			if (!validateCsrfToken(csrf_token, session_id)) {
				return NextResponse.json(
					{
						success: false,
						message: 'Token de segurança inválido ou expirado'
					},
					{ status: 403 }
				);
			}

			// If validation passes, execute the original handler
			// Pass all parameters including any additional ones (like session from withAuth)
			return await handler(request, context, ...rest);

		} catch (error) {
			console.error('CSRF validation error:', error);
			return NextResponse.json(
				{
					success: false,
					message: 'Erro ao validar token de segurança'
				},
				{ status: 500 }
			);
		}
	};
}