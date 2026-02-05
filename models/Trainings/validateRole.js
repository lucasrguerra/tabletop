/**
 * Validate if the provided role is valid.
 *
 * @param {string} role - Role to validate
 * @returns {boolean} True if the role is valid, false otherwise
 */
export default function validateRole(role) {
    const valid_roles = ['facilitator', 'participant', 'observer'];
    return valid_roles.includes(role);
}