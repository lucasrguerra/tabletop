'use client';

import { useState } from 'react';
import useTraining, { PHASE } from '@/utils/useTraining';
import TrainingShell, { Section, NewRoundNotice } from '@/components/Trainings/TrainingShell';
import MyRoundProgress from '@/components/Trainings/MyRoundProgress';
import RoundNavigator from '@/components/Trainings/RoundNavigator';
import RoundInfo from '@/components/Trainings/RoundInfo';
import RoundQuestions from '@/components/Trainings/RoundQuestions';
import MetricsDisplay from '@/components/Trainings/MetricsDisplay';
import BaseScenarioDisplay from '@/components/Trainings/BaseScenarioDisplay';
import ParticipantsList from '@/components/Trainings/ParticipantsList';
import ParticipantResultsDashboard from '@/components/Trainings/ParticipantResultsDashboard';
import EvaluationForm from '@/components/Trainings/EvaluationForm';

export default function ParticipantPage() {
	const {
		trainingId, training, scenario, userRole, phase, rounds, currentRound,
		responses, setResponses, results, evaluation, setEvaluation,
		csrfToken, loading, error, isConnected,
		viewingRound, setViewingRound,
		pendingRound, goToPendingRound, dismissPendingRound,
		refetch,
	} = useTraining({
		expectRole: 'participant',
		withResponses: true,
		withResults: true,
		withEvaluations: true,
	});

	const [submitting, setSubmitting] = useState(false);

	const handleSubmitAnswer = async (roundIndex, questionId, answer) => {
		setSubmitting(true);
		try {
			const res = await fetch(`/api/trainings/${trainingId}/responses`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify({ round_id: roundIndex, question_id: questionId, answer }),
			});

			const data = await res.json();
			if (!res.ok || !data.success) {
				throw new Error(data.message || 'Não foi possível enviar sua resposta');
			}

			setResponses(prev => [...prev, data.response]);
			return data.response;
		} finally {
			setSubmitting(false);
		}
	};

	const viewingRoundData = rounds[viewingRound] || null;
	const viewingQuestions = viewingRoundData?.questions || [];
	const isContextRound = viewingRound === 0;

	const consoleExtra = phase === PHASE.LIVE ? (
		<MyRoundProgress
			questions={viewingQuestions}
			roundIndex={viewingRound}
			responses={responses}
		/>
	) : null;

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
			{/* ══ SETUP ══ A lobby, not a dashboard of empty widgets. */}
			{phase === PHASE.SETUP && (
				<Section
					title="Aguardando início"
					hint="O facilitador ainda não abriu o exercício. Leia o cenário enquanto espera."
				>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
						<div className="lg:col-span-2">
							{scenario && <BaseScenarioDisplay scenario={scenario} />}
						</div>
						<ParticipantsList participants={training.participants} userRole={userRole} />
					</div>
				</Section>
			)}

			{/* ══ REVIEW ══ Results first — that is what people came back for. */}
			{phase === PHASE.REVIEW && (
				<>
					{results && (
						<Section title="Seu desempenho">
							<ParticipantResultsDashboard results={results} rounds={rounds} />
						</Section>
					)}
					{evaluation !== undefined && (
						<Section title="Avalie o exercício" hint="Leva menos de um minuto e ajuda a melhorar os próximos.">
							<EvaluationForm
								trainingId={trainingId}
								existingEvaluation={evaluation}
								onSubmitted={setEvaluation}
							/>
						</Section>
					)}
				</>
			)}

			{/* ══ LIVE + REVIEW ══ The scenario material. */}
			{phase !== PHASE.SETUP && (
				<>
					<NewRoundNotice
						round={pendingRound}
						onGo={goToPendingRound}
						onDismiss={dismissPendingRound}
					/>

					{rounds.length > 1 && (
						<RoundNavigator
							rounds={rounds}
							currentRound={currentRound}
							viewingRound={viewingRound}
							onRoundSelect={setViewingRound}
						/>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
						{/* Primary task column */}
						<div className="lg:col-span-2 space-y-6">
							<Section title="Evidências">
								{rounds.length > 0 && (
									<MetricsDisplay
										rounds={rounds.slice(0, viewingRound + 1)}
										currentRound={viewingRound}
									/>
								)}
							</Section>

							{isContextRound ? (
								<Section
									title="Contextualização"
									hint="Esta rodada não tem questões. Leia o cenário e alinhe com a equipe."
								>
									{scenario && <BaseScenarioDisplay scenario={scenario} />}
								</Section>
							) : viewingQuestions.length > 0 ? (
								<Section title={`Questões da rodada ${viewingRound + 1}`}>
									<RoundQuestions
										questions={viewingQuestions}
										roundIndex={viewingRound}
										roundTitle={viewingRoundData.title}
										onSubmitAnswer={handleSubmitAnswer}
										responses={responses.filter(r => r.round_id === viewingRound)}
										submitting={submitting}
										canAnswer={training.status === 'active'}
									/>
								</Section>
							) : (
								<Section title={`Rodada ${viewingRound + 1}`}>
									<div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
										<p className="text-slate-500 dark:text-slate-400">Esta rodada não tem questões.</p>
									</div>
								</Section>
							)}
						</div>

						{/* Supporting column — the scenario keeps the same slot in every
						    round, so the page no longer reflows when a round opens. */}
						<div className="space-y-6">
							<Section title="Rodada">
								{viewingRoundData && (
									<RoundInfo
										round={viewingRoundData}
										roundIndex={viewingRound}
										totalRounds={rounds.length}
									/>
								)}
							</Section>

							{!isContextRound && scenario && (
								<Section title="Cenário">
									<BaseScenarioDisplay scenario={scenario} />
								</Section>
							)}
						</div>
					</div>

					<Section title="Equipe">
						<ParticipantsList participants={training.participants} userRole={userRole} />
					</Section>
				</>
			)}
		</TrainingShell>
	);
}
