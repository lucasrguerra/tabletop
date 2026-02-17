/**
 * Simple in-memory rate limiter for API routes
 * 
 * WARNING: This in-memory implementation has limitations:
 * - Data is lost on server restart
 * - Does not work in multi-server/cluster environments
 * - Memory usage grows with number of unique clients
 * 
 * For production environments, consider:
 * - Redis-based rate limiting (recommended)
 * - Database-backed rate limiting
 * - Third-party services (Cloudflare, AWS WAF, etc.)
 * 
 * Example Redis implementation:
 * ```
 * import Redis from 'ioredis';
 * const redis = new Redis(process.env.REDIS_URL);
 * 
 * async function rateLimitWithRedis(key, maxRequests, windowMs) {
 *   const count = await redis.incr(key);
 *   if (count === 1) {
 *     await redis.pexpire(key, windowMs);
 *   }
 *   return count <= maxRequests;
 * }
 * ```
 */

import { NextResponse } from 'next/server';

const rate_limit_map = new Map();

/**
 * Rate limit configuration
 * @typedef {Object} RateLimitConfig
 * @property {number} maxRequests - Maximum number of requests allowed
 * @property {number} windowMs - Time window in milliseconds
 */

/**
 * Clean up old entries from the rate limit map
 */
function cleanupOldEntries() {
	const now = Date.now();
	for (const [key, data] of rate_limit_map.entries()) {
		if (now > data.reset_time) {
			rate_limit_map.delete(key);
		}
	}
}

// Run cleanup every 1 minute
setInterval(cleanupOldEntries, 1 * 60 * 1000);

/**
 * Get client identifier from request
 * Uses IP address or forwarded IP from proxy/load balancer
 * Includes multiple fallback headers for better compatibility
 * @param {Request} request - Next.js request object
 * @returns {string} Client identifier
 */
function getClientIdentifier(request) {
	// Try to get IP from various headers (for production with proxies/load balancers)
	const forwarded_for = request.headers.get('x-forwarded-for');
	const real_ip = request.headers.get('x-real-ip');
	const cf_connecting_ip = request.headers.get('cf-connecting-ip'); // Cloudflare
	const true_client_ip = request.headers.get('true-client-ip'); // Akamai, Cloudflare
	
	if (forwarded_for) {
		// x-forwarded-for can contain multiple IPs, get the first one (original client)
		const ips = forwarded_for.split(',').map(ip => ip.trim());
		// Return first IP that's not a private/local IP
		const public_ip = ips.find(ip => !isPrivateIP(ip));
		return public_ip || ips[0];
	}
	
	if (true_client_ip) {
		return true_client_ip;
	}
	
	if (cf_connecting_ip) {
		return cf_connecting_ip;
	}
	
	if (real_ip) {
		return real_ip;
	}
	
	// Fallback to a generic identifier
	return 'unknown-client';
}

/**
 * Check if an IP address is private/local
 * @param {string} ip - IP address to check
 * @returns {boolean} True if private, false otherwise
 */
function isPrivateIP(ip) {
	// Simple check for common private IP ranges
	return (
		ip.startsWith('10.') ||
		ip.startsWith('192.168.') ||
		ip.startsWith('172.16.') ||
		ip.startsWith('172.17.') ||
		ip.startsWith('172.18.') ||
		ip.startsWith('172.19.') ||
		ip.startsWith('172.20.') ||
		ip.startsWith('172.21.') ||
		ip.startsWith('172.22.') ||
		ip.startsWith('172.23.') ||
		ip.startsWith('172.24.') ||
		ip.startsWith('172.25.') ||
		ip.startsWith('172.26.') ||
		ip.startsWith('172.27.') ||
		ip.startsWith('172.28.') ||
		ip.startsWith('172.29.') ||
		ip.startsWith('172.30.') ||
		ip.startsWith('172.31.') ||
		ip.startsWith('127.') ||
		ip === 'localhost' ||
		ip === '::1'
	);
}

/**
 * Rate limit middleware for API routes that returns NextResponse
 * @param {Request} request - Next.js request object
 * @param {RateLimitConfig} config - Rate limit configuration
 * @param {string} identifier - Optional custom identifier (defaults to IP-based)
 * @returns {Promise<NextResponse|null>} NextResponse with error if limit exceeded, null if OK
 */
export default async function rateLimit(
	request,
	config = { max_requests: 10, window_ms: 15 * 1000 }, // Default: 10 requests per 15 seconds
	identifier = null
) {
	try {
		// Get client identifier
		const client_id = identifier || getClientIdentifier(request);
		const key = `${client_id}:${request.url}`;
		
		const now = Date.now();
		const limit_data = rate_limit_map.get(key);
		
		// If no previous data or window has expired, create new entry
		if (!limit_data || now > limit_data.resetTime) {
			rate_limit_map.set(key, {
				count: 1,
				reset_time: now + config.window_ms,
			});
			
			return null; // Request allowed
		}
		
		// Increment request count
		limit_data.count += 1;
		
		// Check if limit exceeded
		if (limit_data.count > config.max_requests) {
			const reset_in = Math.ceil((limit_data.reset_time - now) / 1000);
			return NextResponse.json(
				{ 
					success: false, 
					message: `Muitas tentativas. Tente novamente em ${reset_in} segundos.`
				},
				{ 
					status: 429,
					headers: {
						'Retry-After': String(reset_in)
					}
				}
			);
		}
		
		// Update the map
		rate_limit_map.set(key, limit_data);
		
		return null; // Request allowed
		
	} catch (error) {
		console.error('Rate limit error:', error);
		return null;
	}
}

/**
 * Create a rate limiter with specific configuration
 * @param {RateLimitConfig} config - Rate limit configuration
 * @returns {Function} Rate limiter function
 */
export function createRateLimiter(config) {
	return (request, identifier = null) => rateLimit(request, config, identifier);
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
	// Strict: 5 requests per 30 seconds (for sensitive operations like registration, password reset)
	strict: (request, identifier = null) => 
		rateLimit(request, { max_requests: 5, window_ms: 30 * 1000 }, identifier),
	
	// Authentication: 10 requests per 60 seconds
	auth: (request, identifier = null) => 
		rateLimit(request, { max_requests: 10, window_ms: 60 * 1000 }, identifier),
	
	// Standard: 30 requests per 15 seconds
	standard: (request, identifier = null) => 
		rateLimit(request, { max_requests: 30, window_ms: 15 * 1000 }, identifier),
	
	// Lenient: 100 requests per 15 seconds
	lenient: (request, identifier = null) => 
		rateLimit(request, { max_requests: 100, window_ms: 15 * 1000 }, identifier),
};
