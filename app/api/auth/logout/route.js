import { NextResponse } from 'next/server';
import { revokeToken } from '@/models/Token/revoke';
import connectDB from '@/database/database';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';

/**
 * POST endpoint to logout user and revoke token
 * Protected by withAuth - requires active session
 */
async function logoutHandler(request, context, session) {
	try {
		await connectDB();

		// Session is guaranteed to exist by withAuth
		if (!session?.customToken) {
			return NextResponse.json(
				{
					success: false,
					message: 'Token de sessão não encontrado'
				},
				{ status: 400 }
			);
		}

		// Revoke the custom token in database
		const result = await revokeToken(session.customToken);

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: 'Logout realizado com sucesso'
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
		console.error('Logout error:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao fazer logout'
			},
			{ status: 500 }
		);
	}
}

export const POST = withAuth(withCsrf(logoutHandler));
