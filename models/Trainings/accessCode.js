import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';
import crypto from 'crypto';

/**
 * Generate an Access Code unique for training sessions.
 * @returns {Promise<string>} Generated access code
 */
export async function generate() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    const code_length = 8;

    let access_code = '';
    let is_valid = false;
    while (!is_valid) {
        access_code = '';
        for (let i = 0; i < code_length; i++) {
            const random_index = crypto.randomInt(characters.length);
            access_code += characters[random_index];
        }

        if (await validate(access_code)) {
            is_valid = true;
        }
    }

    return access_code;
}

/**
 * Validate if the provided access code is valid.
 *
 * @param {string} code - Access code to validate
 * @returns {Promise<boolean>} True if the access code is valid, false otherwise
 */
export async function validate(code) {
    await connectDatabase();

    if (typeof code !== 'string') {
        return false;
    }

    if (code.length < 4 || code.length > 20) {
        return false;
    }

    const code_pattern = /^[A-Za-z0-9_-]+$/;
    const pattern_match = code_pattern.test(code);
    if (!pattern_match) {
        return false;
    }

    const blocked_words = [
        'admin',
        'administrator',
        'administrador',
        'root',
        'moderator',
        'moderador',
        'staff',
        'test',
        'teste',
        'tester',
        'porra',
        'shit',
        'merda',
        'bosta',
        'caralho',
        'fuck',
        'foda',
        'bitch',
        'puta',
        'ass',
        'cu',
        'buceta'
    ];
    const contains_blocked_word = blocked_words.some(word => code.toLowerCase().includes(word));
    if (contains_blocked_word) {
        return false;
    }

    const in_use = await Training.findOne({ access_code: code, completed_at: null });
    if (in_use) {
        return false;
    }

    return true;
}

/**
 * Validate only the format of an access code (no uniqueness check).
 * Use this when verifying a code provided by a user trying to join.
 *
 * @param {string} code - Access code to validate
 * @returns {boolean} True if the format is valid
 */
export function validateFormat(code) {
    if (typeof code !== 'string') {
        return false;
    }

    if (code.length < 4 || code.length > 20) {
        return false;
    }

    const code_pattern = /^[A-Za-z0-9_-]+$/;
    if (!code_pattern.test(code)) {
        return false;
    }

    return true;
}

export default {
    generate,
    validate,
    validateFormat
}