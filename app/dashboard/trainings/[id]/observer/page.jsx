'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import TrainingHeader from '@/components/Trainings/TrainingHeader';
import TrainingTimerDisplay from '@/components/Trainings/TrainingTimerDisplay';
import RoundTimerDisplay from '@/components/Trainings/RoundTimerDisplay';
import ParticipantsList from '@/components/Trainings/ParticipantsList';
import TrainingStatusBadge from '@/components/Trainings/TrainingStatusBadge';
import LoadingSpinner from '@/components/Trainings/LoadingSpinner';
import ErrorAlert from '@/components/Trainings/ErrorAlert';
import BaseScenarioDisplay from '@/components/Trainings/BaseScenarioDisplay';
import RoundInfo from '@/components/Trainings/RoundInfo';
import RoundQuestions from '@/components/Trainings/RoundQuestions';
import MetricsDisplay from '@/components/Trainings/MetricsDisplay';
import RoundNavigator from '@/components/Trainings/RoundNavigator';
import { FaEye, FaInfoCircle } from 'react-icons/fa';

export default function ObserverPage() {
	const router = useRouter();
	const params = useParams();
	const [training, setTraining] = useState(null);
	const [scenarioData, setScenarioData] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [viewingRound, setViewingRound] = useState(0);

	// Keep viewingRound in sync when facilitator advances
	const syncViewingRound = useCallback((currentRound, prevCurrentRound) => {
		if (currentRound !== prevCurrentRound) {
			setViewingRound(currentRound);
		}
	}, []);

	// Fetch training data
	const fetchTraining = async (showLoading = false) => {
		try {
			if (showLoading) setLoading(true);
			setError(null);

			const response = await fetch(`/api/trainings/${params.id}`, {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao carregar treinamento');
			}

			const data = await response.json();

			if (data.userRole !== 'observer') {
				router.replace(`/dashboard/trainings/${params.id}/${data.userRole}`);
				return;
			}

			const prevRound = training?.current_round ?? 0;
			setTraining(data.training);
			setUserRole(data.userRole);
			syncViewingRound(data.training.current_round ?? 0, prevRound);
		} catch (err) {
			console.error('Error fetching training:', err);
			setError(err.message);
		} finally {
			if (showLoading) setLoading(false);
		}
	};

	// Fetch scenario data (sanitized by backend)
	const fetchScenario = async () => {
		try {
			const response = await fetch(`/api/trainings/${params.id}/scenario`, {
				method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setScenarioData(data.scenario);
				}
			}
		} catch (err) {
			console.error('Error fetching scenario:', err);
		}
	};

	// Initial load
	useEffect(() => {
		fetchTraining(true);
	}, [params.id]);

	// Fetch scenario after training loads, and refetch when current_round changes
	useEffect(() => {
		if (training) {
			fetchScenario();
		}
	}, [training?.current_round, params.id]);

	// Poll for updates every 10 seconds when training is active or paused
	useEffect(() => {
		if (!training || training.status === 'not_started' || training.status === 'completed') return;

		const interval = setInterval(() => {
			fetchTraining();
		}, 10000);

		return () => clearInterval(interval);
	}, [training?.status, params.id]);

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<LoadingSpinner />
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout>
				<ErrorAlert message={error} onRetry={() => fetchTraining(true)} />
			</DashboardLayout>
		);
	}

	const currentRound = training.current_round ?? 0;
	const rounds = scenarioData?.rounds || [];
	const viewingRoundData = rounds[viewingRound] || null;
	const totalRounds = scenarioData ? rounds.length : 0;
	const metricsRounds = rounds.slice(0, viewingRound + 1);

	return (
		<DashboardLayout>
			<div className="space-y-5">
				{/* Header */}
				<TrainingHeader training={training} userRole={userRole} />

				{/* ── STATUS + TIMERS STRIP ── */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-5">
					{/* Status row with observer indicator */}
					<div className="flex flex-wrap items-center gap-3 mb-4">
						<TrainingStatusBadge status={training.status} size="md" />
						<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
							<FaEye className="text-slate-400" />
							Modo Observador
						</span>
						{training.status === 'not_started' && (
							<span className="text-sm text-slate-500">Aguardando início</span>
						)}
						{training.status === 'active' && (
							<span className="text-sm text-emerald-600 font-medium">Em andamento</span>
						)}
						{training.status === 'paused' && (
							<span className="text-sm text-amber-600 font-medium">Pausado</span>
						)}
						{training.status === 'completed' && (
							<span className="text-sm text-blue-600 font-medium">Concluído</span>
						)}
					</div>

					{/* Timers side by side */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<TrainingTimerDisplay training={training} />
						<RoundTimerDisplay training={training} userRole={userRole} />
					</div>
				</div>

				{/* ── ROUND NAVIGATION ── */}
				{training.status !== 'not_started' && rounds.length > 0 && (
					<RoundNavigator
						rounds={rounds}
						currentRound={currentRound}
						viewingRound={viewingRound}
						onRoundSelect={setViewingRound}
					/>
				)}

				{/* ── MAIN CONTENT: 2-column on lg ── */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

					{/* LEFT: Round + Questions (3/5 width) */}
					<div className="lg:col-span-3 space-y-5">
						{/* Round Info */}
						{viewingRoundData && totalRounds > 0 && (
							<RoundInfo
								round={viewingRoundData}
								roundIndex={viewingRound}
								totalRounds={totalRounds}
							/>
						)}

						{/* Questions (read-only for observer) */}
						{viewingRoundData?.questions?.length > 0 && (
							<RoundQuestions
								questions={viewingRoundData.questions}
								roundIndex={viewingRound}
								roundTitle={viewingRoundData.title}
							/>
						)}
					</div>

					{/* RIGHT: Metrics + Scenario + Guidelines (2/5 width) */}
					<div className="lg:col-span-2 space-y-5">
						{/* Metrics & Evidence */}
						{metricsRounds.length > 0 && (
							<MetricsDisplay
								rounds={metricsRounds}
								currentRound={viewingRound}
							/>
						)}

						{/* Scenario Context */}
						{scenarioData && (
							<BaseScenarioDisplay scenario={scenarioData} />
						)}

						{/* Observer Guidelines - compact */}
						<div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
							<h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
								<FaInfoCircle className="text-slate-500" />
								Diretrizes para Observadores
							</h4>
							<ul className="space-y-1.5 text-sm text-slate-600">
								<li className="flex items-start gap-2">
									<span className="text-slate-400 mt-0.5">•</span>
									<span>Observe as interações e dinâmicas da equipe</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-slate-400 mt-0.5">•</span>
									<span>Registre pontos importantes para feedback posterior</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-slate-400 mt-0.5">•</span>
									<span>Evite interferir no processo do treinamento</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-slate-400 mt-0.5">•</span>
									<span>Use a navegação de rodadas para revisar métricas anteriores</span>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* ── PARTICIPANTS ── */}
				<ParticipantsList
					participants={training.participants}
					userRole={userRole}
				/>
			</div>
		</DashboardLayout>
	);
}
