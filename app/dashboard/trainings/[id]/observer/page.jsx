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
import LoadingSpinner from '@/components/Trainings/LoadingSpinner';
import ErrorAlert from '@/components/Trainings/ErrorAlert';
import { FaEye, FaInfoCircle, FaChartBar, FaClipboardList } from 'react-icons/fa';

export default function ObserverPage() {
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

			// Validate that user is actually an observer
			if (data.userRole !== 'observer') {
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

				{/* Observer Notice Banner */}
			<div className="bg-linear-to-r from-slate-50 to-zinc-50 rounded-2xl border-2 border-slate-200 p-6 lg:p-8">
					<div className="flex items-start gap-4">
						<div className="shrink-0 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
							<FaEye className="text-2xl text-slate-600" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-bold text-slate-900 mb-2">
								Modo Observador
							</h3>
							<p className="text-sm text-slate-600 mb-3">
								Você está visualizando este treinamento como observador. 
								Você pode acompanhar o progresso, mas não pode participar ativamente do exercício.
							</p>
							<div className="flex flex-wrap gap-2">
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
									<FaEye className="text-slate-400" />
									Visualização completa
								</span>
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
									<FaChartBar className="text-slate-400" />
									Acompanhamento em tempo real
								</span>
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
									<FaClipboardList className="text-slate-400" />
									Acesso a relatórios
								</span>
							</div>
						</div>
					</div>
				</div>

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
								Aguardando início
							</div>
						)}
						
						{training.status === 'active' && (
							<div className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 font-medium">
								Em andamento
							</div>
						)}
						
						{training.status === 'paused' && (
							<div className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100 font-medium">
								Pausado temporariamente
							</div>
						)}
						
						{training.status === 'completed' && (
							<div className="text-sm text-blue-700 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 font-medium">
								Concluído
							</div>
						)}
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
						/>
						<ScenarioInfo scenario={training.scenario} />
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						{/* Observation Notes Area */}
						<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2.5 bg-slate-100 rounded-xl">
									<FaClipboardList className="text-xl text-slate-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-slate-900">
										Anotações de Observação
									</h3>
									<p className="text-xs text-slate-500">
										Registre suas observações
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{/* Placeholder for future notes/observation features */}
							<div className="p-6 bg-linear-to-br from-slate-50 to-zinc-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
									<FaClipboardList className="text-3xl text-slate-400 mx-auto mb-3" />
									<p className="text-sm text-slate-600 font-medium mb-2">
										Área de Anotações
									</p>
									<p className="text-xs text-slate-500">
										Esta área será implementada para permitir anotações durante a observação
									</p>
								</div>

								{/* Quick Info Metrics */}
								<div className="grid grid-cols-2 gap-3">
									<div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
										<p className="text-xs text-slate-500 mb-1">Participantes Ativos</p>
										<p className="text-2xl font-bold text-slate-900">
											{training.participants_count}
										</p>
									</div>
									<div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
										<p className="text-xs text-slate-500 mb-1">Máximo</p>
										<p className="text-2xl font-bold text-slate-900">
											{training.max_participants}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Observer Guidelines */}
					<div className="bg-linear-to-br from-slate-50 to-zinc-50 rounded-2xl border border-slate-200 p-6">
							<h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
								<FaInfoCircle className="text-slate-600" />
								Diretrizes para Observadores
							</h4>
							<ul className="space-y-2 text-sm text-slate-700">
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
									<span>Mantenha notas organizadas para relatório final</span>
								</li>
							</ul>
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
