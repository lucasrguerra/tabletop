import User from '@/database/schemas/User';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Update a user's facilitator status (admin-only operation)
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update (only `facilitator` is allowed)
 * @returns {Promise<Object>} Result with updated user
 */
export default async function updateUser(userId, updates) {
    await connectDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: 'ID de usuário inválido' };
    }

    // Only allow toggling facilitator via this route — admin flag stays script-only
    const allowed = {};
    if (typeof updates.facilitator === 'boolean') {
        allowed.facilitator = updates.facilitator;
    }

    if (Object.keys(allowed).length === 0) {
        return { success: false, message: 'Nenhum campo válido para atualizar' };
    }

    const user = await User.findByIdAndUpdate(userId, allowed, { new: true }).select('-password_hash');

    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    return {
        success: true,
        message: 'Usuário atualizado com sucesso',
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            nickname: user.nickname,
            facilitator: user.facilitator,
            admin: user.admin,
        },
    };
}
