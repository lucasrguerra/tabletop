"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/Dashboard/Layout';
import {
	FaChartLine,
	FaUsers,
	FaClock,
	FaCheckCircle,
	FaPlus,
	FaArrowRight,
	FaEnvelope,
	FaPlay,
	FaPause,
	FaUserShield,
	FaUser,
	FaEye,
	FaBook,
	FaCalendarAlt,
	FaShieldAlt,
	FaNetworkWired,
	FaServer,
	FaMicrochip,
	FaDatabase,
	FaLock,
	FaExclamationTriangle,
	FaKey
} from 'react-icons/fa';

const STATUS_CONFIG = {
	not_started: {
		label: 'Não Iniciado',
		color: 'bg-slate-100 text-slate-700 border-slate-200',
		icon: FaClock,
		iconColor: 'text-slate-500'
	},
	active: {
		label: 'Em Andamento',
		color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
		icon: FaPlay,
		iconColor: 'text-emerald-500'
	},
	paused: {
		label: 'Pausado',
		color: 'bg-amber-100 text-amber-700 border-amber-200',
		icon: FaPause,
		iconColor: 'text-amber-500'
	},
	completed: {
		label: 'Concluído',
		color: 'bg-blue-100 text-blue-700 border-blue-200',
		icon: FaCheckCircle,
		iconColor: 'text-blue-500'
	}
};

const ROLE_CONFIG = {
	facilitator: { label: 'Facilitador', icon: FaUserShield, color: 'bg-violet-100 text-violet-700' },
	participant: { label: 'Participante', icon: FaUser, color: 'bg-blue-100 text-blue-700' },
	observer: { label: 'Observador', icon: FaEye, color: 'bg-slate-100 text-slate-700' }
};

const CATEGORY_CONFIG = {
	GOV_LEGAL: { label: 'Governança e Jurídico', icon: FaShieldAlt, color: 'text-indigo-600', bg: 'bg-indigo-50' },
	NET_ROUT: { label: 'Roteamento de Rede', icon: FaNetworkWired, color: 'text-cyan-600', bg: 'bg-cyan-50' },
	NET_VOL: { label: 'Tráfego Volumétrico e DDoS', icon: FaServer, color: 'text-red-600', bg: 'bg-red-50' },
	PHY_L2: { label: 'Infraestrutura Física e L2', icon: FaMicrochip, color: 'text-orange-600', bg: 'bg-orange-50' },
	SCI_DATA: { label: 'Dados Científicos', icon: FaDatabase, color: 'text-teal-600', bg: 'bg-teal-50' },
	SEC_SYS: { label: 'Segurança de Sistemas', icon: FaLock, color: 'text-rose-600', bg: 'bg-rose-50' }
};

function formatDate(dateString) {
	if (!dateString) return null;
	return new Date(dateString).toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

function StatCard({ label, value, icon: Icon, bgLight, textColor, loading }) {
	return (
		<div className="group bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-5 lg:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
					{loading ? (
						<div className="h-9 w-12 bg-slate-200 rounded-lg animate-pulse" />
					) : (
						<p className="text-3xl lg:text-4xl font-bold text-slate-900">{value}</p>
					)}
				</div>
				<div className={`relative p-3.5 bg-linear-to-br ${bgLight} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
					<Icon className={`text-xl lg:text-2xl ${textColor}`} />
				</div>
			</div>
		</div>
	);
}

function TrainingCardMini({ training }) {
	const statusConfig = STATUS_CONFIG[training.status] || STATUS_CONFIG.not_started;
	const roleConfig = ROLE_CONFIG[training.user_role] || ROLE_CONFIG.participant;
	const StatusIcon = statusConfig.icon;
	const RoleIcon = roleConfig.icon;

	return (
		<Link
			href={`/dashboard/trainings/${training.id}`}
			className="group flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200"
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h4 className="font-semibold text-slate-900 truncate text-sm group-hover:text-blue-600 transition-colors">
						{training.name}
					</h4>
				</div>
				<div className="flex items-center gap-3 text-xs text-slate-500">
					<span className="flex items-center gap-1">
						<RoleIcon className="text-[10px]" />
						{roleConfig.label}
					</span>
					<span className="flex items-center gap-1">
						<FaUsers className="text-[10px]" />
						{training.participants_count}
					</span>
					{training.scenario?.title && (
						<span className="hidden sm:flex items-center gap-1 truncate">
							<FaBook className="text-[10px] shrink-0" />
							<span className="truncate">{training.scenario.title}</span>
						</span>
					)}
				</div>
			</div>
			<div className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusConfig.color} flex items-center gap-1 shrink-0`}>
				<StatusIcon className={`text-[10px] ${statusConfig.iconColor}`} />
				<span className="hidden sm:inline">{statusConfig.label}</span>
			</div>
			<FaArrowRight className="text-xs text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
		</Link>
	);
}

function InviteCard({ invite, onRespond, responding }) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-violet-50/60 rounded-xl border border-violet-100">
			<div className="flex-1 min-w-0">
				<h4 className="font-semibold text-slate-900 text-sm truncate">{invite.name}</h4>
				<p className="text-xs text-slate-500 mt-0.5">
					por {invite.created_by?.nickname || invite.created_by?.name}
					{invite.scenario?.title && ` · ${invite.scenario.title}`}
				</p>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<button
					onClick={() => onRespond(invite.id, 'decline')}
					disabled={responding}
					className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
				>
					Recusar
				</button>
				<button
					onClick={() => onRespond(invite.id, 'accept')}
					disabled={responding}
					className="px-3 py-1.5 text-xs font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all disabled:opacity-50"
				>
					Aceitar
				</button>
			</div>
		</div>
	);
}

function CategoryBar({ category, count, total }) {
	const config = CATEGORY_CONFIG[category] || { label: category, icon: FaBook, color: 'text-slate-600', bg: 'bg-slate-50' };
	const Icon = config.icon;
	const percentage = total > 0 ? (count / total) * 100 : 0;

	return (
		<div className="flex items-center gap-3">
			<div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
				<Icon className={`text-sm ${config.color}`} />
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<span className="text-xs font-medium text-slate-700 truncate">{config.label}</span>
					<span className="text-xs font-semibold text-slate-900 shrink-0 ml-2">{count}</span>
				</div>
				<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-500 ${config.bg.replace('bg-', 'bg-').replace('50', '400')}`}
						style={{ width: `${percentage}%`, backgroundColor: `var(--tw-${config.color.replace('text-', '')}, currentColor)` }}
					/>
				</div>
			</div>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3].map(i => (
				<div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl animate-pulse">
					<div className="flex-1">
						<div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
						<div className="h-3 bg-slate-200 rounded w-1/2" />
					</div>
					<div className="h-6 bg-slate-200 rounded-full w-20" />
				</div>
			))}
		</div>
	);
}

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, not_started: 0, paused: 0 });
	const [recentTrainings, setRecentTrainings] = useState([]);
	const [activeTrainings, setActiveTrainings] = useState([]);
	const [invites, setInvites] = useState([]);
	const [categoryBreakdown, setCategoryBreakdown] = useState({});
	const [roleBreakdown, setRoleBreakdown] = useState({ facilitator: 0, participant: 0, observer: 0 });
	const [responding, setResponding] = useState(false);

	const fetchDashboardData = useCallback(async () => {
		setLoading(true);
		try {
			const [allRes, activeRes, completedRes, notStartedRes, invitesRes] = await Promise.all([
				fetch('/api/trainings?limit=5&status=all'),
				fetch('/api/trainings?limit=50&status=active'),
				fetch('/api/trainings?limit=1&status=completed'),
				fetch('/api/trainings?limit=1&status=not_started'),
				fetch('/api/trainings/invites')
			]);

			const [allData, activeData, completedData, notStartedData, invitesData] = await Promise.all([
				allRes.json(),
				activeRes.json(),
				completedRes.json(),
				notStartedRes.json(),
				invitesRes.json()
			]);

			// Stats
			const totalCount = allData.success ? allData.pagination.total_items : 0;
			const activeCount = activeData.success ? activeData.pagination.total_items : 0;
			const completedCount = completedData.success ? completedData.pagination.total_items : 0;
			const notStartedCount = notStartedData.success ? notStartedData.pagination.total_items : 0;
			const pausedCount = Math.max(0, totalCount - activeCount - completedCount - notStartedCount);

			setStats({ total: totalCount, active: activeCount, completed: completedCount, not_started: notStartedCount, paused: pausedCount });

			// Recent trainings (last 5)
			if (allData.success) {
				setRecentTrainings(allData.trainings);
			}

			// Active trainings
			if (activeData.success) {
				setActiveTrainings(activeData.trainings.slice(0, 5));

				// Build category & role breakdowns from all fetched trainings
				const allTrainings = [
					...(allData.success ? allData.trainings : []),
					...(activeData.success ? activeData.trainings : [])
				];

				// Deduplicate by id
				const uniqueMap = new Map();
				allTrainings.forEach(t => uniqueMap.set(t.id, t));
				const unique = Array.from(uniqueMap.values());

				const catCount = {};
				const rolCount = { facilitator: 0, participant: 0, observer: 0 };
				unique.forEach(t => {
					if (t.scenario?.category) {
						catCount[t.scenario.category] = (catCount[t.scenario.category] || 0) + 1;
					}
					if (t.user_role && rolCount[t.user_role] !== undefined) {
						rolCount[t.user_role]++;
					}
				});
				setCategoryBreakdown(catCount);
				setRoleBreakdown(rolCount);
			}

			// Invites
			if (invitesData.success) {
				setInvites(invitesData.invitations || []);
			}
		} catch (err) {
			console.error('Error fetching dashboard data:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	useEffect(() => {
		if (status === 'authenticated') {
			fetchDashboardData();
		}
	}, [status, fetchDashboardData]);

	const handleRespondInvite = async (trainingId, action) => {
		setResponding(true);
		try {
			const csrfRes = await fetch('/api/csrf');
			const csrfData = await csrfRes.json();

			const res = await fetch('/api/trainings/invites', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfData.csrfToken },
				body: JSON.stringify({ training_id: trainingId, action })
			});
			const data = await res.json();
			if (data.success) {
				setInvites(prev => prev.filter(inv => inv.id !== trainingId));
				if (action === 'accept') {
					fetchDashboardData();
				}
			}
		} catch (err) {
			console.error('Error responding to invite:', err);
		} finally {
			setResponding(false);
		}
	};

	if (status === 'loading') {
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

	const totalRoles = roleBreakdown.facilitator + roleBreakdown.participant + roleBreakdown.observer;
	const categoryEntries = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
	const totalCategoryTrainings = categoryEntries.reduce((sum, [, count]) => sum + count, 0);

	return (
		<DashboardLayout>
			<div className="space-y-6 lg:space-y-8">
				{/* Welcome Section */}
				<div className="relative overflow-hidden bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
					<div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
								Bem-vindo, <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{session.user.name}</span>!
							</h1>
							<p className="text-slate-600">
								Acompanhe seus treinamentos de resposta a incidentes.
							</p>
						</div>
						{invites.length > 0 && (
							<div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl shrink-0">
								<FaEnvelope className="text-violet-500" />
								<span className="text-sm font-medium text-violet-700">
									{invites.length} {invites.length === 1 ? 'convite pendente' : 'convites pendentes'}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
					<StatCard
						label="Total de Treinamentos"
						value={stats.total}
						icon={FaChartLine}
						bgLight="from-blue-50 to-indigo-50"
						textColor="text-blue-600"
						loading={loading}
					/>
					<StatCard
						label="Em Andamento"
						value={stats.active}
						icon={FaPlay}
						bgLight="from-emerald-50 to-teal-50"
						textColor="text-emerald-600"
						loading={loading}
					/>
					<StatCard
						label="Concluídos"
						value={stats.completed}
						icon={FaCheckCircle}
						bgLight="from-violet-50 to-purple-50"
						textColor="text-violet-600"
						loading={loading}
					/>
					<StatCard
						label="Aguardando Início"
						value={stats.not_started}
						icon={FaClock}
						bgLight="from-amber-50 to-orange-50"
						textColor="text-amber-600"
						loading={loading}
					/>
				</div>

				{/* Pending Invitations */}
				{invites.length > 0 && (
					<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-violet-200/60 p-6 lg:p-8">
						<div className="flex items-center justify-between mb-5">
							<h2 className="text-lg lg:text-xl font-semibold text-slate-900 flex items-center gap-2">
								<FaEnvelope className="text-violet-500" />
								Convites Pendentes
								<span className="ml-1 px-2 py-0.5 text-xs font-bold bg-violet-100 text-violet-700 rounded-full">
									{invites.length}
								</span>
							</h2>
							<Link
								href="/dashboard/trainings/invites"
								className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors"
							>
								Ver todos
								<FaArrowRight className="text-xs" />
							</Link>
						</div>
						<div className="space-y-3">
							{invites.slice(0, 3).map((invite) => (
								<InviteCard
									key={invite.id}
									invite={invite}
									onRespond={handleRespondInvite}
									responding={responding}
								/>
							))}
							{invites.length > 3 && (
								<p className="text-xs text-slate-500 text-center pt-2">
									e mais {invites.length - 3} {invites.length - 3 === 1 ? 'convite' : 'convites'}...
								</p>
							)}
						</div>
					</div>
				)}

				{/* Active Trainings + Sidebar */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Active Trainings */}
					<div className="lg:col-span-2 bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
						<div className="flex items-center justify-between mb-5">
							<h2 className="text-lg lg:text-xl font-semibold text-slate-900 flex items-center gap-2">
								<FaPlay className="text-emerald-500 text-base" />
								Treinamentos Ativos
							</h2>
							<Link
								href="/dashboard/trainings"
								className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
							>
								Ver todos
								<FaArrowRight className="text-xs" />
							</Link>
						</div>
						{loading ? (
							<LoadingSkeleton />
						) : activeTrainings.length > 0 ? (
							<div className="space-y-3">
								{activeTrainings.map((training) => (
									<TrainingCardMini key={training.id} training={training} />
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
									<FaPlay className="text-xl text-slate-400" />
								</div>
								<p className="text-sm text-slate-600 mb-1 font-medium">Nenhum treinamento ativo</p>
								<p className="text-xs text-slate-500">Seus treinamentos em andamento aparecerão aqui.</p>
							</div>
						)}
					</div>

					{/* Sidebar: Role Distribution + Categories */}
					<div className="space-y-6">
						{/* Role Distribution */}
						{totalRoles > 0 && (
							<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6">
								<h3 className="text-sm font-semibold text-slate-900 mb-4">Seus Papéis</h3>
								<div className="space-y-3">
									{roleBreakdown.facilitator > 0 && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="p-1.5 bg-violet-50 rounded-lg">
													<FaUserShield className="text-xs text-violet-600" />
												</div>
												<span className="text-xs font-medium text-slate-700">Facilitador</span>
											</div>
											<span className="text-sm font-bold text-slate-900">{roleBreakdown.facilitator}</span>
										</div>
									)}
									{roleBreakdown.participant > 0 && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="p-1.5 bg-blue-50 rounded-lg">
													<FaUser className="text-xs text-blue-600" />
												</div>
												<span className="text-xs font-medium text-slate-700">Participante</span>
											</div>
											<span className="text-sm font-bold text-slate-900">{roleBreakdown.participant}</span>
										</div>
									)}
									{roleBreakdown.observer > 0 && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="p-1.5 bg-slate-100 rounded-lg">
													<FaEye className="text-xs text-slate-600" />
												</div>
												<span className="text-xs font-medium text-slate-700">Observador</span>
											</div>
											<span className="text-sm font-bold text-slate-900">{roleBreakdown.observer}</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Category Breakdown */}
						{categoryEntries.length > 0 && (
							<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6">
								<h3 className="text-sm font-semibold text-slate-900 mb-4">Categorias Treinadas</h3>
								<div className="space-y-3">
									{categoryEntries.map(([cat, count]) => (
										<CategoryBar key={cat} category={cat} count={count} total={totalCategoryTrainings} />
									))}
								</div>
							</div>
						)}

						{/* Quick Status */}
						{stats.paused > 0 && (
							<div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-5">
								<div className="flex items-center gap-3">
									<div className="p-2.5 bg-amber-100 rounded-xl">
										<FaPause className="text-sm text-amber-600" />
									</div>
									<div>
										<p className="text-sm font-semibold text-amber-900">
											{stats.paused} {stats.paused === 1 ? 'treinamento pausado' : 'treinamentos pausados'}
										</p>
										<p className="text-xs text-amber-700 mt-0.5">Retome quando estiver pronto.</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Recent Trainings */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<div className="flex items-center justify-between mb-5">
						<h2 className="text-lg lg:text-xl font-semibold text-slate-900 flex items-center gap-2">
							<FaCalendarAlt className="text-blue-500 text-base" />
							Treinamentos Recentes
						</h2>
						<Link
							href="/dashboard/trainings"
							className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
						>
							Ver todos
							<FaArrowRight className="text-xs" />
						</Link>
					</div>
					{loading ? (
						<LoadingSkeleton />
					) : recentTrainings.length > 0 ? (
						<div className="space-y-3">
							{recentTrainings.map((training) => (
								<TrainingCardMini key={training.id} training={training} />
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
								<FaBook className="text-xl text-slate-400" />
							</div>
							<p className="text-sm text-slate-600 mb-1 font-medium">Nenhum treinamento ainda</p>
							<p className="text-xs text-slate-500 mb-4">Crie seu primeiro treinamento ou acesse um existente.</p>
						</div>
					)}
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-6">
						Ações Rápidas
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						<Link
							href="/dashboard/trainings/new"
							className="group relative p-5 bg-white border-2 border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 text-left overflow-hidden"
						>
							<div className="inline-flex p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 shadow-lg">
								<FaPlus className="text-lg text-white" />
							</div>
							<div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
								Novo Treinamento
								<FaArrowRight className="text-sm text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all" />
							</div>
							<p className="text-sm text-slate-500">Criar um novo cenário de treinamento</p>
						</Link>
						<Link
							href="/dashboard/trainings/access"
							className="group relative p-5 bg-white border-2 border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 text-left overflow-hidden"
						>
							<div className="inline-flex p-3 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl mb-4 shadow-lg">
								<FaKey className="text-lg text-white" />
							</div>
							<div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
								Acessar Treinamento
								<FaArrowRight className="text-sm text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all" />
							</div>
							<p className="text-sm text-slate-500">Entrar com código de acesso ou explorar abertos</p>
						</Link>
						<Link
							href="/dashboard/trainings"
							className="group relative p-5 bg-white border-2 border-slate-200 rounded-xl hover:bg-violet-50 hover:border-violet-300 transition-all duration-300 text-left overflow-hidden"
						>
							<div className="inline-flex p-3 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl mb-4 shadow-lg">
								<FaBook className="text-lg text-white" />
							</div>
							<div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
								Meus Treinamentos
								<FaArrowRight className="text-sm text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all" />
							</div>
							<p className="text-sm text-slate-500">Visualizar e gerenciar todos os treinamentos</p>
						</Link>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
