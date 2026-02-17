import bcrypt from 'bcryptjs';

/**
 * Hash a password
 * @param {String} password
 * @returns {String} hash
 */
export async function hash(password = String) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

/**
 * Compare a password with a hash
 * @param {String} password
 * @param {String} hash
 * @returns {Boolean}
 */
export async function compare(password = String, hash = String) {
    const is_match = await bcrypt.compare(password, hash);
    return is_match;
}

/**
 * Check if a password meets complexity requirements
 * @param {String} password
 * @returns {Boolean}
 */
export function isComplex(password = String) {
    const has_min_length = password.length >= 8;
    const has_max_length = password.length <= 128;
    const has_upper_case = /[A-Z]/.test(password);
    const has_lower_case = /[a-z]/.test(password);
    const has_number = /\d/.test(password);
    const has_special_char = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const is_valid = has_min_length && has_max_length && has_upper_case && has_lower_case && has_number && has_special_char;
    return is_valid;
}