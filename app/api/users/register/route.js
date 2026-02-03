import { NextResponse } from 'next/server';
import connectDB from '@/database/database';
import register from '@/models/User/register';
import { rateLimiters } from '@/utils/rateLimit';
import { sanitizeName, sanitizeEmail, sanitizeNickname } from '@/utils/sanitize';
import { withCsrf } from '@/utils/csrf';

async function registerHandler(request) {
	try {
		const rate_limit_response = await rateLimiters.strict(request);
		if (rate_limit_response) return rate_limit_response;

		const body = await request.json();
		const { name, email, nickname, password } = body;

		try {
			if (!name || !email || !nickname || !password) {
				return NextResponse.json(
					{
						success: false,
						message: 'Todos os campos são obrigatórios'
					},
					{ status: 400 }
				);
			}
			
			const sanitized_name = sanitizeName(name);
			const sanitized_email = sanitizeEmail(email);
			const sanitized_nickname = sanitizeNickname(nickname);
			
			await connectDB();
			const result = await register(sanitized_name, sanitized_email, sanitized_nickname, password);
			
			if (result.success) {
				return NextResponse.json(
					{ 
						success: true, 
						message: result.message,
						user: result.user 
					},
					{ status: 201 }
				);
			} else {
				return NextResponse.json(
					{ 
						success: false, 
						message: result.message 
					},
					{ status: 400 }
				);
			}
		} catch (sanitize_error) {
			if (sanitize_error.message.includes('must be') || sanitize_error.message.includes('Invalid')) {
				return NextResponse.json(
					{
						success: false,
						message: sanitize_error.message
					},
					{ status: 400 }
				);
			}
			throw sanitize_error;
		}

	} catch (error) {
		console.error('Registration API error:', error);
		return NextResponse.json(
			{ 
				success: false, 
				message: 'Erro interno do servidor. Tente novamente.' 
			},
			{ status: 500 }
		);
	}
}

export const POST = withCsrf(registerHandler);
