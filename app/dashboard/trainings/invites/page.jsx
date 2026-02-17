"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import {
	FaEnvelope,
	FaUsers,
	FaBook,
	FaCalendarAlt,
	FaClock,
	FaPlay,
	FaPause,
	FaCheckCircle,
	FaSpinner,
	FaExclamationTriangle,
	FaInbox,
	FaCheck,
	FaTimes
} from 'react-icons/fa';

// Status configuration
const STATUS_CONFIG = {
	not_started: {
		label: 'Não Iniciado',
		color: 'bg-slate-100 text-slate-700',
		icon: FaClock
	},
	active: {
		label: 'Em Andamento',
		color: 'bg-emerald-100 text-emerald-700',
		icon: FaPlay
	},
	paused: {
		label: 'Pausado',
		color: 'bg-amber-100 text-amber-700',
		icon: FaPause
	}
};

// Role configuration
const ROLE_CONFIG = {
	facilitator: {
		label: 'Facilitador',
		color: 'text-violet-700',
		bgColor: 'bg-violet-100'
	},
	participant: {
		label: 'Participante',
		color: 'text-blue-700',
		bgColor: 'bg-blue-100'
	},
	observer: {
		label: 'Observador',
		color: 'text-slate-700',
		bgColor: 'bg-slate-100'
	}
};

// Invitation Card Component
function InvitationCard({ invitation, onRespond, isResponding }) {
	const statusConfig = STATUS_CONFIG[invitation.status] || STATUS_CONFIG.not_started;
	const roleConfig = ROLE_CONFIG[invitation.invited_role] || ROLE_CONFIG.participant;
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
		<div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
			{/* Header */}
			<div className="p-5 lg:p-6 border-b border-slate-100">
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-slate-900 truncate">
							{invitation.training_name}
						</h3>
						<p className="text-sm text-slate-500 mt-1">
							por {invitation.created_by?.nickname || invitation.created_by?.name}
						</p>
					</div>
					<div className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color} flex items-center gap-1.5 shrink-0`}>
						<StatusIcon className="text-xs" />
						<span className="hidden sm:inline">{statusConfig.label}</span>
					</div>
				</div>

				{invitation.training_description && (
					<p className="text-sm text-slate-600 line-clamp-2">
						{invitation.training_description}
					</p>
				)}
			</div>

			{/* Info */}
			<div className="p-5 lg:p-6 bg-slate-50/50">
				<div className="flex flex-wrap items-center gap-3 text-sm mb-4">
					{/* Role */}
					<div className={`px-3 py-1.5 rounded-lg ${roleConfig.bgColor} ${roleConfig.color} flex items-center gap-1.5 font-medium`}>
						<FaEnvelope className="text-xs" />
						<span className="text-xs">Convidado como {roleConfig.label}</span>
					</div>

					{/* Participants */}
					<div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
						<FaUsers className="text-xs text-slate-400" />
						<span className="text-xs font-medium">
							{invitation.participants_count}/{invitation.max_participants}
						</span>
					</div>

					{/* Scenario */}
					{invitation.scenario && (
						<div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
							<FaBook className="text-xs text-slate-400" />
							<span className="text-xs font-medium">
								{invitation.scenario.title}
							</span>
						</div>
					)}
				</div>

				{/* Created Date */}
				<div className="mb-4 pb-4 border-b border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
					<FaCalendarAlt className="text-slate-400" />
					<span>Criado em {formatDate(invitation.created_at)}</span>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3">
					<button
						onClick={() => onRespond(invitation.training_id, 'accept')}
						disabled={isResponding}
						className="flex-1 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isResponding === `${invitation.training_id}-accept` ? (
							<>
								<FaSpinner className="text-sm animate-spin" />
								<span>Aceitando...</span>
							</>
						) : (
							<>
								<FaCheck className="text-sm" />
								<span>Aceitar</span>
							</>
						)}
					</button>

					<button
						onClick={() => onRespond(invitation.training_id, 'decline')}
						disabled={isResponding}
						className="flex-1 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isResponding === `${invitation.training_id}-decline` ? (
							<>
								<FaSpinner className="text-sm animate-spin" />
								<span>Recusando...</span>
							</>
						) : (
							<>
								<FaTimes className="text-sm" />
								<span>Recusar</span>
							</>
						)}
					</button>
				</div>
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
				<FaInbox className="relative text-3xl text-slate-400" />
			</div>
			<h3 className="text-lg font-semibold text-slate-900 mb-2">
				Nenhum convite pendente
			</h3>
			<p className="text-slate-600 max-w-md mx-auto">
				Você não possui convites de treinamento no momento. Quando alguém te convidar, os convites aparecerão aqui.
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
					<div className="h-3 bg-slate-200 rounded w-5/6 mb-4"></div>
					<div className="flex gap-3">
						<div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
						<div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
					</div>
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
				Erro ao carregar convites
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
export default function InvitesPage() {
	const router = useRouter();
	const [invitations, setInvitations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [respondingId, setRespondingId] = useState(null);
	const [csrfToken, setCsrfToken] = useState(null);

	// Fetch CSRF token
	useEffect(() => {
		const fetchCsrf = async () => {
			try {
				const res = await fetch('/api/csrf');
				const data = await res.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Error fetching CSRF token:', err);
			}
		};
		fetchCsrf();
	}, []);

	// Fetch invitations
	const fetchInvitations = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch('/api/trainings/invites', {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao carregar convites');
			}

			const data = await response.json();
			setInvitations(data.invitations || []);
		} catch (err) {
			console.error('Error fetching invitations:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvitations();
	}, []);

	// Handle responding to invitation
	const handleRespond = async (trainingId, action) => {
		try {
			setRespondingId(`${trainingId}-${action}`);

			const response = await fetch('/api/trainings/invites', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				credentials: 'include',
				body: JSON.stringify({ training_id: trainingId, action })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao responder convite');
			}

			// Show success message
			alert(data.message);

			// If accepted, redirect to training page
			if (action === 'accept' && data.training) {
				router.push(`/dashboard/trainings/${data.training.id}/${data.training.role}`);
			} else {
				// Refresh invitations list
				fetchInvitations();
			}
		} catch (err) {
			console.error('Error responding to invitation:', err);
			alert(err.message);
		} finally {
			setRespondingId(null);
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
					<div>
						<h1 className="text-3xl font-bold text-slate-900 mb-2">
							Convites Pendentes
						</h1>
						<p className="text-slate-600">
							Gerencie seus convites de treinamento
						</p>
					</div>
					{invitations.length > 0 && (
						<div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
							<FaEnvelope className="text-blue-600" />
							<span className="text-sm font-semibold text-blue-700">
								{invitations.length} {invitations.length === 1 ? 'convite' : 'convites'}
							</span>
						</div>
					)}
				</div>

				{/* Invitations List */}
				{loading ? (
					<LoadingSkeleton />
				) : error ? (
					<ErrorState message={error} onRetry={fetchInvitations} />
				) : invitations.length === 0 ? (
					<EmptyState />
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{invitations.map((invitation) => (
							<InvitationCard
								key={invitation.training_id}
								invitation={invitation}
								onRespond={handleRespond}
								isResponding={respondingId}
							/>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
