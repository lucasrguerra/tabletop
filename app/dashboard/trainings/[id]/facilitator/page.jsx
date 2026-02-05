'use client';

import { useEffect, useState } from 'react';
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
import { FaPlay, FaPause, FaCheckCircle, FaUndoAlt } from 'react-icons/fa';

export default function FacilitatorPage() {
	const router = useRouter();
	const params = useParams();
	const [training, setTraining] = useState(null);
	const [scenarioData, setScenarioData] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [actionLoading, setActionLoading] = useState(false);

	// Fetch training data
	const fetchTraining = async () => {
		try {
			setLoading(true);
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

			// Fetch scenario data with rounds
			if (data.training.scenario) {
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
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTraining();
	}, [params.id]);

	// Handle invite sent
	const handleInviteSent = () => {
		// Refresh training data to show new pending participant
		fetchTraining();
	};

	// Handle timer actions (for round timer)
	const handleTimerAction = async (action) => {
		try {
			setActionLoading(true);
			
			const response = await fetch(`/api/trainings/${params.id}/timer`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action }),
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao controlar timer');
			}
			
			// Refresh training data after action
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao mudar status');
			}
			
			// Refresh training data after action
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao mudar rodada');
			}
			
			// Refresh training data after action
			await fetchTraining();
		} catch (err) {
			console.error('Error changing round:', err);
			throw err;
		}
	};

	// Handle participant management
	const handleManageParticipant = async (participantId, action) => {
		try {
			setActionLoading(true);
			
			// TODO: Implement participant management API endpoint
			// const response = await fetch(`/api/trainings/${params.id}/participants/${participantId}`, {
			//   method: 'PATCH',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ action }),
			//   credentials: 'include'
			// });
			
			console.log('Manage participant:', participantId, action);
			alert(`Participant action "${action}" will be implemented in the API`);
			
			// Refresh training data after action
			await fetchTraining();
		} catch (err) {
			console.error('Error managing participant:', err);
			alert('Erro ao gerenciar participante');
		} finally {
			setActionLoading(false);
		}
	};

	// Show loading state
	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<LoadingSpinner />
				</div>
			</DashboardLayout>
		);
	}

	// Show error state
	if (error) {
		return (
			<DashboardLayout>
				<ErrorAlert message={error} onRetry={fetchTraining} />
			</DashboardLayout>
		);
	}

	// Show content
	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<TrainingHeader training={training} userRole={userRole} />

				{/* Status Management Card */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">
								Status do Treinamento
							</h3>
							<TrainingStatusBadge status={training.status} size="lg" />
						</div>

						<div className="flex flex-wrap gap-3">
							{training.status === 'not_started' && (
								<button
									onClick={() => handleStatusChange('active')}
									disabled={actionLoading}
									className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
								>
									<FaPlay className="text-sm" />
									Iniciar Treinamento
								</button>
							)}

							{training.status === 'active' && (
								<>
									<button
										onClick={() => handleStatusChange('paused')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
									>
										<FaPause className="text-sm" />
										Pausar
									</button>
									<button
										onClick={() => handleStatusChange('completed')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
									>
										<FaCheckCircle className="text-sm" />
										Finalizar
									</button>
								</>
							)}

							{training.status === 'paused' && (
								<>
									<button
										onClick={() => handleStatusChange('active')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
									>
										<FaPlay className="text-sm" />
										Retomar
									</button>
									<button
										onClick={() => handleStatusChange('completed')}
										disabled={actionLoading}
										className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
									>
										<FaCheckCircle className="text-sm" />
										Finalizar
									</button>
								</>
							)}

							{training.status === 'completed' && (
								<button
									onClick={() => handleStatusChange('not_started')}
									disabled={actionLoading}
									className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50"
								>
									<FaUndoAlt className="text-sm" />
									Resetar Treinamento
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column */}
					<div className="space-y-6">
						<TrainingTimerDisplay 
							training={training}
						/>
						<RoundTimerDisplay 
							training={training} 
							userRole={userRole} 
							onTimerAction={handleTimerAction}
						/>
						<AccessCodeCard 
							accessCode={training.access_code} 
							accessType={training.access_type}
						/>
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						{scenarioData?.rounds && (
							<RoundControl
								training={training}
								rounds={scenarioData.rounds}
								onRoundChange={handleRoundChange}
								disabled={actionLoading || training.status === 'completed'}
							/>
						)}
						<ScenarioInfo scenario={training.scenario} />
						<InviteParticipantCard 
							trainingId={params.id}
							onInviteSent={handleInviteSent}
						/>
					</div>
				</div>

				{/* Participants Section */}
				<ParticipantsList 
					participants={training.participants} 
					userRole={userRole}
					showManagement={true}
					onManageParticipant={handleManageParticipant}
				/>
			</div>
		</DashboardLayout>
	);
}
