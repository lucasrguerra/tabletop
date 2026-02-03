import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import connectDB from '@/database/database';
import { revokeTokenById } from '@/models/Token/revoke';

/**
 * POST /api/users/sessions/revoke
 * Revokes a specific user session by token ID
 * Requires authentication and CSRF protection
 */

async function revokeSessionHandler(request, context, session) {
	try {
		await connectDB();

		const body = await request.json();
		const { token_id } = body;

		// Validate token_id
		if (!token_id) {
			return NextResponse.json(
				{
					success: false,
					message: 'ID da sessão é obrigatório'
				},
				{ status: 400 }
			);
		}

		const user_id = session.user.id;

		// Revoke the specific token
		// The function validates that the token belongs to the user
		const result = await revokeTokenById(token_id, user_id);

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: result.message
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: result.message
				},
				{ status: 404 }
			);
		}

	} catch (error) {
		console.error('Revoke session error:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao revogar sessão'
			},
			{ status: 500 }
		);
	}
}

// Export with both Auth and CSRF protection
export const POST = withAuth(withCsrf(revokeSessionHandler));
