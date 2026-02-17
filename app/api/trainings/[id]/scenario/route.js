import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withTrainingRole } from '@/utils/trainingAuth';
import readScenario from '@/models/Trainings/readScenario';

/**
 * Strips sensitive answer data from a question object.
 * Returns only the question text, type, options, and structural data
 * needed for display — never correctAnswer, justification, etc.
 */
function sanitizeQuestion(question) {
	const type = question.type || 'multiple-choice';

	const safe = {
		id: question.id,
		type,
		text: question.text,
		points: question.points,
	};

	switch (type) {
		case 'multiple-choice':
			safe.options = question.options;
			break;

		case 'true-false':
			// No extra fields needed — user picks true or false
			break;

		case 'numeric':
			safe.unit = question.unit || null;
			break;

		case 'matching':
			safe.leftColumn = question.leftColumn;
			safe.rightColumn = question.rightColumn;
			safe.partialCredit = question.partialCredit;
			safe.pointsPerMatch = question.pointsPerMatch;
			break;

		case 'ordering':
			// Send items in their original (mixed) order
			safe.items = question.items;
			safe.partialCredit = question.partialCredit;
			break;

		default:
			// Unknown type — send only base fields
			if (question.options) safe.options = question.options;
			break;
	}

	return safe;
}

/**
 * Sanitizes a single round: keeps scenario context data,
 * strips answer-sensitive fields from questions.
 */
function sanitizeRound(round) {
	return {
		id: round.id,
		title: round.title,
		phase: round.phase,
		description: round.description,
		inject: round.inject,
		timeElapsed: round.timeElapsed,
		currentSituation: round.currentSituation,
		metrics: round.metrics || [],
		questions: (round.questions || []).map(sanitizeQuestion),
	};
}

/**
 * GET /api/trainings/[id]/scenario
 *
 * Returns scenario data for the training, filtered by role:
 * - Facilitator: full scenario data (all rounds, all fields)
 * - Participant / Observer: only rounds up to and including current_round,
 *   with answer-sensitive fields stripped from questions.
 *
 * Requires authentication and training participation.
 */
export const GET = withAuth(withTrainingRole(async (request, context, session, training, userRole) => {
	try {
		const scenarioResult = await readScenario(
			training.scenario.id,
			training.scenario.category,
			training.scenario.type
		);

		if (!scenarioResult.success) {
			return NextResponse.json(
				{ success: false, message: 'Erro ao carregar dados do cenário' },
				{ status: 404 }
			);
		}

		const scenario = scenarioResult.scenario;

		// Facilitator gets everything unchanged
		if (userRole === 'facilitator') {
			return NextResponse.json({
				success: true,
				scenario,
			}, { status: 200 });
		}

		// Participant & Observer: filter rounds and strip answers
		const currentRound = training.current_round ?? 0;
		const visibleRounds = (scenario.rounds || [])
			.filter((_, index) => index <= currentRound)
			.map(sanitizeRound);

		const safeScenario = {
			id: scenario.id,
			title: scenario.title,
			description: scenario.description,
			category: scenario.category,
			metadata: scenario.metadata,
			objectives: scenario.objectives,
			scope: scenario.scope,
			baseScenario: scenario.baseScenario,
			rounds: visibleRounds,
			// Do NOT expose: evaluation, facilitatorNotes, technicalReferences
		};

		return NextResponse.json({
			success: true,
			scenario: safeScenario,
			currentRound,
			totalRounds: (scenario.rounds || []).length,
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/trainings/[id]/scenario:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao buscar dados do cenário' },
			{ status: 500 }
		);
	}
}));
