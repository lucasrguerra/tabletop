'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useTraining, { PHASE } from '@/utils/useTraining';
import TrainingShell, { Section } from '@/components/Trainings/TrainingShell';
import ResponseMeter from '@/components/Trainings/ResponseMeter';
import ParticipantsList from '@/components/Trainings/ParticipantsList';
import ScenarioInfo from '@/components/Trainings/ScenarioInfo';
import AccessCodeCard from '@/components/Trainings/AccessCodeCard';
import InviteParticipantCard from '@/components/Trainings/InviteParticipantCard';
import RoundControl from '@/components/Trainings/RoundControl';
import RoundInfo from '@/components/Trainings/RoundInfo';
import MetricsDisplay from '@/components/Trainings/MetricsDisplay';
import TrainingStatsDashboard from '@/components/Trainings/TrainingStatsDashboard';
import FacilitatorQuestionsView from '@/components/Trainings/FacilitatorQuestionsView';
import EvaluationStats from '@/components/Trainings/EvaluationStats';
import ExportPDFButton from '@/components/Trainings/ExportPDFButton';
import {
	FaPlay, FaPause, FaCheckCircle, FaUndoAlt, FaTrophy, FaTrash,
	FaClock, FaRedo,
} from 'react-icons/fa';

/** Control in the console strip. */
function ConsoleButton({ onClick, disabled, icon: Icon, children, tone = 'neutral' }) {
	const tones = {
		go:      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 focus-visible:ring-emerald-400 dark:focus-visible:ring-emerald-800',
		hold:    'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-800',
		end:     'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800',
		neutral: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600',
	};
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tones[tone]}`}
		>
			<Icon className="text-xs" />
			{children}
		</button>
	);
}

export default function FacilitatorPage() {
	const router = useRouter();
	const {
		trainingId, training, scenario, userRole, phase, rounds, currentRound,
		responses, responseSummary, evaluations, evaluationStats,
		csrfToken, loading, error, isConnected,
		refetch, refetchResponses,
	} = useTraining({
		expectRole: 'facilitator',
		withResponses: true,
		withEvaluations: true,
	});

	const [actionLoading, setActionLoading] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const patch = useCallback(async (path, body, method = 'PATCH') => {
		const res = await fetch(`/api/trainings/${trainingId}${path}`, {
			method,
			headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
			body: body ? JSON.stringify(body) : undefined,
			credentials: 'include',
		});
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.message || 'Não foi possível concluir a ação');
		}
		return res;
	}, [trainingId, csrfToken]);

	const handleStatusChange = async (status) => {
		try {
			setActionLoading(true);
			await patch('/status', { status });
			await refetch();
		} catch (err) {
			alert(err.message);
		} finally {
			setActionLoading(false);
		}
	};

	const handleTimerAction = async (action) => {
		try {
			setActionLoading(true);
			await patch('/timer', { action });
			await refetch();
		} catch (err) {
			alert(err.message);
		} finally {
			setActionLoading(false);
		}
	};

	const handleRoundChange = async (action, roundNumber = null) => {
		const body = { action };
		if (action === 'set' && roundNumber !== null) { body.round = roundNumber; }
		await patch('/round', body);
		await refetch();
		await refetchResponses();
	};

	const handleDeleteTraining = async () => {
		try {
			setActionLoading(true);
			await patch('', null, 'DELETE');
			router.push('/dashboard');
		} catch (err) {
			alert(err.message);
		} finally {
			setActionLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	const acceptedParticipants = (training?.participants || []).filter(
		p => p.role === 'participant' && p.status === 'accepted'
	).length;

	const roundQuestions = rounds[currentRound]?.questions || [];

	// ── Console controls: only what this phase can actually do ────────────────
	const controls = (
		<div className="flex flex-wrap items-center gap-2">
			{training?.status === 'not_started' && (
				<ConsoleButton onClick={() => handleStatusChange('active')} disabled={actionLoading} icon={FaPlay} tone="go">
					Iniciar treinamento
				</ConsoleButton>
			)}
			{training?.status === 'active' && (
				<>
					<ConsoleButton onClick={() => handleStatusChange('paused')} disabled={actionLoading} icon={FaPause} tone="hold">
						Pausar
					</ConsoleButton>
					<ConsoleButton onClick={() => handleStatusChange('completed')} disabled={actionLoading} icon={FaCheckCircle} tone="end">
						Encerrar
					</ConsoleButton>
				</>
			)}
			{training?.status === 'paused' && (
				<>
					<ConsoleButton onClick={() => handleStatusChange('active')} disabled={actionLoading} icon={FaPlay} tone="go">
						Retomar
					</ConsoleButton>
					<ConsoleButton onClick={() => handleStatusChange('completed')} disabled={actionLoading} icon={FaCheckCircle} tone="end">
						Encerrar
					</ConsoleButton>
				</>
			)}

			{phase === PHASE.LIVE && (
				<>
					<span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />
					<ConsoleButton onClick={() => handleTimerAction('reset')} disabled={actionLoading} icon={FaRedo}>
						Zerar tempo da rodada
					</ConsoleButton>
					<ConsoleButton
						onClick={() => handleTimerAction(training?.round_timer?.is_paused === false ? 'pause' : 'start')}
						disabled={actionLoading}
						icon={FaClock}
					>
						{training?.round_timer?.is_paused === false ? 'Pausar tempo' : 'Contar tempo'}
					</ConsoleButton>
				</>
			)}
		</div>
	);

	const consoleExtra = (
		<div className="space-y-4">
			{controls}
			{phase === PHASE.LIVE && (
				<ResponseMeter
					questions={roundQuestions}
					roundIndex={currentRound}
					responses={responses}
					totalParticipants={acceptedParticipants}
				/>
			)}
		</div>
	);

	// TrainingShell renders loading/error states, but JSX children are built by
	// this component before it can decide — so bail out before touching
	// `training`, which is null until the first fetch resolves.
	if (loading || error || !training) {
		return (
			<TrainingShell
				loading={loading}
				error={error}
				onRetry={() => refetch(true)}
			/>
		);
	}

	return (
		<TrainingShell
			loading={loading}
			error={error}
			onRetry={() => refetch(true)}
			training={training}
			userRole={userRole}
			rounds={rounds}
			isConnected={isConnected}
			consoleExtra={consoleExtra}
		>
			{/* ══ SETUP ══ Everything here is about getting people into the room. */}
			{phase === PHASE.SETUP && (
				<Section
					title="Preparação"
					hint="Convide a equipe. O treinamento começa quando você iniciar."
				>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
						<AccessCodeCard
							accessCode={training.access_code}
							accessType={training.access_type}
						/>
						<InviteParticipantCard trainingId={trainingId} onInviteSent={refetch} />
						<ScenarioInfo scenario={training.scenario} />
					</div>
					<ParticipantsList participants={training.participants} userRole={userRole} showManagement={true} />
				</Section>
			)}

			{/* ══ LIVE ══ Round control and monitoring, nothing else. */}
			{phase === PHASE.LIVE && (
				<>
					<Section title="Controle da rodada">
						{rounds.length > 0 && (
							<RoundControl
								training={training}
								rounds={rounds}
								onRoundChange={handleRoundChange}
								disabled={actionLoading}
							/>
						)}
					</Section>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
						<div className="lg:col-span-2 space-y-6">
							<Section title="Respostas da equipe" hint="Atualiza sozinho conforme a equipe responde.">
								{rounds.length > 0 && (
									<FacilitatorQuestionsView
										rounds={rounds}
										currentRound={currentRound}
										responses={responses}
										totalParticipants={acceptedParticipants}
										summary={responseSummary}
									/>
								)}
							</Section>
						</div>

						<div className="space-y-6">
							<Section title="Rodada atual">
								{rounds[currentRound] && (
									<RoundInfo
										round={rounds[currentRound]}
										roundIndex={currentRound}
										totalRounds={rounds.length}
									/>
								)}
							</Section>
						</div>
					</div>

					<Section title="Evidências apresentadas">
						{rounds.length > 0 && (
							<MetricsDisplay rounds={rounds.slice(0, currentRound + 1)} currentRound={currentRound} />
						)}
					</Section>

					<Section title="Equipe">
						<ParticipantsList participants={training.participants} userRole={userRole} showManagement={true} />
					</Section>
				</>
			)}

			{/* ══ REVIEW ══ Analysis and export. */}
			{phase === PHASE.REVIEW && (
				<>
					<Section
						title="Resultados"
						action={
							<div className="flex flex-wrap gap-2">
								<button
									onClick={() => window.open(`/ranking/${trainingId}`, '_blank')}
									className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
								>
									<FaTrophy className="text-xs text-amber-500 dark:text-amber-400" />
									Abrir ranking
								</button>
								<ExportPDFButton
									training={training}
									responses={responses}
									summary={responseSummary}
									scenarioData={scenario}
									totalParticipants={acceptedParticipants}
								/>
							</div>
						}
					>
						{rounds.length > 0 && (
							<TrainingStatsDashboard
								training={training}
								responses={responses}
								summary={responseSummary}
								scenarioData={scenario}
								totalParticipants={acceptedParticipants}
							/>
						)}
					</Section>

					<Section title="Respostas por questão">
						{rounds.length > 0 && (
							<FacilitatorQuestionsView
								rounds={rounds}
								currentRound={rounds.length - 1}
								responses={responses}
								totalParticipants={acceptedParticipants}
								summary={responseSummary}
							/>
						)}
					</Section>

					{evaluationStats && (
						<Section title="Avaliação da equipe">
							<EvaluationStats
								evaluations={evaluations}
								stats={evaluationStats}
								totalParticipants={acceptedParticipants}
							/>
						</Section>
					)}
				</>
			)}

			{/* ══ Destructive action: plainly visible, but at the end of the page
			     rather than beside Pausar/Encerrar in the live controls. ══ */}
			<Section className="pt-6 border-t border-slate-200 dark:border-slate-700">
				<div className="flex flex-wrap gap-3">
					{phase === PHASE.REVIEW && (
						<button
							onClick={() => handleStatusChange('not_started')}
							disabled={actionLoading}
							className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600 focus-visible:ring-offset-2"
						>
							<FaUndoAlt className="text-sm" />
							Reabrir para nova execução
						</button>
					)}
					<button
						onClick={() => setShowDeleteConfirm(true)}
						disabled={actionLoading}
						className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:focus-visible:ring-red-800 focus-visible:ring-offset-2"
					>
						<FaTrash className="text-sm" />
						Deletar treinamento
					</button>
				</div>
			</Section>

			{showDeleteConfirm && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="delete-title"
				>
					<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-md w-full">
						<h3 id="delete-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
							Deletar {training.name}?
						</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
							Todas as respostas e avaliações deste treinamento são removidas junto.
							Não há como desfazer.
						</p>
						<div className="flex justify-end gap-3">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={actionLoading}
								className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								onClick={handleDeleteTraining}
								disabled={actionLoading}
								className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
							>
								{actionLoading ? 'Deletando…' : 'Deletar'}
							</button>
						</div>
					</div>
				</div>
			)}
		</TrainingShell>
	);
}
