"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import {
	FaBook,
	FaUsers,
	FaCalendarAlt,
	FaClock,
	FaPlay,
	FaPause,
	FaKey,
	FaChevronLeft,
	FaChevronRight,
	FaSpinner,
	FaExclamationTriangle,
	FaInfoCircle,
	FaArrowRight,
	FaLock,
	FaLockOpen
} from 'react-icons/fa';

// Status configuration
const STATUS_CONFIG = {
	not_started: {
		label: 'Não Iniciado',
		color: 'bg-slate-100 text-slate-700 border-slate-200',
		icon: FaClock,
		iconColor: 'text-slate-500',
		gradient: 'from-slate-400 to-slate-500'
	},
	active: {
		label: 'Em Andamento',
		color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
		icon: FaPlay,
		iconColor: 'text-emerald-500',
		gradient: 'from-emerald-400 to-teal-500'
	},
	paused: {
		label: 'Pausado',
		color: 'bg-amber-100 text-amber-700 border-amber-200',
		icon: FaPause,
		iconColor: 'text-amber-500',
		gradient: 'from-amber-400 to-orange-500'
	}
};

// Training Card Component
function TrainingCard({ training, onJoin, isJoining }) {
	const statusConfig = STATUS_CONFIG[training.status] || STATUS_CONFIG.not_started;
	const StatusIcon = statusConfig.icon;

	const formatDate = (dateString) => {
		if (!dateString) return 'Data não disponível';
		return new Date(dateString).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	return (
		<div className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300 overflow-hidden">
			{/* Header */}
			<div className="p-5 lg:p-6 border-b border-slate-100">
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-slate-900 truncate">
							{training.name}
						</h3>
						<p className="text-sm text-slate-500 mt-1">
							por {training.created_by?.nickname || training.created_by?.name}
						</p>
					</div>
					<div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center gap-1.5 shrink-0`}>
						<StatusIcon className={`text-xs ${statusConfig.iconColor}`} />
						<span className="hidden sm:inline">{statusConfig.label}</span>
					</div>
				</div>

				{training.description && (
					<p className="text-sm text-slate-600 line-clamp-2">
						{training.description}
					</p>
				)}
			</div>

			{/* Info */}
			<div className="p-5 lg:p-6 bg-slate-50/50">
				<div className="flex flex-wrap items-center gap-3 text-sm mb-4">
					{/* Participants */}
					<div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
						<FaUsers className="text-xs text-slate-400" />
						<span className="text-xs font-medium">
							{training.participants_count}
							{training.max_participants && `/${training.max_participants}`}
						</span>
					</div>

					{/* Scenario */}
					{training.scenario && (
						<div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
							<FaBook className="text-xs text-slate-400" />
							<span className="text-xs font-medium">
								{training.scenario.title || training.scenario.id}
							</span>
						</div>
					)}
				</div>

				{/* Created Date */}
				<div className="mb-4 pb-4 border-b border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
					<FaCalendarAlt className="text-slate-400" />
					<span>Criado em {formatDate(training.created_at)}</span>
				</div>

				{/* Join Button */}
				<button
					onClick={() => onJoin(training.id)}
					disabled={isJoining}
					className="w-full px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isJoining ? (
						<>
							<FaSpinner className="text-sm animate-spin" />
							<span>Entrando...</span>
						</>
					) : (
						<>
							<FaArrowRight className="text-sm" />
							<span>Entrar no Treinamento</span>
						</>
					)}
				</button>
			</div>
		</div>
	);
}

// Access Code Form Component
function AccessCodeForm({ onSubmit, isJoining }) {
	const [accessCode, setAccessCode] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		if (accessCode.trim()) {
			onSubmit(accessCode.trim());
		}
	};

	return (
		<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 p-6 lg:p-8">
			<div className="flex items-start gap-4 mb-6">
				<div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25">
					<FaKey className="text-xl text-white" />
				</div>
				<div>
					<h2 className="text-xl font-semibold text-slate-900 mb-1">
						Entrar com Código de Acesso
					</h2>
					<p className="text-sm text-slate-600">
						Digite o código de acesso fornecido pelo facilitador
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="access_code" className="block text-sm font-medium text-slate-700 mb-2">
						Código de Acesso
					</label>
					<div className="relative">
						<input
							type="text"
							id="access_code"
							value={accessCode}
							onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
							placeholder="Digite o código"
							className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
							maxLength={20}
							required
						/>
						<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
							<FaLock className="text-slate-400" />
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={isJoining || !accessCode.trim()}
					className="w-full px-5 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isJoining ? (
						<>
							<FaSpinner className="text-sm animate-spin" />
							<span>Verificando...</span>
						</>
					) : (
						<>
							<FaKey className="text-sm" />
							<span>Entrar no Treinamento</span>
						</>
					)}
				</button>
			</form>
		</div>
	);
}

// Filter Dropdown Component
function FilterDropdown({ label, value, options, onChange, icon: Icon }) {
	return (
		<div className="relative">
			<label className="block text-xs font-semibold text-slate-600 mb-2">{label}</label>
			<div className="relative">
				{Icon && (
					<div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
						<Icon className="text-slate-400 text-sm" />
					</div>
				)}
				<select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${Icon ? 'pl-10' : 'pl-4'}`}
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
					<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>
		</div>
	);
}

// Pagination Component
function Pagination({ pagination, onPageChange }) {
	if (!pagination || pagination.total_pages <= 1) return null;

	const { current_page, total_pages, total_items, has_next, has_prev } = pagination;

	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;

		if (total_pages <= maxVisible) {
			for (let i = 1; i <= total_pages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);
			if (current_page > 3) pages.push('...');
			for (let i = Math.max(2, current_page - 1); i <= Math.min(total_pages - 1, current_page + 1); i++) {
				pages.push(i);
			}
			if (current_page < total_pages - 2) pages.push('...');
			pages.push(total_pages);
		}

		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
			<p className="text-sm text-slate-600 order-2 sm:order-1">
				Mostrando página {current_page} de {total_pages} ({total_items} treinamentos)
			</p>

			<div className="flex items-center gap-1 order-1 sm:order-2">
				<button
					onClick={() => onPageChange(current_page - 1)}
					disabled={!has_prev}
					className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					aria-label="Página anterior"
				>
					<FaChevronLeft className="text-sm" />
				</button>

				<div className="hidden sm:flex items-center gap-1">
					{getPageNumbers().map((page, index) => (
						page === '...' ? (
							<span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-slate-400">...</span>
						) : (
							<button
								key={page}
								onClick={() => onPageChange(page)}
								className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
									page === current_page
									? 'bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
										: 'border border-slate-200 text-slate-600 hover:bg-slate-50'
								}`}
							>
								{page}
							</button>
						)
					))}
				</div>

				<span className="sm:hidden px-3 py-2 text-sm text-slate-600">
					{current_page} / {total_pages}
				</span>

				<button
					onClick={() => onPageChange(current_page + 1)}
					disabled={!has_next}
					className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					aria-label="Próxima página"
				>
					<FaChevronRight className="text-sm" />
				</button>
			</div>
		</div>
	);
}

// Empty State Component
function EmptyState() {
	return (
		<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 p-8 sm:p-12 text-center">
			<div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
				<div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl" />
				<FaLockOpen className="relative text-3xl text-slate-400" />
			</div>
			<h3 className="text-lg font-semibold text-slate-900 mb-2">
				Nenhum treinamento disponível no momento
			</h3>
			<p className="text-slate-600 mb-8 max-w-md mx-auto">
				Não há treinamentos abertos para participar. Tente novamente mais tarde ou use um código de acesso.
			</p>
		</div>
	);
}

// Loading Skeleton
function LoadingSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 animate-pulse">
					<div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
					<div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
					<div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
					<div className="h-3 bg-slate-200 rounded w-5/6"></div>
				</div>
			))}
		</div>
	);
}

// Error State Component
function ErrorState({ message, onRetry }) {
	return (
		<div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
			<div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-xl mb-4">
				<FaExclamationTriangle className="text-2xl text-red-500" />
			</div>
			<h3 className="text-lg font-semibold text-red-900 mb-2">
				Erro ao carregar treinamentos
			</h3>
			<p className="text-red-700 mb-6">{message}</p>
			<button
				onClick={onRetry}
				className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
			>
				Tentar Novamente
			</button>
		</div>
	);
}

// Main Component
export default function AccessTrainingsPage() {
	const router = useRouter();
	const [trainings, setTrainings] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [joiningId, setJoiningId] = useState(null);

	// Filters
	const [statusFilter, setStatusFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);

	// Fetch trainings
	const fetchTrainings = async () => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '10',
				status: statusFilter
			});

			const response = await fetch(`/api/trainings/access?${params}`, {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao carregar treinamentos');
			}

			const data = await response.json();
			setTrainings(data.trainings || []);
			setPagination(data.pagination);
		} catch (err) {
			console.error('Error fetching trainings:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTrainings();
	}, [currentPage, statusFilter]);

	// Handle joining a training
	const handleJoinTraining = async (trainingId, accessCode = null) => {
		try {
			setJoiningId(trainingId || 'code');

			const response = await fetch('/api/trainings/access', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					training_id: trainingId,
					access_code: accessCode
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao entrar no treinamento');
			}

			// Show success message
			alert(data.message || 'Você entrou no treinamento com sucesso!');

			// Redirect to the training page
			router.push(`/dashboard/trainings/${data.training.id}/participant`);
		} catch (err) {
			console.error('Error joining training:', err);
			alert(err.message);
		} finally {
			setJoiningId(null);
		}
	};

	// Handle access code submission
	const handleAccessCodeSubmit = async (accessCode) => {
		// For code-based access, we don't have a training_id yet
		// We need to find the training by code or just pass the code
		// Let's modify the approach: the backend should accept just a code
		// and find the training automatically
		
		// For now, we'll need to modify our API to support this
		// Let's just pass null as training_id and the backend will handle it
		await handleJoinTraining(null, accessCode);
	};

	// Handle page change
	const handlePageChange = (page) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Status filter options
	const statusOptions = [
		{ value: 'all', label: 'Todos os Status' },
		{ value: 'not_started', label: 'Não Iniciados' },
		{ value: 'active', label: 'Em Andamento' },
		{ value: 'paused', label: 'Pausados' }
	];

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
					<div>
						<h1 className="text-3xl font-bold text-slate-900 mb-2">
							Acessar Treinamentos
						</h1>
						<p className="text-slate-600">
							Entre em treinamentos abertos ou use um código de acesso
						</p>
					</div>
				</div>

				{/* Access Code Form */}
				<AccessCodeForm
					onSubmit={handleAccessCodeSubmit}
					isJoining={joiningId === 'code'}
				/>

				{/* Divider */}
				<div className="relative py-4">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-slate-200"></div>
					</div>
					<div className="relative flex justify-center">
						<span className="bg-slate-50 px-4 text-sm text-slate-500 font-medium">
							ou navegue por treinamentos abertos
						</span>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 lg:p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<FilterDropdown
							label="Status"
							value={statusFilter}
							options={statusOptions}
							onChange={setStatusFilter}
							icon={FaInfoCircle}
						/>
					</div>
				</div>

				{/* Trainings List */}
				{loading ? (
					<LoadingSkeleton />
				) : error ? (
					<ErrorState message={error} onRetry={fetchTrainings} />
				) : trainings.length === 0 ? (
					<EmptyState />
				) : (
					<>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{trainings.map((training) => (
								<TrainingCard
									key={training.id}
									training={training}
									onJoin={handleJoinTraining}
									isJoining={joiningId === training.id}
								/>
							))}
						</div>

						{/* Pagination */}
						<Pagination
							pagination={pagination}
							onPageChange={handlePageChange}
						/>
					</>
				)}
			</div>
		</DashboardLayout>
	);
}
