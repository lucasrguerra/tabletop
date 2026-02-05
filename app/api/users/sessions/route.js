import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import connectDB from '@/database/database';
import getUserTokens from '@/models/Token/getUserTokens';
import { decodeToken } from '@/utils/jwt';

/**
 * GET /api/users/sessions
 * Gets all active sessions for the authenticated user
 * Requires authentication
 */

async function getSessionsHandler(request, context, session) {
	try {
		await connectDB();

		const user_id = session.user.id;

		// Get current token_id from session's custom token
		let current_token_id = null;
		if (session.customToken) {
			const decoded = decodeToken(session.customToken);
			if (decoded?.token_id) {
				current_token_id = decoded.token_id;
			}
		}

		// Get all active tokens/sessions for the user
		const result = await getUserTokens(user_id);

		if (result.success) {
			return NextResponse.json({
				success: true,
				sessions: result.tokens.map(token => ({
					id: token._id.toString(),
					created_at: token.created_at,
					expires_at: token.expires_at,
					user_agent: token.user_agent,
					ip_address: token.ip_address,
					is_current: token.token_id === current_token_id
				}))
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: result.message,
					sessions: []
				},
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error('Get sessions error:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar sessões',
				sessions: []
			},
			{ status: 500 }
		);
	}
}

// Export with Auth protection (no CSRF needed for GET)
export const GET = withAuth(getSessionsHandler);
