import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/database/database';
import Login from '@/models/User/login';

/**
 * NextAuth configuration - must be exported to use with getServerSession
 */
export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				identifier: { label: "Email ou Nickname", type: "text" },
				password: { label: "Senha", type: "password" }
			},
			async authorize(credentials, req) {
				try {
					await connectDB();

					// Extract metadata from request
					const user_agent = req.headers?.['user-agent'] || null;
					const forwarded_for = req.headers?.['x-forwarded-for'];
					const ip_address = forwarded_for ? forwarded_for.split(',')[0] : null;

					// Use existing login model
					const result = await Login(
						credentials.identifier,
						credentials.password,
						{
							userAgent: user_agent,
							ipAddress: ip_address
						}
					);

					if (result.success) {
						// Return user object with token
						return {
							id: result.user.id,
							name: result.user.name,
							email: result.user.email,
							nickname: result.user.nickname,
							token: result.token
						};
					}

					// Return null if login fails
					return null;

				} catch (error) {
					console.error('NextAuth authorize error:', error);
					return null;
				}
			}
		})
	],
	
	callbacks: {
		/**
		 * JWT callback - called when creating or updating JWT token
		 */
		async jwt({ token, user }) {
			// On initial sign in, add user data and custom token to JWT
			if (user) {
				token.id = user.id;
				token.name = user.name;
				token.email = user.email;
				token.nickname = user.nickname;
				token.customToken = user.token; // Store our custom JWT token
			}
			return token;
		},

		/**
		 * Session callback - called when client accesses session
		 */
		async session({ session, token }) {
			// Add user data to session
			if (token) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.nickname = token.nickname;
				session.customToken = token.customToken; // Include custom token in session
			}
			return session;
		}
	},

	pages: {
		signIn: '/login',
		signOut: '/login',
		error: '/login',
	},

	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},

	// Use same secret as JWT_SECRET for consistency
	secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,

	debug: process.env.NODE_ENV === 'development',
};

/**
 * Higher-order function to wrap API route handlers with authentication check
 * Ensures user has an active session before executing the handler
 * 
 * @param {Function} handler - The route handler function to wrap
 * @returns {Function} Wrapped handler with authentication validation
 * 
 * @example
 * // Simple usage
 * export const POST = withAuth(async (request) => {
 *   // Your handler logic here - user is authenticated
 *   return NextResponse.json({ success: true });
 * });
 * 
 * @example
 * // Access session data
 * export const POST = withAuth(async (request, context, session) => {
 *   const user_id = session.user.id;
 *   return NextResponse.json({ user_id });
 * });
 * 
 * @example
 * // Compose with withCsrf
 * export const POST = withAuth(withCsrf(async (request) => {
 *   // Both authentication and CSRF validated
 *   return NextResponse.json({ success: true });
 * }));
 */
export function withAuth(handler) {
	return async (request, context) => {
		try {
			// Get session from NextAuth
			const session = await getServerSession(authOptions);

			// Check if session exists
			if (!session) {
				return NextResponse.json(
					{
						success: false,
						message: 'Não autorizado. Faça login para continuar.'
					},
					{ status: 401 }
				);
			}

			// Check if session has required user data
			if (!session.user?.id) {
				return NextResponse.json(
					{
						success: false,
						message: 'Sessão inválida'
					},
					{ status: 401 }
				);
			}

			// If validation passes, execute the original handler
			// Pass session as third parameter for convenience
			return await handler(request, context, session);

		} catch (error) {
			console.error('Authentication validation error:', error);
			return NextResponse.json(
				{
					success: false,
					message: 'Erro ao validar autenticação'
				},
				{ status: 500 }
			);
		}
	};
}