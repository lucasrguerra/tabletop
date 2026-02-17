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
import ParticipantResultsDashboard from '@/components/Trainings/ParticipantResultsDashboard';
import EvaluationForm from '@/components/Trainings/EvaluationForm';
import { FaLightbulb } from 'react-icons/fa';

export default function ParticipantPage() {
	const router = useRouter();
	const params = useParams();
	const [training, setTraining] = useState(null);
	const [scenarioData, setScenarioData] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [viewingRound, setViewingRound] = useState(0);
	const [responses, setResponses] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [resultsData, setResultsData] = useState(null);
	const [evaluationData, setEvaluationData] = useState(undefined);

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

			if (data.userRole !== 'participant') {
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

	// Fetch user's responses for this training
	const fetchResponses = async () => {
		try {
			const response = await fetch(`/api/trainings/${params.id}/responses`, {
				method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setResponses(data.responses || []);
				}
			}
		} catch (err) {
			console.error('Error fetching responses:', err);
		}
	};

	// Fetch results data (only when training is completed)
	const fetchResults = async () => {
		try {
			const response = await fetch(`/api/trainings/${params.id}/results`, {
				method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setResultsData(data.results);
				}
			}
		} catch (err) {
			console.error('Error fetching results:', err);
		}
	};

	// Fetch evaluation status (only when training is completed)
	const fetchEvaluation = async () => {
		try {
			const response = await fetch(`/api/trainings/${params.id}/evaluations`, {
				method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setEvaluationData(data.evaluation || null);
				}
			}
		} catch (err) {
			console.error('Error fetching evaluation:', err);
		}
	};

	// Submit an answer to a question
	const handleSubmitAnswer = async (roundIndex, questionId, answer) => {
		setSubmitting(true);
		try {
			const response = await fetch(`/api/trainings/${params.id}/responses`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					round_id: roundIndex,
					question_id: questionId,
					answer,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Erro ao enviar resposta');
			}

			setResponses(prev => [...prev, data.response]);
			return data.response;
		} finally {
			setSubmitting(false);
		}
	};

	// Initial load
	useEffect(() => {
		const init = async () => {
			await fetchTraining(true);
		};
		init();
	}, [params.id]);

	// Fetch scenario and responses after training loads, and refetch when current_round changes
	useEffect(() => {
		if (training) {
			fetchScenario();
			fetchResponses();
		}
	}, [training?.current_round, params.id]);

	// Fetch results and evaluation when training is completed
	useEffect(() => {
		if (training?.status === 'completed') {
			fetchResults();
			fetchEvaluation();
		}
	}, [training?.status, params.id]);

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
					{/* Status row */}
					<div className="flex flex-wrap items-center gap-3 mb-4">
						<TrainingStatusBadge status={training.status} size="md" />
						{training.status === 'not_started' && (
							<span className="text-sm text-slate-500">Aguardando início do facilitador</span>
						)}
						{training.status === 'active' && (
							<span className="text-sm text-emerald-600 font-medium">Treinamento em andamento!</span>
						)}
						{training.status === 'paused' && (
							<span className="text-sm text-amber-600 font-medium">Aguardando retomada</span>
						)}
						{training.status === 'completed' && (
							<span className="text-sm text-blue-600 font-medium">Treinamento finalizado — veja seus resultados abaixo!</span>
						)}
					</div>

					{/* Timers side by side */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<TrainingTimerDisplay training={training} />
						<RoundTimerDisplay training={training} userRole={userRole} />
					</div>
				</div>

				{/* ── RESULTS DASHBOARD (completed) ── */}
				{training.status === 'completed' && resultsData && (
					<ParticipantResultsDashboard
						results={resultsData}
						rounds={rounds}
					/>
				)}

				{/* ── EVALUATION FORM (completed) ── */}
				{training.status === 'completed' && evaluationData !== undefined && (
					<EvaluationForm
						trainingId={params.id}
						existingEvaluation={evaluationData}
						onSubmitted={(eval_) => setEvaluationData(eval_)}
					/>
				)}

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

					{/* LEFT: Questions - Primary task (3/5 width) */}
					<div className="lg:col-span-3 space-y-5">
						{/* Metrics & Evidence */}
						{metricsRounds.length > 0 && (
							<MetricsDisplay
								rounds={metricsRounds}
								currentRound={viewingRound}
							/>
						)}

						{/* Questions - the participant's main task */}
						{viewingRoundData?.questions?.length > 0 && (
							<RoundQuestions
								questions={viewingRoundData.questions}
								roundIndex={viewingRound}
								roundTitle={viewingRoundData.title}
								onSubmitAnswer={handleSubmitAnswer}
								responses={responses.filter(r => r.round_id === viewingRound)}
								submitting={submitting}
								canAnswer={training.status === 'active' && userRole === 'participant'}
							/>
						)}

						{/* Show a waiting state if no questions */}
						{training.status !== 'not_started' && (!viewingRoundData?.questions || viewingRoundData.questions.length === 0) && (
							<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-8 text-center">
								<p className="text-slate-500">Nenhuma questão disponível para esta rodada.</p>
							</div>
						)}
					</div>

					{/* RIGHT: Supporting context (2/5 width) */}
					<div className="lg:col-span-2 space-y-5">
						{/* Round Info */}
						{viewingRoundData && totalRounds > 0 && (
							<RoundInfo
								round={viewingRoundData}
								roundIndex={viewingRound}
								totalRounds={totalRounds}
							/>
						)}

						{/* Scenario Context */}
						{scenarioData && (
							<BaseScenarioDisplay scenario={scenarioData} />
						)}

						{/* Tip card */}
						<div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
							<h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
								<FaLightbulb className="text-blue-600" />
								Dica para Participantes
							</h4>
							<p className="text-sm text-slate-700">
								Analise as métricas e evidências ao lado para discutir as questões com sua equipe.
								Utilize a navegação de rodadas para revisitar informações anteriores.
							</p>
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
