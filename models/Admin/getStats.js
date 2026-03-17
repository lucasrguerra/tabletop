import User from '@/database/schemas/User';
import Training from '@/database/schemas/Training';
import Evaluation from '@/database/schemas/Evaluation';
import connectDatabase from '@/database/database';

/**
 * Build a 12-month time series, filling months with no data as 0.
 * @param {Array} raw - Aggregation result with { _id: { year, month }, count }
 * @param {Date} now - Reference date
 * @returns {Array} Array of { month: string, count: number } with 12 items
 */
function buildMonthSeries(raw, now) {
    const map = {};
    raw.forEach(r => {
        map[`${r._id.year}-${r._id.month}`] = r.count;
    });

    const result = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        result.push({ month: label, count: map[key] ?? 0 });
    }
    return result;
}

/**
 * Get aggregated admin statistics for the overview dashboard.
 * Runs all queries in parallel via Promise.all for performance.
 * @returns {Promise<Object>} Stats bundle
 */
export default async function getStats() {
    await connectDatabase();

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
        totalUsers,
        totalTrainings,
        completedTrainings,
        usersOverTimeRaw,
        trainingsOverTimeRaw,
        trainingsByStatus,
        topScenarios,
        trainingsByCategory,
        evalRatingsRaw,
        topFacilitators,
    ] = await Promise.all([
        // 1a. Total users
        User.countDocuments({}),

        // 1b. Total trainings
        Training.countDocuments({}),

        // 1c. Completed trainings (for completion rate)
        Training.countDocuments({ status: 'completed' }),

        // 2. Users registered over time (last 12 months) — uses ObjectId timestamp
        User.aggregate([
            {
                $match: {
                    $expr: { $gte: [{ $toDate: '$_id' }, twelveMonthsAgo] },
                },
            },
            {
                $group: {
                    _id: {
                        year:  { $year:  { $toDate: '$_id' } },
                        month: { $month: { $toDate: '$_id' } },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),

        // 3. Trainings created over time (last 12 months)
        Training.aggregate([
            { $match: { created_at: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year:  { $year:  '$created_at' },
                        month: { $month: '$created_at' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),

        // 4. Trainings grouped by status
        Training.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, status: '$_id', count: 1 } },
            { $sort: { count: -1 } },
        ]),

        // 5. Top 10 most used scenarios
        Training.aggregate([
            {
                $group: {
                    _id: '$scenario.id',
                    title: { $first: '$scenario.title' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, scenario_id: '$_id', title: 1, count: 1 } },
        ]),

        // 6. Trainings grouped by scenario category
        Training.aggregate([
            { $group: { _id: '$scenario.category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, category: '$_id', count: 1 } },
        ]),

        // 7. Evaluation averages
        Evaluation.aggregate([
            {
                $group: {
                    _id: null,
                    avg_overall:    { $avg: '$overall_rating' },
                    avg_scenario:   { $avg: '$scenario_rating' },
                    avg_difficulty: { $avg: '$difficulty_rating' },
                    recommend_true: { $sum: { $cond: ['$would_recommend', 1, 0] } },
                    total:          { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    avg_overall:    { $round: ['$avg_overall', 2] },
                    avg_scenario:   { $round: ['$avg_scenario', 2] },
                    avg_difficulty: { $round: ['$avg_difficulty', 2] },
                    would_recommend_pct: {
                        $round: [
                            { $multiply: [{ $divide: ['$recommend_true', '$total'] }, 100] },
                            1,
                        ],
                    },
                    total_evaluations: '$total',
                },
            },
        ]),

        // 8. Top 5 facilitators by trainings created
        Training.aggregate([
            { $group: { _id: '$created_by', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    _id: 0,
                    user_id:  { $toString: '$user._id' },
                    name:     '$user.name',
                    nickname: '$user.nickname',
                    count:    1,
                },
            },
        ]),
    ]);

    const completion_rate = totalTrainings > 0
        ? Math.round((completedTrainings / totalTrainings) * 1000) / 10
        : 0;

    const evalData = evalRatingsRaw[0] ?? null;

    return {
        success: true,
        summary: {
            total_users: totalUsers,
            total_trainings: totalTrainings,
            completion_rate,
            avg_overall_rating: evalData?.avg_overall ?? null,
        },
        users_over_time:       buildMonthSeries(usersOverTimeRaw, now),
        trainings_over_time:   buildMonthSeries(trainingsOverTimeRaw, now),
        trainings_by_status:   trainingsByStatus,
        top_scenarios:         topScenarios,
        trainings_by_category: trainingsByCategory,
        evaluation_ratings: evalData
            ? { ...evalData }
            : {
                avg_overall: null,
                avg_scenario: null,
                avg_difficulty: null,
                would_recommend_pct: null,
                total_evaluations: 0,
            },
        top_facilitators: topFacilitators,
    };
}
