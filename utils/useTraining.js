'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSocket from '@/utils/useSocket';

/**
 * Phases of a training session. The three role pages all key their layout off
 * this instead of off `status`, because `active` and `paused` demand the exact
 * same screen — only the controls differ.
 */
export const PHASE = {
	SETUP: 'setup',       // status: not_started
	LIVE: 'live',         // status: active | paused
	REVIEW: 'review',     // status: completed
};

export function phaseOf(status) {
	if (status === 'completed') { return PHASE.REVIEW; }
	if (status === 'active' || status === 'paused') { return PHASE.LIVE; }
	return PHASE.SETUP;
}

/**
 * Loads everything a training page needs and keeps it in sync over Socket.io.
 *
 * All three role pages (facilitator / participant / observer) used to carry
 * their own copy of this logic, which is why the same bug had to be fixed three
 * times. Data fetching lives here once; the pages only decide what to render.
 *
 * @param {Object} [options]
 * @param {string} [options.expectRole] - Redirect to the correct page if the
 *   user's role in this training is not this one.
 * @param {boolean} [options.withResponses] - Load answers (own or everyone's,
 *   depending on the role the API sees).
 * @param {boolean} [options.withResults] - Load the results payload once the
 *   training is complete.
 * @param {boolean} [options.withEvaluations] - Load evaluation data.
 */
export default function useTraining({
	expectRole = null,
	withResponses = false,
	withResults = false,
	withEvaluations = false,
} = {}) {
	const router = useRouter();
	const params = useParams();
	const trainingId = params.id;

	const [training, setTraining] = useState(null);
	const [scenario, setScenario] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [responses, setResponses] = useState([]);
	const [responseSummary, setResponseSummary] = useState(null);
	const [results, setResults] = useState(null);
	const [evaluation, setEvaluation] = useState(undefined);
	const [evaluations, setEvaluations] = useState([]);
	const [evaluationStats, setEvaluationStats] = useState(null);
	const [csrfToken, setCsrfToken] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Round the user is reading. Deliberately NOT forced to follow the
	// facilitator: yanking someone out of a half-written answer loses their work.
	const [viewingRound, setViewingRound] = useState(0);
	const [pendingRound, setPendingRound] = useState(null);
	const lastKnownRound = useRef(null);

	const { socket, isConnected } = useSocket(trainingId);

	const request = useCallback(async (path) => {
		const res = await fetch(`/api/trainings/${trainingId}${path}`, {
			method: 'GET',
			credentials: 'include',
		});
		if (!res.ok) { return null; }
		const data = await res.json();
		return data?.success ? data : null;
	}, [trainingId]);

	// ── CSRF ──────────────────────────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false;
		fetch('/api/csrf')
			.then(res => res.json())
			.then(data => {
				if (!cancelled && data?.success) { setCsrfToken(data.csrf_token); }
			})
			.catch(err => console.error('Error fetching CSRF token:', err));
		return () => { cancelled = true; };
	}, []);

	// ── Training ──────────────────────────────────────────────────────────────
	const fetchTraining = useCallback(async (showLoading = false) => {
		try {
			if (showLoading) { setLoading(true); }
			setError(null);

			const res = await fetch(`/api/trainings/${trainingId}`, {
				method: 'GET',
				credentials: 'include',
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || 'Erro ao carregar treinamento');
			}

			const data = await res.json();

			if (expectRole && data.userRole !== expectRole) {
				router.replace(`/dashboard/trainings/${trainingId}/${data.userRole}`);
				return;
			}

			setTraining(data.training);
			setUserRole(data.userRole);

			// First load lands on the facilitator's round; later advances only
			// raise a notice the reader can accept when they are ready.
			const round = data.training.current_round ?? 0;
			if (lastKnownRound.current === null) {
				setViewingRound(round);
			} else if (round !== lastKnownRound.current) {
				setPendingRound(round);
			}
			lastKnownRound.current = round;

		} catch (err) {
			console.error('Error fetching training:', err);
			setError(err.message);
		} finally {
			if (showLoading) { setLoading(false); }
		}
	}, [trainingId, expectRole, router]);

	// ── Scenario / responses ──────────────────────────────────────────────────
	const fetchScenario = useCallback(async () => {
		const data = await request('/scenario');
		if (data) { setScenario(data.scenario); }
	}, [request]);

	const fetchResponses = useCallback(async () => {
		const data = await request('/responses');
		if (data) {
			setResponses(data.responses || []);
			setResponseSummary(data.summary || null);
		}
	}, [request]);

	const fetchResults = useCallback(async () => {
		const data = await request('/results');
		if (data) { setResults(data.results); }
	}, [request]);

	const fetchEvaluations = useCallback(async () => {
		const data = await request('/evaluations');
		if (!data) { return; }
		// Participants get their own evaluation; monitors get the whole set.
		setEvaluation(data.evaluation ?? null);
		setEvaluations(data.evaluations || []);
		setEvaluationStats(data.stats || null);
	}, [request]);

	// ── Orchestration ─────────────────────────────────────────────────────────
	useEffect(() => {
		fetchTraining(true);
	}, [fetchTraining]);

	const currentRound = training?.current_round ?? 0;
	const status = training?.status;

	useEffect(() => {
		if (!training) { return; }
		fetchScenario();
		if (withResponses) { fetchResponses(); }
	}, [training?.id, currentRound, status, withResponses, fetchScenario, fetchResponses]);

	useEffect(() => {
		if (status !== 'completed') { return; }
		if (withResults) { fetchResults(); }
		if (withEvaluations) { fetchEvaluations(); }
	}, [status, withResults, withEvaluations, fetchResults, fetchEvaluations]);

	// ── Live updates ──────────────────────────────────────────────────────────
	useEffect(() => {
		if (!socket) { return; }

		const onTrainingUpdated = () => fetchTraining();
		const onResponseUpdate = () => { if (withResponses) { fetchResponses(); } };

		socket.on('training:updated', onTrainingUpdated);
		socket.on('training:response-submitted', onResponseUpdate);

		return () => {
			socket.off('training:updated', onTrainingUpdated);
			socket.off('training:response-submitted', onResponseUpdate);
		};
	}, [socket, fetchTraining, fetchResponses, withResponses]);

	/** Accepts a round the facilitator opened while the user was reading. */
	const goToPendingRound = useCallback(() => {
		if (pendingRound === null) { return; }
		setViewingRound(pendingRound);
		setPendingRound(null);
	}, [pendingRound]);

	const dismissPendingRound = useCallback(() => setPendingRound(null), []);

	return {
		trainingId,
		training,
		scenario,
		userRole,
		phase: phaseOf(status),
		rounds: scenario?.rounds || [],
		currentRound,

		responses,
		responseSummary,
		results,
		evaluation,
		evaluations,
		evaluationStats,
		csrfToken,

		loading,
		error,
		isConnected,

		viewingRound,
		setViewingRound,
		pendingRound,
		goToPendingRound,
		dismissPendingRound,

		setTraining,
		setResponses,
		setEvaluation,
		refetch: fetchTraining,
		refetchResponses: fetchResponses,
	};
}
