import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * Get all trainings with pagination (admin-only operation)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Items per page (default 20, max 50)
 * @param {string} options.status - Filter by status ('all' to skip filter)
 * @param {string} options.search - Search term for training name
 * @returns {Promise<Object>} Result with trainings array and pagination metadata
 */
export default async function getAllTrainings(options = {}) {
    await connectDatabase();

    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;
    const status = options.status && options.status !== 'all' ? options.status : null;
    const search = options.search?.trim() || '';

    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Training.countDocuments(query);
    const trainings = await Training.find(query)
        .populate('created_by', 'name email nickname')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total_pages = Math.ceil(total / limit);

    return {
        success: true,
        trainings: trainings.map(t => ({
            id: t._id.toString(),
            name: t.name,
            description: t.description,
            status: t.status,
            scenario: t.scenario,
            access_type: t.access_type,
            participants_count: t.participants?.length || 0,
            created_by: {
                id: t.created_by?._id?.toString(),
                name: t.created_by?.name,
                nickname: t.created_by?.nickname,
            },
            created_at: t.created_at,
            started_at: t.started_at,
            completed_at: t.completed_at,
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
