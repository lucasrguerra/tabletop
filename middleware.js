import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware to add security headers and protect routes
 * Protects against XSS, clickjacking, MIME sniffing, and other common attacks
 * Also handles authentication for protected routes
 */
export async function middleware(request) {
	const response = NextResponse.next();

	// Security Headers
	
	// Prevent XSS attacks
	response.headers.set('X-XSS-Protection', '1; mode=block');
	
	// Prevent MIME type sniffing
	response.headers.set('X-Content-Type-Options', 'nosniff');
	
	// Prevent clickjacking
	response.headers.set('X-Frame-Options', 'DENY');
	
	// Referrer Policy - don't leak referrer information
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	
	// Content Security Policy - Strict CSP to prevent XSS
	// Adjust this based on your app's needs
	const cspHeader = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval for dev
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data:",
		"connect-src 'self'",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'",
	].join('; ');
	response.headers.set('Content-Security-Policy', cspHeader);
	
	// Permissions Policy - Restrict browser features
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	);
	
	// Strict-Transport-Security - Force HTTPS (only in production)
	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains'
		);
	}

	// Authentication check for protected routes
	const { pathname } = request.nextUrl;
	const protected_routes = ['/dashboard'];
	
	// Check if current route is protected
	const is_protected_route = protected_routes.some(route => 
		pathname.startsWith(route)
	);

	if (is_protected_route) {
		// Get JWT token from NextAuth
		const token = await getToken({ 
			req: request, 
			secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET 
		});

		// Redirect to login if no valid token
		if (!token) {
			const login_url = new URL('/login', request.url);
			login_url.searchParams.set('callbackUrl', pathname);
			return NextResponse.redirect(login_url);
		}
	}

	return response;
}

// Apply middleware to all routes
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
