'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import TrainingHeader from '@/components/Trainings/TrainingHeader';
import TrainingTimerDisplay from '@/components/Trainings/TrainingTimerDisplay';
import RoundTimerDisplay from '@/components/Trainings/RoundTimerDisplay';
import ParticipantsList from '@/components/Trainings/ParticipantsList';
import ScenarioInfo from '@/components/Trainings/ScenarioInfo';
import TrainingStatusBadge from '@/components/Trainings/TrainingStatusBadge';
import AccessCodeCard from '@/components/Trainings/AccessCodeCard';
import InviteParticipantCard from '@/components/Trainings/InviteParticipantCard';
import LoadingSpinner from '@/components/Trainings/LoadingSpinner';
import ErrorAlert from '@/components/Trainings/ErrorAlert';
import RoundControl from '@/components/Trainings/RoundControl';
import RoundInfo from '@/components/Trainings/RoundInfo';
import MetricsDisplay from '@/components/Trainings/MetricsDisplay';
import TrainingStatsDashboard from '@/components/Trainings/TrainingStatsDashboard';
import FacilitatorQuestionsView from '@/components/Trainings/FacilitatorQuestionsView';
import EvaluationStats from '@/components/Trainings/EvaluationStats';
import ExportPDFButton from '@/components/Trainings/ExportPDFButton';
import { FaPlay, FaPause, FaCheckCircle, FaUndoAlt, FaChevronDown, FaChevronUp, FaTrophy, FaTrash } from 'react-icons/fa';

export default function FacilitatorPage() {
	const router = useRouter();
	const params = useParams();
	const [training, setTraining] = useState(null);
	const [scenarioData, setScenarioData] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [actionLoading, setActionLoading] = useState(false);
	const [responses, setResponses] = useState([]);
	const [responseSummary, setResponseSummary] = useState(null);
	const [showTools, setShowTools] = useState(false);
	const [evaluations, setEvaluations] = useState([]);
	const [evaluationStats, setEvaluationStats] = useState(null);
	const [csrfToken, setCsrfToken] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Fetch CSRF token
	useEffect(() => {
		const fetchCsrf = async () => {
			try {
				const res = await fetch('/api/csrf');
				const data = await res.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Error fetching CSRF token:', err);
			}
		};
		fetchCsrf();
	}, []);

	// Fetch participant responses (for facilitator real-time view)
	const fetchResponses = useCallback(async () => {
		try {
			const res = await fetch(`/api/trainings/${params.id}/responses`, {
				method: 'GET',
				credentials: 'include'
			});
			if (res.ok) {
				const data = await res.json();
				if (data.success) {
					setResponses(data.responses || []);
					setResponseSummary(data.summary || null);
				}
			}
		} catch (err) {
			console.error('Error fetching responses:', err);
		}
	}, [params.id]);

	// Fetch evaluation data (only when training is completed)
	const fetchEvaluations = useCallback(async () => {
		try {
			const res = await fetch(`/api/trainings/${params.id}/evaluations`, {
				method: 'GET',
				credentials: 'include'
			});
			if (res.ok) {
				const data = await res.json();
				if (data.success) {
					setEvaluations(data.evaluations || []);
					setEvaluationStats(data.stats || null);
				}
			}
		} catch (err) {
			console.error('Error fetching evaluations:', err);
		}
	}, [params.id]);

	// Fetch training data (showLoading=true only for initial load)
	const fetchTraining = async (showLoading = false) => {
		try {
			if (showLoading) {
				setLoading(true);
			}
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

			// Validate that user is actually a facilitator
			if (data.userRole !== 'facilitator') {
				router.replace(`/dashboard/trainings/${params.id}/${data.userRole}`);
				return;
			}

			setTraining(data.training);
			setUserRole(data.userRole);

			// Fetch scenario data with rounds (only on initial load)
			if (showLoading && data.training.scenario) {
				try {
					const scenarioResponse = await fetch(
						`/api/trainings/scenarios?` +
						new URLSearchParams({
							scenario_id: data.training.scenario.id,
							category: data.training.scenario.category,
							type: data.training.scenario.type
						}),
						{ credentials: 'include' }
					);
					if (scenarioResponse.ok) {
						const scenarioResult = await scenarioResponse.json();
						if (scenarioResult.success) {
							setScenarioData(scenarioResult.scenario);
						}
					}
				} catch (err) {
					console.error('Error fetching scenario data:', err);
				}
			}
		} catch (err) {
			console.error('Error fetching training:', err);
			setError(err.message);
		} finally {
			if (showLoading) {
				setLoading(false);
			}
		}
	};

	// Initial load
	useEffect(() => {
		fetchTraining(true);
	}, [params.id]);

	// Poll for updates every 10 seconds when training is active
	useEffect(() => {
		if (!training || training.status === 'not_started' || training.status === 'completed') return;

		const interval = setInterval(() => {
			fetchTraining();
		}, 10000);

		return () => clearInterval(interval);
	}, [training?.status, params.id]);

	// Fetch responses on initial load and poll every 5 seconds when active
	useEffect(() => {
		if (!training) return;

		// Initial fetch
		fetchResponses();

		if (training.status === 'not_started') return;

		const interval = setInterval(fetchResponses, 5000);
		return () => clearInterval(interval);
	}, [training?.status, training?.current_round, params.id, fetchResponses]);

	// Fetch evaluations when training is completed
	useEffect(() => {
		if (training?.status === 'completed') {
			fetchEvaluations();
		}
	}, [training?.status, params.id, fetchEvaluations]);

	// Handle invite sent
	const handleInviteSent = () => {
		fetchTraining();
	};

	// Handle timer actions (for round timer)
	const handleTimerAction = async (action) => {
		try {
			setActionLoading(true);
			
			const response = await fetch(`/api/trainings/${params.id}/timer`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify({ action }),
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao controlar timer');
			}
			
			await fetchTraining();
		} catch (err) {
			console.error('Error with timer action:', err);
			alert(err.message || 'Erro ao executar ação no timer');
		} finally {
			setActionLoading(false);
		}
	};

	// Handle training status change
	const handleStatusChange = async (newStatus) => {
		try {
			setActionLoading(true);
			
			const response = await fetch(`/api/trainings/${params.id}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify({ status: newStatus }),
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao mudar status');
			}
			
			await fetchTraining();
		} catch (err) {
			console.error('Error changing status:', err);
			alert(err.message || 'Erro ao mudar status do treinamento');
		} finally {
			setActionLoading(false);
		}
	};

	// Handle round change
	const handleRoundChange = async (action, roundNumber = null) => {
		try {
			const body = { action };
			if (action === 'set' && roundNumber !== null) {
				body.round = roundNumber;
			}

			const response = await fetch(`/api/trainings/${params.id}/round`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify(body),
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao mudar rodada');
			}
			
			await fetchTraining();
			await fetchResponses();
		} catch (err) {
			console.error('Error changing round:', err);
			throw err;
		}
	};

	// Handle delete training
	const handleDeleteTraining = async () => {
		try {
			setActionLoading(true);

			const response = await fetch(`/api/trainings/${params.id}`, {
				method: 'DELETE',
				headers: { 'X-CSRF-Token': csrfToken },
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao deletar treinamento');
			}

			router.push('/dashboard');
		} catch (err) {
			console.error('Error deleting training:', err);
			alert(err.message || 'Erro ao deletar treinamento');
		} finally {
			setActionLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	// Handle participant management
	const handleManageParticipant = async (participantId, action) => {
		try {
			setActionLoading(true);
			console.log('Manage participant:', participantId, action);
			alert(`Participant action "${action}" will be implemented in the API`);
			await fetchTraining();
		} catch (err) {
			console.error('Error managing participant:', err);
			alert('Erro ao gerenciar participante');
		} finally {
			setActionLoading(false);
		}
	};

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
				<ErrorAlert message={error} onRetry={fetchTraining} />
			</DashboardLayout>
		);
	}

	const acceptedParticipants = (training.participants || []).filter(
		p => p.role === 'participant' && p.status === 'accepted'
	).length;

	return (
		<DashboardLayout>
			<div className="space-y-5">
				{/* Header */}
				<TrainingHeader training={training} userRole={userRole} />

				{/* ── COMMAND BAR: Status + Actions + Timers ── */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-5">
					{/* Top row: status + action buttons */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
						<div className="flex items-center gap-3">
							<TrainingStatusBadge status={training.status} size="lg" />
							<span className="text-sm text-slate-500 hidden sm:inline">
								{training.participants?.length || 0} participantes
							</span>
						</div>

						<div className="flex flex-wrap gap-2">
							{training.status === 'not_started' && (
								<button
									onClick={() => handleStatusChange('active')}
									disabled={actionLoading}
									className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 text-sm"
								>
									<FaPlay className="text-xs" />
									Iniciar Treinamento
								</button>
							)}
							{training.status === 'active' && (
								<>
									<button
										onClick={() => handleStatusChange('paused')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 text-sm"
									>
										<FaPause className="text-xs" />
										Pausar
									</button>
									<button
										onClick={() => handleStatusChange('completed')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 text-sm"
									>
										<FaCheckCircle className="text-xs" />
										Finalizar
									</button>
								</>
							)}
							{training.status === 'paused' && (
								<>
									<button
										onClick={() => handleStatusChange('active')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 text-sm"
									>
										<FaPlay className="text-xs" />
										Retomar
									</button>
									<button
										onClick={() => handleStatusChange('completed')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 text-sm"
									>
										<FaCheckCircle className="text-xs" />
										Finalizar
									</button>
								</>
							)}
							{training.status === 'completed' && (
								<button
									onClick={() => handleStatusChange('not_started')}
									disabled={actionLoading}
									className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50 text-sm"
								>
									<FaUndoAlt className="text-xs" />
									Resetar
								</button>
							)}
							<button
								onClick={() => window.open(`/ranking/${params.id}`, '_blank')}
								className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 font-semibold rounded-xl hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-300 transition-all text-sm"
							>
								<FaTrophy className="text-xs" />
								Ranking
							</button>
							<ExportPDFButton
								training={training}
								responses={responses}
								summary={responseSummary}
								scenarioData={scenarioData}
								totalParticipants={acceptedParticipants}
							/>						<button
							onClick={() => setShowDeleteConfirm(true)}
							disabled={actionLoading}
							className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 font-semibold rounded-xl hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all disabled:opacity-50 text-sm"
						>
							<FaTrash className="text-xs" />
							Deletar
						</button>						</div>
					</div>

					{/* Bottom row: timers side by side, compact */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<TrainingTimerDisplay training={training} />
						<RoundTimerDisplay
							training={training}
							userRole={userRole}
							onTimerAction={handleTimerAction}
						/>
					</div>
				</div>

				{/* ── MAIN WORKSPACE: 2-column on lg ── */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

					{/* LEFT: Primary workspace (2/3 width) */}
					<div className="lg:col-span-2 space-y-5">
						{/* Round Control */}
						{scenarioData?.rounds && (
							<RoundControl
								training={training}
								rounds={scenarioData.rounds}
								onRoundChange={handleRoundChange}
								disabled={actionLoading || training.status === 'completed'}
							/>
						)}

						{/* Round Info */}
						{scenarioData?.rounds && scenarioData.rounds[training.current_round] && (
							<RoundInfo
								round={scenarioData.rounds[training.current_round]}
								roundIndex={training.current_round}
								totalRounds={scenarioData.rounds.length}
							/>
						)}

						{/* Metrics Display */}
						{scenarioData?.rounds && (
							<MetricsDisplay
								rounds={scenarioData.rounds.slice(0, training.current_round + 1)}
								currentRound={training.current_round}
							/>
						)}

						{/* Questions & Responses (facilitator's main monitoring area) */}
						{scenarioData?.rounds && (
							<FacilitatorQuestionsView
								rounds={scenarioData.rounds}
								currentRound={training.current_round}
								responses={responses}
								totalParticipants={acceptedParticipants}
								summary={responseSummary}
							/>
						)}
					</div>

					{/* RIGHT: Sidebar tools (1/3 width) */}
					<div className="space-y-5">
						{/* Participant Management Tools - collapsible on mobile */}
						<div className="lg:hidden">
							<button
								onClick={() => setShowTools(prev => !prev)}
								className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
							>
								Ferramentas de Gerenciamento
								{showTools ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
							</button>
						</div>

						<div className={`space-y-5 ${showTools ? 'block' : 'hidden'} lg:block`}>
							<AccessCodeCard
								accessCode={training.access_code}
								accessType={training.access_type}
							/>

							<InviteParticipantCard
								trainingId={params.id}
								onInviteSent={handleInviteSent}
							/>

							<ParticipantsList
								participants={training.participants}
								userRole={userRole}
								showManagement={true}
								onManageParticipant={handleManageParticipant}
							/>

							<ScenarioInfo scenario={training.scenario} />
						</div>
					</div>
				</div>

				{/* ── FULL-WIDTH: Statistics Dashboard ── */}
				{scenarioData?.rounds && (
					<TrainingStatsDashboard
						training={training}
						responses={responses}
						summary={responseSummary}
						scenarioData={scenarioData}
						totalParticipants={acceptedParticipants}
					/>
				)}

				{/* ── EVALUATION STATS (completed) ── */}
				{training.status === 'completed' && evaluationStats && (
					<EvaluationStats
						evaluations={evaluations}
						stats={evaluationStats}
						totalParticipants={acceptedParticipants}
					/>
				)}
			</div>

		{/* Delete Confirmation Modal */}
		{showDeleteConfirm && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
					<h3 className="text-lg font-bold text-slate-800 mb-2">Deletar Treinamento</h3>
					<p className="text-sm text-slate-600 mb-6">
						Tem certeza que deseja deletar este treinamento? Todas as respostas e avaliações associadas serão removidas permanentemente. Esta ação não pode ser desfeita.
					</p>
					<div className="flex justify-end gap-3">
						<button
							onClick={() => setShowDeleteConfirm(false)}
							disabled={actionLoading}
							className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
						>
							Cancelar
						</button>
						<button
							onClick={handleDeleteTraining}
							disabled={actionLoading}
							className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
						>
							{actionLoading ? 'Deletando...' : 'Deletar'}
						</button>
					</div>
				</div>
			</div>
		)}
		</DashboardLayout>
	);
}
