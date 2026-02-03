import crypto from 'crypto';

/**
 * Utility functions to prevent timing attacks
 */

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings are equal
 */
export function constantTimeCompare(a, b) {
	if (typeof a !== 'string' || typeof b !== 'string') {
		return false;
	}

	const buf_a = Buffer.from(a);
	const buf_b = Buffer.from(b);

	// If lengths differ, still compare to prevent timing attacks
	if (buf_a.length !== buf_b.length) {
		// Use timingSafeEqual on equal-length dummy buffers to maintain constant time
		crypto.timingSafeEqual(buf_a, buf_a);
		return false;
	}

	// Use Node.js built-in timing-safe comparison
	return crypto.timingSafeEqual(buf_a, buf_b);
}

/**
 * Add random delay to prevent timing attacks on failed authentication
 * Adds a small random delay (0-100ms) to make timing analysis harder
 * @returns {Promise<void>}
 */
export async function randomDelay() {
	const delay_ms = Math.floor(Math.random() * 100);
	return new Promise(resolve => setTimeout(resolve, delay_ms));
}

/**
 * Constant-time boolean check
 * @param {boolean} condition
 * @returns {boolean}
 */
export function constantTimeBoolean(condition) {
	// Convert to number and compare
	const value = condition ? 1 : 0;
	const expected = 1;
	
	// This ensures the comparison takes the same time regardless of result
	let result = 0;
	for (let i = 0; i < 100; i++) {
		result |= value ^ expected;
	}
	
	return result === 0;
}
