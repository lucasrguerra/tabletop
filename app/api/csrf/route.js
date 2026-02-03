import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/utils/csrf';
import crypto from 'crypto';

/**
 * GET endpoint to generate a CSRF token
 * Creates or uses existing session ID from cookie
 */
export async function GET(request) {
	try {
		const cookies = request.cookies;
		let session_id = cookies.get('csrf_session')?.value;

		// Generate new session ID if none exists
		if (!session_id) {
			session_id = crypto.randomBytes(32).toString('hex');
		}

		// Generate CSRF token
		const csrf_token = generateCsrfToken(session_id);

		// Create response with token
		const response = NextResponse.json({
			success: true,
			csrf_token
		});

		// Set session cookie (httpOnly for security)
		response.cookies.set('csrf_session', session_id, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60, // 1 hour
			path: '/'
		});

		return response;

	} catch (error) {
		console.error('CSRF token generation error:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao gerar token de segurança'
			},
			{ status: 500 }
		);
	}
}
