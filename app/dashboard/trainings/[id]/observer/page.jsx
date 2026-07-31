'use client';

import useTraining, { PHASE } from '@/utils/useTraining';
import TrainingShell, { Section, NewRoundNotice } from '@/components/Trainings/TrainingShell';
import ResponseMeter from '@/components/Trainings/ResponseMeter';
import RoundNavigator from '@/components/Trainings/RoundNavigator';
import RoundInfo from '@/components/Trainings/RoundInfo';
import MetricsDisplay from '@/components/Trainings/MetricsDisplay';
import BaseScenarioDisplay from '@/components/Trainings/BaseScenarioDisplay';
import FacilitatorQuestionsView from '@/components/Trainings/FacilitatorQuestionsView';
import TrainingStatsDashboard from '@/components/Trainings/TrainingStatsDashboard';
import ParticipantsList from '@/components/Trainings/ParticipantsList';
import EvaluationStats from '@/components/Trainings/EvaluationStats';

/**
 * Observer view.
 *
 * An observer evaluates how the team works, so they get the same read access as
 * the facilitator — every answer, the answer key, and the live statistics — and
 * none of the controls. Previously this page showed exactly what a participant
 * saw minus the ability to answer, which left the role with nothing to observe.
 */
export default function ObserverPage() {
	const {
		training, scenario, userRole, phase, rounds, currentRound,
		responses, responseSummary, evaluations, evaluationStats,
		loading, error, isConnected,
		viewingRound, setViewingRound,
		pendingRound, goToPendingRound, dismissPendingRound,
		refetch,
	} = useTraining({
		expectRole: 'observer',
		withResponses: true,
		withEvaluations: true,
	});

	const acceptedParticipants = (training?.participants || []).filter(
		p => p.role === 'participant' && p.status === 'accepted'
	).length;

	const viewingRoundData = rounds[viewingRound] || null;
	const roundQuestions = rounds[currentRound]?.questions || [];

	const consoleExtra = phase === PHASE.LIVE ? (
		<ResponseMeter
			questions={roundQuestions}
			roundIndex={currentRound}
			responses={responses}
			totalParticipants={acceptedParticipants}
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
			{phase === PHASE.SETUP && (
				<Section
					title="Preparação"
					hint="O facilitador ainda não iniciou. Você acompanha a partir daqui quando começar."
				>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						{scenario && <BaseScenarioDisplay scenario={scenario} />}
						<ParticipantsList participants={training.participants} userRole={userRole} />
					</div>
				</Section>
			)}

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
						<div className="lg:col-span-2 space-y-6">
							<Section
								title="O que a equipe está respondendo"
								hint="Respostas, gabarito e justificativas — atualiza em tempo real."
							>
								{rounds.length > 0 && (
									<FacilitatorQuestionsView
										rounds={rounds}
										currentRound={Math.max(viewingRound, currentRound)}
										responses={responses}
										totalParticipants={acceptedParticipants}
										summary={responseSummary}
									/>
								)}
							</Section>

							<Section title="Evidências apresentadas">
								{rounds.length > 0 && (
									<MetricsDisplay
										rounds={rounds.slice(0, viewingRound + 1)}
										currentRound={viewingRound}
									/>
								)}
							</Section>
						</div>

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

							<Section title="Cenário">
								{scenario && <BaseScenarioDisplay scenario={scenario} />}
							</Section>
						</div>
					</div>

					<Section title="Equipe">
						<ParticipantsList participants={training.participants} userRole={userRole} />
					</Section>

					<Section
						title="Desempenho"
						hint="Use para embasar o feedback ao final do exercício."
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

					{phase === PHASE.REVIEW && evaluationStats && (
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
		</TrainingShell>
	);
}
