import User from '@/database/schemas/User';
import Training from '@/database/schemas/Training';
import Response from '@/database/schemas/Response';
import Evaluation from '@/database/schemas/Evaluation';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

/**
 * Delete a user and cascade related data (admin-only operation)
 * Removes user from training participant arrays, deletes their responses/evaluations,
 * but does NOT delete trainings they created or facilitated.
 * @param {string} userId - User ID to delete
 * @returns {Promise<Object>} Result object
 */
export default async function deleteUser(userId) {
    await connectDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: 'ID de usuário inválido' };
    }

    const user = await User.findById(userId);
    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    // 1. Remove user from all training participant arrays
    await Training.updateMany(
        { 'participants.user_id': userId },
        { $pull: { participants: { user_id: userId } } }
    );

    // 2. Delete user's responses
    await Response.deleteMany({ user_id: userId });

    // 3. Delete user's evaluations
    await Evaluation.deleteMany({ user_id: userId });

    // 4. Delete the user
    await User.findByIdAndDelete(userId);

    return { success: true, message: 'Usuário deletado com sucesso' };
}
