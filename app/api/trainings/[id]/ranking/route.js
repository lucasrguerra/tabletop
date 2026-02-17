import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDatabase from '@/database/database';
import Training from '@/database/schemas/Training';
import Response from '@/database/schemas/Response';
import rateLimit from '@/utils/rateLimit';

/**
 * GET /api/trainings/[id]/ranking
 * Public endpoint — no authentication required.
 * Returns only the ranking data: participant nicknames, points, and position.
 * No sensitive data is exposed (no IDs, emails, answers, access codes, etc.).
 */
export async function GET(request, context) {
	// Rate limit: 60 requests per 15 seconds (supports 3s polling from multiple clients)
	const rateLimitResponse = await rateLimit(request, {
		max_requests: 60,
		window_ms: 15 * 1000,
	});
	if (rateLimitResponse) return rateLimitResponse;

	try {
		const params = await context.params;
		const trainingId = params.id;

		// Validate ObjectId format
		if (!trainingId || !mongoose.Types.ObjectId.isValid(trainingId)) {
			return NextResponse.json(
				{ success: false, message: 'ID do treinamento inválido' },
				{ status: 400 }
			);
		}

		await connectDatabase();

		// Fetch only the fields we need — never expose access_code, participants.user_id, etc.
		const training = await Training.findById(trainingId)
			.select('name status participants.user_id participants.role participants.status')
			.populate('participants.user_id', 'name nickname')
			.lean();

		if (!training) {
			return NextResponse.json(
				{ success: false, message: 'Treinamento não encontrado' },
				{ status: 404 }
			);
		}

		// Build a map of accepted participants (only participants, not facilitators/observers)
		const acceptedParticipants = training.participants.filter(
			(p) => p.status === 'accepted' && p.role === 'participant'
		);

		if (acceptedParticipants.length === 0) {
			return NextResponse.json({
				success: true,
				training: { name: training.name, status: training.status },
				ranking: [],
			});
		}

		const participantUserIds = acceptedParticipants.map((p) => p.user_id._id);

		// Aggregate: total points and latest submission per participant
		const aggregation = await Response.aggregate([
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
					correct_count: {
						$sum: { $cond: ['$is_correct', 1, 0] },
					},
					total_responses: { $sum: 1 },
					last_submitted_at: { $max: '$submitted_at' },
				},
			},
			{
				// Primary: highest points first. Tiebreaker: earliest last submission first.
				$sort: { total_points: -1, last_submitted_at: 1 },
			},
		]);

		// Build a lookup from aggregation results
		const statsMap = new Map();
		for (const entry of aggregation) {
			statsMap.set(entry._id.toString(), entry);
		}

		// Build ranking list — include all accepted participants (even those with 0 responses)
		const rankingList = acceptedParticipants.map((p) => {
			const uid = p.user_id._id.toString();
			const stats = statsMap.get(uid);
			return {
				nickname: p.user_id.nickname || p.user_id.name,
				total_points: stats?.total_points ?? 0,
				total_possible: stats?.total_possible ?? 0,
				correct_count: stats?.correct_count ?? 0,
				total_responses: stats?.total_responses ?? 0,
				last_submitted_at: stats?.last_submitted_at ?? null,
			};
		});

		// Sort: primary by total_points DESC, tiebreaker by last_submitted_at ASC (null = last)
		rankingList.sort((a, b) => {
			if (b.total_points !== a.total_points) {
				return b.total_points - a.total_points;
			}
			// Tiebreaker: earlier last submission wins
			if (a.last_submitted_at && b.last_submitted_at) {
				return new Date(a.last_submitted_at) - new Date(b.last_submitted_at);
			}
			// Participants with no submissions go last
			if (a.last_submitted_at && !b.last_submitted_at) return -1;
			if (!a.last_submitted_at && b.last_submitted_at) return 1;
			return 0;
		});

		// Assign positions (same points + same tiebreak = same rank)
		const ranking = rankingList.map((entry, index) => {
			// Remove the raw date from the public response
			const { last_submitted_at, ...safe } = entry;
			return { position: index + 1, ...safe };
		});

		return NextResponse.json({
			success: true,
			training: { name: training.name, status: training.status },
			ranking,
		});
	} catch (error) {
		console.error('Error in GET /api/trainings/[id]/ranking:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao buscar ranking' },
			{ status: 500 }
		);
	}
}
