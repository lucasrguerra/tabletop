'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import TrainingHeader from '@/components/Trainings/TrainingHeader';
import TimerDisplay from '@/components/Trainings/TimerDisplay';
import ParticipantsList from '@/components/Trainings/ParticipantsList';
import ScenarioInfo from '@/components/Trainings/ScenarioInfo';
import TrainingStatusBadge from '@/components/Trainings/TrainingStatusBadge';
import LoadingSpinner from '@/components/Trainings/LoadingSpinner';
import ErrorAlert from '@/components/Trainings/ErrorAlert';
import { FaClipboardList, FaLightbulb, FaComments } from 'react-icons/fa';

export default function ParticipantPage() {
	const router = useRouter();
	const params = useParams();
	const [training, setTraining] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

			// Validate that user is actually a participant
			if (data.userRole !== 'participant') {
				router.replace(`/dashboard/trainings/${params.id}/${data.userRole}`);
				return;
			}

			setTraining(data.training);
			setUserRole(data.userRole);
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

				{/* Status Card */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold text-slate-900 mb-2">
								Status do Treinamento
							</h3>
							<TrainingStatusBadge status={training.status} size="lg" />
						</div>
						
						{training.status === 'not_started' && (
							<div className="text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
								Aguardando início do facilitador
							</div>
						)}
						
						{training.status === 'active' && (
							<div className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 font-medium">
								Treinamento em andamento!
							</div>
						)}
						
						{training.status === 'paused' && (
							<div className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100 font-medium">
								Aguardando retomada
							</div>
						)}
						
						{training.status === 'completed' && (
							<div className="text-sm text-blue-700 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 font-medium">
								Treinamento finalizado
							</div>
						)}
					</div>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column */}
					<div className="space-y-6">
						<TimerDisplay 
							training={training} 
							userRole={userRole}
						/>
						<ScenarioInfo scenario={training.scenario} />
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						{/* Exercise Interaction Area */}
						<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2.5 bg-blue-100 rounded-xl">
									<FaClipboardList className="text-xl text-blue-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-slate-900">
										Área de Trabalho
									</h3>
									<p className="text-xs text-slate-500">
										Colabore no exercício
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{/* Placeholder for future exercise interaction */}
							<div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200 text-center">
									<FaLightbulb className="text-3xl text-blue-400 mx-auto mb-3" />
									<p className="text-sm text-slate-600 font-medium mb-2">
										Área de Interação do Exercício
									</p>
									<p className="text-xs text-slate-500">
										Esta área será implementada para permitir colaboração durante o treinamento
									</p>
								</div>

								{/* Quick Actions */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<button className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all text-left">
										<div className="p-2 bg-blue-100 rounded-lg">
											<FaComments className="text-blue-600" />
										</div>
										<div>
											<p className="text-sm font-semibold text-slate-900">Discussão</p>
											<p className="text-xs text-slate-500">Ver comentários</p>
										</div>
									</button>

									<button className="flex items-center gap-3 p-4 bg-white hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all text-left">
										<div className="p-2 bg-indigo-100 rounded-lg">
											<FaClipboardList className="text-indigo-600" />
										</div>
										<div>
											<p className="text-sm font-semibold text-slate-900">Anotações</p>
											<p className="text-xs text-slate-500">Suas notas</p>
										</div>
									</button>
								</div>
							</div>
						</div>

						{/* Info Card */}
					<div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
							<h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
								<FaLightbulb className="text-blue-600" />
								Dica para Participantes
							</h4>
							<p className="text-sm text-slate-700">
								Acompanhe o timer e colabore com sua equipe durante o exercício. 
								O facilitador controlará o ritmo do treinamento.
							</p>
						</div>
					</div>
				</div>

				{/* Participants Section */}
				<ParticipantsList 
					participants={training.participants} 
					userRole={userRole}
				/>
			</div>
		</DashboardLayout>
	);
}
