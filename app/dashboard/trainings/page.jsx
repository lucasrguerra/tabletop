"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/Dashboard/Layout';
import {
	FaPlus,
	FaFilter,
	FaChevronLeft,
	FaChevronRight,
	FaUsers,
	FaClock,
	FaCheckCircle,
	FaPause,
	FaPlay,
	FaBook,
	FaUserShield,
	FaUser,
	FaEye,
	FaCalendarAlt,
	FaSearch,
	FaTimes,
	FaExclamationTriangle,
	FaFolderOpen,
	FaArrowRight,
	FaEnvelope
} from 'react-icons/fa';

// Status configuration with colors and icons
const STATUS_CONFIG = {
	not_started: {
		label: 'Nao Iniciado',
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
	},
	completed: {
		label: 'Concluido',
		color: 'bg-blue-100 text-blue-700 border-blue-200',
		icon: FaCheckCircle,
		iconColor: 'text-blue-500',
		gradient: 'from-blue-400 to-indigo-500'
	}
};

// Role configuration
const ROLE_CONFIG = {
	facilitator: {
		label: 'Facilitador',
		color: 'bg-violet-100 text-violet-700',
		icon: FaUserShield,
		gradient: 'from-violet-500 to-purple-600'
	},
	participant: {
		label: 'Participante',
		color: 'bg-blue-100 text-blue-700',
		icon: FaUser,
		gradient: 'from-blue-500 to-indigo-600'
	},
	observer: {
		label: 'Observador',
		color: 'bg-slate-100 text-slate-700',
		icon: FaEye,
		gradient: 'from-slate-500 to-slate-600'
	}
};

// Training Card Component
function TrainingCard({ training }) {
	const statusConfig = STATUS_CONFIG[training.status] || STATUS_CONFIG.not_started;
	const roleConfig = ROLE_CONFIG[training.user_role] || ROLE_CONFIG.participant;
	const StatusIcon = statusConfig.icon;
	const RoleIcon = roleConfig.icon;

	const formatDate = (dateString) => {
		if (!dateString) return null;
		return new Date(dateString).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	};

	return (
		<Link
			href={`/dashboard/trainings/${training.id}`}
			className="group block bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300 overflow-hidden"
		>
			{/* Card Header */}
			<div className="p-5 lg:p-6 border-b border-slate-100">
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors flex items-center gap-2">
							{training.name}
							<FaArrowRight className="text-xs text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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

			{/* Card Body */}
			<div className="p-5 lg:p-6 bg-slate-50/50">
				<div className="flex flex-wrap items-center gap-3 text-sm">
					{/* User Role */}
					<div className={`px-3 py-1.5 rounded-lg ${roleConfig.color} flex items-center gap-1.5`}>
						<RoleIcon className="text-xs" />
						<span className="text-xs font-medium">{roleConfig.label}</span>
					</div>

					{/* Participants Count */}
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

				{/* Date Info */}
				<div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
					<FaCalendarAlt className="text-slate-400" />
					<span>Criado em {formatDate(training.created_at)}</span>
				</div>
			</div>
		</Link>
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

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;
		let start = Math.max(1, current_page - Math.floor(maxVisible / 2));
		let end = Math.min(total_pages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
			<p className="text-sm text-slate-600 order-2 sm:order-1">
				Mostrando pagina {current_page} de {total_pages} ({total_items} treinamentos)
			</p>

			<div className="flex items-center gap-1 order-1 sm:order-2">
				<button
					onClick={() => onPageChange(current_page - 1)}
					disabled={!has_prev}
					className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					aria-label="Pagina anterior"
				>
					<FaChevronLeft className="text-sm" />
				</button>

				<div className="hidden sm:flex items-center gap-1">
					{getPageNumbers().map((page) => (
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
					))}
				</div>

				<span className="sm:hidden px-3 py-2 text-sm text-slate-600">
					{current_page} / {total_pages}
				</span>

				<button
					onClick={() => onPageChange(current_page + 1)}
					disabled={!has_next}
					className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					aria-label="Proxima pagina"
				>
					<FaChevronRight className="text-sm" />
				</button>
			</div>
		</div>
	);
}

// Empty State Component
function EmptyState({ hasFilters, onClearFilters }) {
	return (
		<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 p-8 sm:p-12 text-center">
			<div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
				<div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl" />
				<FaFolderOpen className="relative text-3xl text-slate-400" />
			</div>
			<h3 className="text-lg font-semibold text-slate-900 mb-2">
				{hasFilters ? 'Nenhum treinamento encontrado' : 'Voce ainda nao participa de nenhum treinamento'}
			</h3>
			<p className="text-slate-600 mb-8 max-w-md mx-auto">
				{hasFilters
					? 'Tente ajustar os filtros ou limpar a busca para ver mais resultados.'
					: 'Comece criando um novo treinamento, acesse um treinamento aberto ou use um código de acesso.'
				}
			</p>
			<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
				{hasFilters && (
					<button
						onClick={onClearFilters}
						className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-medium"
					>
						<FaTimes className="text-sm" />
						Limpar Filtros
					</button>
				)}
				{!hasFilters && (
					<Link
						href="/dashboard/trainings/access"
						className="px-5 py-2.5 border-2 border-violet-300 text-violet-700 rounded-xl hover:bg-violet-50 hover:border-violet-400 transition-all flex items-center gap-2 font-medium"
					>
						<FaArrowRight className="text-sm" />
						Acessar Treinamento
					</Link>
				)}
				<Link
					href="/dashboard/trainings/new"
					className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 font-medium"
				>
					<FaPlus className="text-sm" />
					Criar Treinamento
				</Link>
			</div>
		</div>
	);
}

// Loading Skeleton
function LoadingSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<div key={i} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden animate-pulse">
					<div className="p-5 lg:p-6 border-b border-slate-100">
						<div className="flex items-start justify-between gap-3 mb-3">
							<div className="flex-1">
								<div className="h-5 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
								<div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
							</div>
							<div className="h-7 bg-slate-200 rounded-full w-24"></div>
						</div>
						<div className="h-4 bg-slate-200 rounded-lg w-full"></div>
					</div>
					<div className="p-5 lg:p-6 bg-slate-50/50">
						<div className="flex gap-3">
							<div className="h-7 bg-slate-200 rounded-lg w-28"></div>
							<div className="h-7 bg-slate-200 rounded-lg w-20"></div>
						</div>
						<div className="mt-4 pt-4 border-t border-slate-200/60">
							<div className="h-4 bg-slate-200 rounded-lg w-36"></div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Error State Component
function ErrorState({ message, onRetry }) {
	return (
		<div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center">
			<div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
				<div className="absolute inset-0 bg-red-100 rounded-2xl" />
				<FaExclamationTriangle className="relative text-2xl text-red-500" />
			</div>
			<h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar treinamentos</h3>
			<p className="text-red-600 mb-6">{message}</p>
			<button
				onClick={onRetry}
				className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-lg shadow-red-500/25"
			>
				Tentar Novamente
			</button>
		</div>
	);
}

export default function TrainingsPage() {
	const { data: session, status: sessionStatus } = useSession();
	const router = useRouter();

	// State
	const [trainings, setTrainings] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Filters
	const [statusFilter, setStatusFilter] = useState('all');
	const [roleFilter, setRoleFilter] = useState('all');
	const [showFilters, setShowFilters] = useState(false);

	// Filter options
	const statusOptions = [
		{ value: 'all', label: 'Todos os Status' },
		{ value: 'not_started', label: 'Nao Iniciado' },
		{ value: 'active', label: 'Em Andamento' },
		{ value: 'paused', label: 'Pausado' },
		{ value: 'completed', label: 'Concluido' }
	];

	const roleOptions = [
		{ value: 'all', label: 'Todos os Papeis' },
		{ value: 'facilitator', label: 'Facilitador' },
		{ value: 'participant', label: 'Participante' },
		{ value: 'observer', label: 'Observador' }
	];

	// Fetch trainings
	const fetchTrainings = useCallback(async (page = 1) => {
		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '9',
				status: statusFilter,
				participation_type: roleFilter
			});

			const response = await fetch(`/api/trainings?${params.toString()}`);
			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Erro ao carregar treinamentos');
			}

			setTrainings(data.trainings);
			setPagination(data.pagination);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [statusFilter, roleFilter]);

	// Initial fetch and filter changes
	useEffect(() => {
		if (sessionStatus === 'authenticated') {
			fetchTrainings(1);
		}
	}, [sessionStatus, fetchTrainings]);

	// Redirect if not authenticated
	useEffect(() => {
		if (sessionStatus === 'unauthenticated') {
			router.push('/login');
		}
	}, [sessionStatus, router]);

	// Handle page change
	const handlePageChange = (page) => {
		fetchTrainings(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Clear filters
	const clearFilters = () => {
		setStatusFilter('all');
		setRoleFilter('all');
	};

	const hasFilters = statusFilter !== 'all' || roleFilter !== 'all';

	// Loading state for session
	if (sessionStatus === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-gray-50 to-zinc-100">
				<div className="text-center">
					<div className="relative inline-flex">
						<div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
					</div>
					<p className="mt-4 text-slate-600 font-medium">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<DashboardLayout>
			<div className="space-y-6 lg:space-y-8">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Meus Treinamentos</h1>
						<p className="text-slate-600 mt-1">Gerencie e acompanhe seus treinamentos</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<Link
							href="/dashboard/trainings/invites"
							className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-violet-200 text-violet-700 rounded-xl hover:border-violet-400 hover:text-violet-800 hover:bg-violet-50 transition-all font-semibold"
						>
							<FaEnvelope className="text-sm" />
							<span>Convites</span>
						</Link>
						<Link
							href="/dashboard/trainings/access"
							className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-semibold"
						>
							<FaArrowRight className="text-sm" />
							<span>Acessar Treinamento</span>
						</Link>
						<Link
							href="/dashboard/trainings/new"
							className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-semibold"
						>
							<FaPlus className="text-sm" />
							<span>Novo Treinamento</span>
						</Link>
					</div>
				</div>

				{/* Filters Section */}
				<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 overflow-hidden">
					{/* Filter Toggle for Mobile */}
					<button
						onClick={() => setShowFilters(!showFilters)}
						className="w-full sm:hidden flex items-center justify-between p-4 text-left"
					>
						<div className="flex items-center gap-2">
							<FaFilter className="text-slate-500" />
							<span className="font-semibold text-slate-700">Filtros</span>
							{hasFilters && (
								<span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
									{[statusFilter !== 'all', roleFilter !== 'all'].filter(Boolean).length}
								</span>
							)}
						</div>
						<svg
							className={`w-5 h-5 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{/* Filter Content */}
					<div className={`${showFilters ? 'block' : 'hidden'} sm:block p-5 lg:p-6 border-t sm:border-t-0 border-slate-100`}>
						<div className="flex flex-col sm:flex-row sm:items-end gap-4">
							<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<FilterDropdown
									label="Status"
									value={statusFilter}
									options={statusOptions}
									onChange={setStatusFilter}
									icon={FaClock}
								/>
								<FilterDropdown
									label="Meu Papel"
									value={roleFilter}
									options={roleOptions}
									onChange={setRoleFilter}
									icon={FaUser}
								/>
							</div>
							{hasFilters && (
								<button
									onClick={clearFilters}
									className="px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 shrink-0 font-medium"
								>
									<FaTimes className="text-xs" />
									Limpar
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Content */}
				{loading ? (
					<LoadingSkeleton />
				) : error ? (
					<ErrorState message={error} onRetry={() => fetchTrainings(pagination?.current_page || 1)} />
				) : trainings.length === 0 ? (
					<EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
				) : (
					<>
						{/* Trainings Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
							{trainings.map((training) => (
								<TrainingCard key={training.id} training={training} />
							))}
						</div>

						{/* Pagination */}
						<Pagination pagination={pagination} onPageChange={handlePageChange} />
					</>
				)}
			</div>
		</DashboardLayout>
	);
}
