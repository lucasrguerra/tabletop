import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withAuth } from '@/utils/auth';
import { withTrainingRole } from '@/utils/trainingAuth';
import Response from '@/database/schemas/Response';
import Training from '@/database/schemas/Training';
import connectDatabase from '@/database/database';

/**
 * GET /api/trainings/[id]/results
 * Returns personal results for participants with anonymous aggregate comparisons.
 * - Participants: see their own stats + anonymized general averages + ranking position
 * - Facilitators: see full aggregate stats
 *
 * Privacy: never exposes individual data from other participants — only anonymized averages.
 */
export const GET = withAuth(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		await connectDatabase();

		const trainingId = training.id;
		const userId = session.user.id;

		// Re-fetch training from DB for raw participant user_ids
		const trainingDoc = await Training.findById(trainingId)
			.select('participants started_at completed_at training_timer')
			.lean();

		if (!trainingDoc) {
			return NextResponse.json(
				{ success: false, message: 'Treinamento não encontrado' },
				{ status: 404 }
			);
		}

		const acceptedParticipants = (trainingDoc.participants || []).filter(
			p => p.role === 'participant' && p.status === 'accepted'
		);
		const totalParticipants = acceptedParticipants.length;
		const participantUserIds = acceptedParticipants.map(p => p.user_id);

		// --- User's own responses ---
		const userResponses = await Response.find({
			training_id: new mongoose.Types.ObjectId(trainingId),
			user_id: new mongoose.Types.ObjectId(userId),
		}).sort({ round_id: 1, submitted_at: 1 }).lean();

		// --- Per-user aggregation (for ranking + averages) ---
		const perUserAgg = await Response.aggregate([
			{
				$match: {
					training_id: new mongoose.Types.ObjectId(trainingId),
					user_id: { $in: participantUserIds },
				},
			},
			{
				$group: {
					_id: '$user_id',
					total_points: { $sum: '$points_earned' },
					total_possible: { $sum: '$points_possible' },
					correct_count: { $sum: { $cond: ['$is_correct', 1, 0] } },
					total_responses: { $sum: 1 },
					first_submitted: { $min: '$submitted_at' },
					last_submitted: { $max: '$submitted_at' },
				},
			},
			{ $sort: { total_points: -1, first_submitted: 1 } },
		]);

		// --- Per-round per-user aggregation (for round averages) ---
		const perRoundUserAgg = await Response.aggregate([
			{
				$match: {
					training_id: new mongoose.Types.ObjectId(trainingId),
					user_id: { $in: participantUserIds },
				},
			},
			{
				$group: {
					_id: { round_id: '$round_id', user_id: '$user_id' },
					points_earned: { $sum: '$points_earned' },
					points_possible: { $sum: '$points_possible' },
					correct_count: { $sum: { $cond: ['$is_correct', 1, 0] } },
					total_responses: { $sum: 1 },
					first_submitted: { $min: '$submitted_at' },
					last_submitted: { $max: '$submitted_at' },
				},
			},
		]);

		// ===== Compute user's personal stats =====
		const userPointsEarned = userResponses.reduce((sum, r) => sum + r.points_earned, 0);
		const userPointsPossible = userResponses.reduce((sum, r) => sum + r.points_possible, 0);
		const userCorrectCount = userResponses.filter(r => r.is_correct).length;
		const userAccuracy = userPointsPossible > 0
			? Math.round((userPointsEarned / userPointsPossible) * 10000) / 100
			: 0;

		// Response timing
		const sortedResponses = [...userResponses]
			.filter(r => r.submitted_at)
			.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));

		let userAvgResponseInterval = null;
		if (sortedResponses.length > 1) {
			const intervals = [];
			for (let i = 1; i < sortedResponses.length; i++) {
				intervals.push(
					new Date(sortedResponses[i].submitted_at).getTime() -
					new Date(sortedResponses[i - 1].submitted_at).getTime()
				);
			}
			userAvgResponseInterval = Math.round(
				intervals.reduce((a, b) => a + b, 0) / intervals.length
			);
		}

		const userFirstSubmission = sortedResponses.length > 0
			? sortedResponses[0].submitted_at : null;
		const userLastSubmission = sortedResponses.length > 0
			? sortedResponses[sortedResponses.length - 1].submitted_at : null;
		const userActiveTime = userFirstSubmission && userLastSubmission
			? new Date(userLastSubmission).getTime() - new Date(userFirstSubmission).getTime()
			: 0;

		// ===== Ranking position =====
		let userPosition = null;
		for (let i = 0; i < perUserAgg.length; i++) {
			if (perUserAgg[i]._id.toString() === userId) {
				userPosition = i + 1;
				break;
			}
		}
		// If user answered no questions, they're last
		if (userPosition === null && totalParticipants > 0) {
			userPosition = totalParticipants;
		}

		// ===== Anonymous general averages =====
		const usersWithResponses = perUserAgg.filter(u => u.total_responses > 0);
		const avgPointsPerUser = usersWithResponses.length > 0
			? usersWithResponses.reduce((sum, u) => sum + u.total_points, 0) / usersWithResponses.length
			: 0;
		const avgAccuracyPerUser = usersWithResponses.length > 0
			? usersWithResponses.reduce((sum, u) => {
				return sum + (u.total_possible > 0 ? (u.total_points / u.total_possible) * 100 : 0);
			}, 0) / usersWithResponses.length
			: 0;

		// Average response interval across all users
		const allUserIntervals = [];
		for (const u of perUserAgg) {
			if (u.first_submitted && u.last_submitted && u.total_responses > 1) {
				const duration = new Date(u.last_submitted).getTime() - new Date(u.first_submitted).getTime();
				allUserIntervals.push(duration / (u.total_responses - 1));
			}
		}
		const avgResponseIntervalAll = allUserIntervals.length > 0
			? Math.round(allUserIntervals.reduce((a, b) => a + b, 0) / allUserIntervals.length)
			: null;

		// Average active time across all users
		const allUserActiveTimes = perUserAgg
			.filter(u => u.first_submitted && u.last_submitted)
			.map(u => new Date(u.last_submitted).getTime() - new Date(u.first_submitted).getTime());
		const avgActiveTime = allUserActiveTimes.length > 0
			? Math.round(allUserActiveTimes.reduce((a, b) => a + b, 0) / allUserActiveTimes.length)
			: null;

		// ===== Per-round breakdown for user + general averages =====
		const roundsByUser = {};
		for (const r of userResponses) {
			if (!roundsByUser[r.round_id]) {
				roundsByUser[r.round_id] = {
					round_id: r.round_id,
					points_earned: 0,
					points_possible: 0,
					correct_count: 0,
					total_responses: 0,
					submitted_times: [],
				};
			}
			roundsByUser[r.round_id].points_earned += r.points_earned;
			roundsByUser[r.round_id].points_possible += r.points_possible;
			if (r.is_correct) roundsByUser[r.round_id].correct_count++;
			roundsByUser[r.round_id].total_responses++;
			if (r.submitted_at) {
				roundsByUser[r.round_id].submitted_times.push(new Date(r.submitted_at).getTime());
			}
		}

		// Per-round general averages (anonymous)
		const roundGeneralStats = {};
		for (const entry of perRoundUserAgg) {
			const rid = entry._id.round_id;
			if (!roundGeneralStats[rid]) {
				roundGeneralStats[rid] = { accuracies: [], times: [] };
			}
			const acc = entry.points_possible > 0
				? (entry.points_earned / entry.points_possible) * 100 : 0;
			roundGeneralStats[rid].accuracies.push(acc);

			if (entry.first_submitted && entry.last_submitted && entry.total_responses > 1) {
				const duration = new Date(entry.last_submitted).getTime() -
					new Date(entry.first_submitted).getTime();
				roundGeneralStats[rid].times.push(duration);
			}
		}

		const userPerRound = Object.values(roundsByUser).map(r => {
			const userAcc = r.points_possible > 0
				? Math.round((r.points_earned / r.points_possible) * 10000) / 100
				: 0;

			const genStats = roundGeneralStats[r.round_id];
			const avgAccForRound = genStats && genStats.accuracies.length > 0
				? Math.round((genStats.accuracies.reduce((a, b) => a + b, 0) / genStats.accuracies.length) * 100) / 100
				: 0;
			const avgTimeForRound = genStats && genStats.times.length > 0
				? Math.round(genStats.times.reduce((a, b) => a + b, 0) / genStats.times.length)
				: null;

			// User's round time (first to last submission)
			let roundTime = null;
			if (r.submitted_times.length > 1) {
				r.submitted_times.sort((a, b) => a - b);
				roundTime = r.submitted_times[r.submitted_times.length - 1] - r.submitted_times[0];
			}

			return {
				round_id: r.round_id,
				points_earned: r.points_earned,
				points_possible: r.points_possible,
				correct_count: r.correct_count,
				incorrect_count: r.total_responses - r.correct_count,
				total_responses: r.total_responses,
				accuracy: userAcc,
				general_avg_accuracy: avgAccForRound,
				round_time: roundTime,
				general_avg_round_time: avgTimeForRound,
			};
		}).sort((a, b) => a.round_id - b.round_id);

		// ===== Per-question type accuracy for the user =====
		const typeBreakdown = {};
		for (const r of userResponses) {
			const type = r.question_type || 'multiple-choice';
			if (!typeBreakdown[type]) {
				typeBreakdown[type] = { correct: 0, total: 0, points_earned: 0, points_possible: 0 };
			}
			typeBreakdown[type].total++;
			if (r.is_correct) typeBreakdown[type].correct++;
			typeBreakdown[type].points_earned += r.points_earned;
			typeBreakdown[type].points_possible += r.points_possible;
		}
		const typeStats = Object.entries(typeBreakdown).map(([type, stats]) => ({
			type,
			correct: stats.correct,
			total: stats.total,
			accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 10000) / 100 : 0,
			points_earned: stats.points_earned,
			points_possible: stats.points_possible,
		}));

		// Training duration
		const trainingDuration = trainingDoc.started_at && trainingDoc.completed_at
			? new Date(trainingDoc.completed_at).getTime() - new Date(trainingDoc.started_at).getTime()
			: (trainingDoc.training_timer?.elapsed_time || 0);

		return NextResponse.json({
			success: true,
			results: {
				personal: {
					total_points_earned: userPointsEarned,
					total_points_possible: userPointsPossible,
					accuracy: userAccuracy,
					correct_count: userCorrectCount,
					incorrect_count: userResponses.length - userCorrectCount,
					total_responses: userResponses.length,
					avg_response_interval: userAvgResponseInterval,
					active_time: userActiveTime,
					first_submission: userFirstSubmission,
					last_submission: userLastSubmission,
				},
				ranking: {
					position: userPosition,
					total_participants: totalParticipants,
				},
				general: {
					avg_accuracy: Math.round(avgAccuracyPerUser * 100) / 100,
					avg_points_per_user: Math.round(avgPointsPerUser * 100) / 100,
					avg_response_interval: avgResponseIntervalAll,
					avg_active_time: avgActiveTime,
					total_participants: totalParticipants,
				},
				per_round: userPerRound,
				type_stats: typeStats,
				training_duration: trainingDuration,
			},
		});

	} catch (error) {
		console.error('Error in GET /api/trainings/[id]/results:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao buscar resultados' },
			{ status: 500 }
		);
	}
}, ['participant', 'facilitator']));
