import User from '@/database/schemas/User';
import connectDatabase from '@/database/database';

/**
 * Get all users with pagination and optional search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Items per page (default 20, max 50)
 * @param {string} options.search - Search term for name, email, or nickname
 * @returns {Promise<Object>} Result with users array and pagination metadata
 */
export default async function getUsers(options = {}) {
    await connectDatabase();

    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;
    const search = options.search?.trim() || '';

    const query = search
        ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { nickname: { $regex: search, $options: 'i' } },
            ],
        }
        : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password_hash')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total_pages = Math.ceil(total / limit);

    return {
        success: true,
        users: users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            nickname: u.nickname,
            facilitator: u.facilitator ?? false,
            admin: u.admin ?? false,
        })),
        pagination: {
            current_page: page,
            total_pages,
            total_items: total,
            items_per_page: limit,
            has_next: page < total_pages,
            has_prev: page > 1,
        },
    };
}
