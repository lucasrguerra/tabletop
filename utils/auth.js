import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';
import connectDB from '@/database/database';
import Login from '@/models/User/login';
import User from '@/database/schemas/User';

/**
 * NextAuth configuration - must be exported to use with getServerSession
 */
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? (process.env.NODE_ENV === 'production');

export const authOptions = {
	trustHost: true,
	cookies: {
		sessionToken: {
			name: useSecureCookies ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: useSecureCookies,
			},
		},
	},
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
							facilitator: result.user.facilitator,
							admin: result.user.admin,
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
				token.facilitator = user.facilitator;
				token.admin = user.admin;
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
				session.user.facilitator = token.facilitator;
				session.user.admin = token.admin;
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

	debug: process.env.NODE_ENV === 'development',
};

/**
 * Loads the current privilege flags for a user straight from the database.
 *
 * The session JWT is issued at login and lives for 30 days, so `admin` and
 * `facilitator` inside it are a snapshot taken at sign-in time. Trusting that
 * snapshot means a revoked privilege stays usable until the session expires.
 * Every authorization decision must therefore read the flags from the database.
 *
 * @param {string} user_id - User ID taken from the session
 * @returns {Promise<{ admin: boolean, facilitator: boolean }|null>} Null when the user no longer exists
 */
export async function getCurrentUserPrivileges(user_id) {
	if (!mongoose.Types.ObjectId.isValid(user_id)) {
		return null;
	}

	await connectDB();

	const user = await User.findById(user_id).select('admin facilitator').lean();
	if (!user) {
		return null;
	}

	return {
		admin: user.admin === true,
		facilitator: user.facilitator === true,
	};
}

/**
 * Higher-order function to wrap API route handlers with authentication check
 * Ensures user has an active session before executing the handler
 *
 * Privilege flags on the session are refreshed from the database on every
 * request, so handlers reading `session.user.admin` / `session.user.facilitator`
 * always see the current value rather than the one stored at login.
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

			// Re-read privileges from the database — the session JWT may carry
			// flags that were revoked after it was issued.
			const privileges = await getCurrentUserPrivileges(session.user.id);

			if (!privileges) {
				return NextResponse.json(
					{
						success: false,
						message: 'Sessão inválida'
					},
					{ status: 401 }
				);
			}

			session.user.admin = privileges.admin;
			session.user.facilitator = privileges.facilitator;

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

/**
 * Higher-order function to wrap API route handlers with admin authentication check
 * Ensures user has an active session AND is an admin before executing the handler
 *
 * @param {Function} handler - The route handler function to wrap
 * @returns {Function} Wrapped handler with admin authentication validation
 */
export function withAdmin(handler) {
	return async (request, context) => {
		try {
			const session = await getServerSession(authOptions);

			if (!session) {
				return NextResponse.json(
					{
						success: false,
						message: 'Não autorizado. Faça login para continuar.'
					},
					{ status: 401 }
				);
			}

			if (!session.user?.id) {
				return NextResponse.json(
					{
						success: false,
						message: 'Sessão inválida'
					},
					{ status: 401 }
				);
			}

			// Authority is the database, never the session JWT: an admin flag
			// revoked after sign-in must take effect on the very next request.
			const privileges = await getCurrentUserPrivileges(session.user.id);

			if (!privileges) {
				return NextResponse.json(
					{
						success: false,
						message: 'Sessão inválida'
					},
					{ status: 401 }
				);
			}

			if (privileges.admin !== true) {
				return NextResponse.json(
					{
						success: false,
						message: 'Acesso restrito a administradores.'
					},
					{ status: 403 }
				);
			}

			session.user.admin = privileges.admin;
			session.user.facilitator = privileges.facilitator;

			return await handler(request, context, session);

		} catch (error) {
			console.error('Admin authentication error:', error);
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
