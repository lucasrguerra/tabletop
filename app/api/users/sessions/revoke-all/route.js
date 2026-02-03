import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import connectDB from '@/database/database';
import { revokeAllUserTokens } from '@/models/Token/revoke';

/**
 * Example: Protected route with both Auth and CSRF validation
 * POST /api/users/sessions/revoke-all
 * Revokes all user sessions except the current one
 */

async function revokeAllSessionsHandler(request, context, session) {
	try {
		await connectDB();

		const user_id = session.user.id;
		const current_token = session.customToken;

		// Revoke all tokens except current
		const result = await revokeAllUserTokens(user_id, current_token);

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: result.message,
				revoked_count: result.count
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: result.message
				},
				{ status: 400 }
			);
		}

	} catch (error) {
		console.error('Revoke all sessions error:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao revogar sessões'
			},
			{ status: 500 }
		);
	}
}

// Export with both Auth and CSRF protection
export const POST = withAuth(withCsrf(revokeAllSessionsHandler));