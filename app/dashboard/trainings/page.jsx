"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import PendingInvites from '@/components/Dashboard/PendingInvites';
import { FaBook, FaUsers, FaClock, FaCalendar, FaPlay, FaPause, FaCheckCircle, FaBan, FaShieldAlt } from 'react-icons/fa';

export default function TrainingsPage() {
	const router = useRouter();
	const [trainings, setTrainings] = useState([]);
	const [pendingInvites, setPendingInvites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingInvites, setLoadingInvites] = useState(true);
	const [error, setError] = useState(null);
	const [filterRole, setFilterRole] = useState('all');
	const [filterStatus, setFilterStatus] = useState('all');

	// Fetch trainings
	useEffect(() => {
		fetchTrainings();
		fetchPendingInvites();
	}, []);

	const fetchTrainings = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/trainings');
			const data = await response.json();

			if (!data.success) {
				setError(data.message || 'Erro ao carregar treinamentos');
				return;
			}

			setTrainings(data.trainings || []);
		} catch (err) {
			console.error('Error fetching trainings:', err);
			setError('Erro ao buscar treinamentos');
		} finally {
			setLoading(false);
		}
	};

	const fetchPendingInvites = async () => {
		try {
			setLoadingInvites(true);
			const response = await fetch('/api/trainings/invites');
			const data = await response.json();

			if (data.success) {
				setPendingInvites(data.invites || []);
			}
		} catch (error) {
			console.error('Error fetching pending invites:', error);
		} finally {
			setLoadingInvites(false);
		}
	};

	// Callback when invite is accepted/declined
	const handleInviteUpdated = () => {
		fetchPendingInvites();
		fetchTrainings(); // Refresh trainings list as well
	};

	// Get role badge
	const getRoleBadge = (role) => {
		const styles = {
			facilitator: 'bg-purple-100 text-purple-800 border-purple-200',
			participant: 'bg-blue-100 text-blue-800 border-blue-200',
			observer: 'bg-gray-100 text-gray-800 border-gray-200'
		};

		const labels = {
			facilitator: 'Facilitador',
			participant: 'Participante',
			observer: 'Observador'
		};

		const icons = {
			facilitator: '👨‍🏫',
			participant: '👤',
			observer: '👁️'
		};

		return (
			<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[role]}`}>
				<span>{icons[role]}</span>
				<span>{labels[role]}</span>
			</span>
		);
	};

	// Get status badge
	const getStatusBadge = (status) => {
		const styles = {
			scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
			active: 'bg-green-100 text-green-800 border-green-200',
			paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			completed: 'bg-gray-100 text-gray-800 border-gray-200',
			cancelled: 'bg-red-100 text-red-800 border-red-200'
		};

		const labels = {
			scheduled: 'Agendado',
			active: 'Ativo',
			paused: 'Pausado',
			completed: 'Concluído',
			cancelled: 'Cancelado'
		};

		const icons = {
			scheduled: <FaCalendar className="text-xs" />,
			active: <FaPlay className="text-xs" />,
			paused: <FaPause className="text-xs" />,
			completed: <FaCheckCircle className="text-xs" />,
			cancelled: <FaBan className="text-xs" />
		};

		return (
			<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
				{icons[status]}
				<span>{labels[status]}</span>
			</span>
		);
	};

	// Format date
	const formatDate = (date) => {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Format time elapsed
	const formatTime = (milliseconds) => {
		if (!milliseconds) return '00:00:00';
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	};

	// Filter trainings
	const filteredTrainings = trainings.filter(training => {
		if (filterRole !== 'all' && training.user_role !== filterRole) return false;
		if (filterStatus !== 'all' && training.status !== filterStatus) return false;
		return true;
	});

	// Group trainings by role
	const trainingsByRole = {
		facilitator: filteredTrainings.filter(t => t.user_role === 'facilitator'),
		participant: filteredTrainings.filter(t => t.user_role === 'participant'),
		observer: filteredTrainings.filter(t => t.user_role === 'observer')
	};

	return (
		<DashboardLayout>
			<div className="max-w-7xl mx-auto">
				{/* Pending Invites Section */}
				{!loadingInvites && pendingInvites.length > 0 && (
					<div className="mb-6">
						<PendingInvites 
							invites={pendingInvites} 
							onInviteUpdated={handleInviteUpdated}
						/>
					</div>
				)}

				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
								<FaBook className="text-indigo-600" />
								Meus Treinamentos
							</h1>
							<p className="text-sm text-gray-600 mt-1">
								Todos os treinamentos que você participou
							</p>
						</div>
						<button
							onClick={() => router.push('/dashboard/trainings/new')}
							className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
						>
							<FaShieldAlt />
							<span>Novo Treinamento</span>
						</button>
					</div>

					{/* Statistics */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<div className="bg-white border border-gray-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-600 uppercase font-medium">Total</p>
									<p className="text-2xl font-bold text-gray-900">{trainings.length}</p>
								</div>
								<FaBook className="text-3xl text-gray-400" />
							</div>
						</div>
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-purple-600 uppercase font-medium">Facilitador</p>
									<p className="text-2xl font-bold text-purple-900">{trainingsByRole.facilitator.length}</p>
								</div>
								<span className="text-2xl">👨‍🏫</span>
							</div>
						</div>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-blue-600 uppercase font-medium">Participante</p>
									<p className="text-2xl font-bold text-blue-900">{trainingsByRole.participant.length}</p>
								</div>
								<span className="text-2xl">👤</span>
							</div>
						</div>
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-600 uppercase font-medium">Observador</p>
									<p className="text-2xl font-bold text-gray-900">{trainingsByRole.observer.length}</p>
								</div>
								<span className="text-2xl">👁️</span>
							</div>
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-lg p-4">
						<span className="text-sm font-medium text-gray-700">Filtros:</span>
						
						{/* Role Filter */}
						<div className="flex items-center gap-2">
							<label className="text-xs text-gray-600">Papel:</label>
							<select
								value={filterRole}
								onChange={(e) => setFilterRole(e.target.value)}
								className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="all">Todos</option>
								<option value="facilitator">Facilitador</option>
								<option value="participant">Participante</option>
								<option value="observer">Observador</option>
							</select>
						</div>

						{/* Status Filter */}
						<div className="flex items-center gap-2">
							<label className="text-xs text-gray-600">Status:</label>
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="all">Todos</option>
								<option value="scheduled">Agendado</option>
								<option value="active">Ativo</option>
								<option value="paused">Pausado</option>
								<option value="completed">Concluído</option>
								<option value="cancelled">Cancelado</option>
							</select>
						</div>

						{(filterRole !== 'all' || filterStatus !== 'all') && (
							<button
								onClick={() => {
									setFilterRole('all');
									setFilterStatus('all');
								}}
								className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
							>
								Limpar filtros
							</button>
						)}
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
						<div className="flex">
							<div className="shrink-0">
								<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!loading && !error && filteredTrainings.length === 0 && (
					<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
						<FaBook className="mx-auto text-5xl text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{trainings.length === 0 ? 'Nenhum treinamento encontrado' : 'Nenhum resultado'}
						</h3>
						<p className="text-gray-600 mb-4">
							{trainings.length === 0 
								? 'Você ainda não participou de nenhum treinamento.'
								: 'Tente ajustar os filtros para ver mais resultados.'
							}
						</p>
						{trainings.length === 0 && (
							<button
								onClick={() => router.push('/dashboard/trainings/new')}
								className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
							>
								<FaShieldAlt />
								<span>Criar Primeiro Treinamento</span>
							</button>
						)}
					</div>
				)}

				{/* Trainings List */}
				{!loading && !error && filteredTrainings.length > 0 && (
					<div className="space-y-4">
						{filteredTrainings.map((training) => (
							<div
								key={training.id}
								className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => router.push(`/dashboard/trainings/${training.id}`)}
							>
								<div className="p-4 sm:p-6">
									{/* Header */}
									<div className="flex flex-wrap items-start justify-between gap-3 mb-4">
										<div className="flex-1 min-w-0">
											<h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
												{training.name}
											</h3>
											{training.description && (
												<p className="text-sm text-gray-600 line-clamp-2">
													{training.description}
												</p>
											)}
										</div>
										<div className="flex flex-wrap items-center gap-2">
											{getStatusBadge(training.status)}
											{getRoleBadge(training.user_role)}
										</div>
									</div>

									{/* Scenario Info */}
									<div className="mb-4 p-3 bg-gray-50 rounded-lg">
										<p className="text-xs text-gray-600 font-medium mb-1">Cenário</p>
										<p className="text-sm font-medium text-gray-900">{training.scenario.scenario_title}</p>
										<p className="text-xs text-gray-500 mt-1">
											{training.scenario.category_id} → {training.scenario.type_id}
										</p>
									</div>

									{/* Metadata Grid */}
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<FaUsers className="text-gray-400 shrink-0" />
											<div>
												<p className="text-xs text-gray-500">Participantes</p>
												<p className="font-medium text-gray-900">
													{training.participants_count} / {training.max_participants}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FaClock className="text-gray-400 shrink-0" />
											<div>
												<p className="text-xs text-gray-500">Duração</p>
												<p className="font-medium text-gray-900">
													{formatTime(training.timer?.elapsed_time || 0)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FaCalendar className="text-gray-400 shrink-0" />
											<div>
												<p className="text-xs text-gray-500">Criado em</p>
												<p className="font-medium text-gray-900 text-xs">
													{formatDate(training.created_at)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FaShieldAlt className="text-gray-400 shrink-0" />
											<div>
												<p className="text-xs text-gray-500">Criador</p>
												<p className="font-medium text-gray-900 truncate text-xs">
													@{training.created_by.nickname}
												</p>
											</div>
										</div>
									</div>

									{/* Entry Date */}
									{training.joined_at && (
										<div className="mt-3 pt-3 border-t border-gray-200">
											<p className="text-xs text-gray-500">
												Você entrou em: <span className="font-medium text-gray-700">{formatDate(training.joined_at)}</span>
											</p>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
