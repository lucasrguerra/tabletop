"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import TrainingHeader from '@/components/Scenario/TrainingHeader';
import TrainingTimer from '@/components/Scenario/TrainingTimer';
import TrainingTabs from '@/components/Scenario/TrainingTabs';

export default function TrainingSessionPage() {
	const params = useParams();
	const router = useRouter();
	const training_id = params.id;

	const [training, setTraining] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFacilitator, setIsFacilitator] = useState(false);
	const [userRole, setUserRole] = useState('');

	// Timer state
	const [currentTime, setCurrentTime] = useState(0);
	const [isTimerRunning, setIsTimerRunning] = useState(false);

	// Tab state
	const [activeTab, setActiveTab] = useState('rounds');

	// Fetch training data
	const fetchTraining = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/trainings/${training_id}`);
			const data = await response.json();

			if (!data.success) {
				if (response.status === 403) {
					setError('Você não tem permissão para acessar este treinamento.');
				} else if (response.status === 404) {
					setError('Treinamento não encontrado.');
				} else {
					setError(data.message || 'Erro ao carregar treinamento.');
				}
				return;
			}

			setTraining(data.training);
			setIsFacilitator(data.is_facilitator);
			setUserRole(data.user_role);

			// Initialize timer state
			if (data.training.timer) {
				setIsTimerRunning(!data.training.timer.is_paused);
				if (!data.training.timer.is_paused && data.training.timer.start_time) {
					const elapsed = data.training.timer.elapsed_time || 0;
					const startTime = new Date(data.training.timer.start_time).getTime();
					const now = Date.now();
					const currentElapsed = now - startTime;
					setCurrentTime(elapsed + currentElapsed);
				} else {
					setCurrentTime(data.training.timer.elapsed_time || 0);
				}
			}
		} catch (err) {
			console.error('Error fetching training:', err);
			setError('Erro ao carregar os dados do treinamento.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (training_id) {
			fetchTraining();
		}
	}, [training_id]);

	// Handler for when facilitator is added
	const handleFacilitatorAdded = (facilitator) => {
		// Reload training data to reflect the new facilitator
		fetchTraining();
	};

	// Timer update effect
	useEffect(() => {
		let interval;
		
		if (isTimerRunning && training?.timer) {
			interval = setInterval(() => {
				if (training.timer.start_time) {
					const elapsed = training.timer.elapsed_time || 0;
					const startTime = new Date(training.timer.start_time).getTime();
					const now = Date.now();
					const currentElapsed = now - startTime;
					setCurrentTime(elapsed + currentElapsed);
				}
			}, 100);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isTimerRunning, training?.timer]);

	// Format time helper
	const formatTime = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	};

	// Status badge helper
	const getStatusBadge = (status) => {
		const styles = {
			scheduled: 'bg-blue-100 text-blue-800',
			active: 'bg-green-100 text-green-800',
			paused: 'bg-yellow-100 text-yellow-800',
			completed: 'bg-gray-100 text-gray-800',
			cancelled: 'bg-red-100 text-red-800'
		};

		const labels = {
			scheduled: 'Agendado',
			active: 'Ativo',
			paused: 'Pausado',
			completed: 'Concluído',
			cancelled: 'Cancelado'
		};

		return (
			<span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
				{labels[status]}
			</span>
		);
	};

	// Role badge helper
	const getRoleBadge = (role) => {
		const styles = {
			facilitator: 'bg-purple-100 text-purple-800',
			participant: 'bg-blue-100 text-blue-800',
			observer: 'bg-gray-100 text-gray-800'
		};

		const labels = {
			facilitator: 'Facilitador',
			participant: 'Participante',
			observer: 'Observador'
		};

		return (
			<span className={`px-2 py-1 rounded text-xs font-medium ${styles[role]}`}>
				{labels[role]}
			</span>
		);
	};

	// If not facilitator, show error
	if (!loading && !error && !isFacilitator) {
		return (
			<DashboardLayout>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
						<div className="flex">
							<div className="shrink-0">
								<svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-yellow-800">
									Acesso Restrito
								</h3>
								<p className="mt-2 text-sm text-yellow-700">
									Esta é a página de gestão do treinamento. Você está participando como <strong>{userRole === 'participant' ? 'Participante' : 'Observador'}</strong> e não tem permissão para acessar esta página.
								</p>
								<p className="mt-2">
									<button
										onClick={() => router.push('/dashboard')}
										className="text-sm font-medium text-yellow-800 hover:text-yellow-600"
									>
										← Voltar ao Dashboard
									</button>
								</p>
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
					</div>
				) : error ? (
					<div className="bg-red-50 border-l-4 border-red-400 p-4">
						<div className="flex">
							<div className="shrink-0">
								<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">{error}</p>
								<p className="mt-2">
									<button
										onClick={() => router.push('/dashboard')}
										className="text-sm font-medium text-red-700 hover:text-red-600"
									>
										← Voltar ao Dashboard
									</button>
								</p>
							</div>
						</div>
					</div>
				) : training ? (
					<div className="space-y-6">
						{/* Header */}
						<TrainingHeader 
							training={training}
							userRole={userRole}
							getStatusBadge={getStatusBadge}
							getRoleBadge={getRoleBadge}
							onFacilitatorAdded={handleFacilitatorAdded}
						/>

						{/* Timer Control */}
						<TrainingTimer 
							currentTime={currentTime}
							formatTime={formatTime}
						/>

						{/* Tabs Navigation */}
						<TrainingTabs 
							training={training}
							currentTime={currentTime}
							formatTime={formatTime}
							getRoleBadge={getRoleBadge}
							activeTab={activeTab}
							setActiveTab={setActiveTab}
						/>

						{/* Actions */}
						<div className="flex justify-between">
							<button
								onClick={() => router.push('/dashboard')}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
							>
								← Voltar ao Dashboard
							</button>
							<button
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
								disabled
							>
								Encerrar Treinamento
							</button>
						</div>
					</div>
				) : null}
			</div>
		</DashboardLayout>
	);
}
