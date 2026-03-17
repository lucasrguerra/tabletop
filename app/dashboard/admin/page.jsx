"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import {
    FaUsers,
    FaBook,
    FaTrash,
    FaSearch,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaExclamationTriangle,
    FaCrown,
    FaSpinner,
    FaToggleOn,
    FaToggleOff,
    FaChartBar,
    FaCheckCircle,
    FaStar,
    FaSync,
} from 'react-icons/fa';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

const STATUS_LABELS = {
    not_started: 'Não iniciado',
    active: 'Em andamento',
    paused: 'Pausado',
    completed: 'Concluído',
};

const STATUS_COLORS = {
    not_started: 'bg-slate-100 text-slate-600',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
};

// ---- Overview tab helper components ----

const STATUS_PIE_COLORS = {
    not_started: '#94a3b8',
    active:      '#22c55e',
    paused:      '#f59e0b',
    completed:   '#3b82f6',
};
const CATEGORY_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const CHART_BLUE   = '#3b82f6';
const CHART_INDIGO = '#6366f1';

const SUMMARY_CARD_COLORS = {
    blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-500',    text: 'text-blue-600' },
    indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-500',  text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-600' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-600' },
};

function SummaryCard({ label, value, icon: Icon, color }) {
    const c = SUMMARY_CARD_COLORS[color] ?? SUMMARY_CARD_COLORS.blue;
    return (
        <div className={`${c.bg} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`${c.icon} p-3 rounded-xl shadow-sm`}>
                <Icon className="text-white text-lg" />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 ${className}`}>
            <p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}
            {children}
        </div>
    );
}

function EmptyChart({ message = 'Sem dados para exibir' }) {
    return (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
            {message}
        </div>
    );
}

function OverviewSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64 bg-slate-100 rounded-2xl" />
                <div className="h-64 bg-slate-100 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64 bg-slate-100 rounded-2xl" />
                <div className="h-64 bg-slate-100 rounded-2xl" />
            </div>
            <div className="h-80 bg-slate-100 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="h-64 bg-slate-100 rounded-2xl lg:col-span-2" />
                <div className="h-64 bg-slate-100 rounded-2xl" />
            </div>
            <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
    );
}

function OverviewTab({ stats, loading, error, onRetry }) {
    if (loading) return <OverviewSkeleton />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
                <FaExclamationTriangle className="text-3xl text-red-400" />
                <p className="text-sm">{error}</p>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors"
                >
                    <FaSync className="text-xs" /> Tentar novamente
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const {
        summary,
        users_over_time,
        trainings_over_time,
        trainings_by_status,
        top_scenarios,
        trainings_by_category,
        evaluation_ratings,
        top_facilitators,
    } = stats;

    return (
        <div className="space-y-6">
            {/* Row 1: Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total de Usuários"     value={summary.total_users}      icon={FaUsers}        color="blue" />
                <SummaryCard label="Total de Treinamentos" value={summary.total_trainings}   icon={FaBook}         color="indigo" />
                <SummaryCard label="Taxa de Conclusão"     value={`${summary.completion_rate}%`} icon={FaCheckCircle} color="emerald" />
                <SummaryCard
                    label="Avaliação Média"
                    value={summary.avg_overall_rating != null ? summary.avg_overall_rating.toFixed(1) : '—'}
                    icon={FaStar}
                    color="amber"
                />
            </div>

            {/* Row 2: Time series */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Usuários Cadastrados" subtitle="Últimos 12 meses">
                    {users_over_time.every(d => d.count === 0) ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={users_over_time}>
                                <defs>
                                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_BLUE} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" name="Usuários"
                                    stroke={CHART_BLUE} strokeWidth={2}
                                    fill="url(#gradUsers)" dot={false} activeDot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Treinamentos Criados" subtitle="Últimos 12 meses">
                    {trainings_over_time.every(d => d.count === 0) ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trainings_over_time}>
                                <defs>
                                    <linearGradient id="gradTrainings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={CHART_INDIGO} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={CHART_INDIGO} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" name="Treinamentos"
                                    stroke={CHART_INDIGO} strokeWidth={2}
                                    fill="url(#gradTrainings)" dot={false} activeDot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            {/* Row 3: Status pie + Category bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Treinamentos por Status">
                    {trainings_by_status.length === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={trainings_by_status}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%" cy="50%"
                                    outerRadius={80} innerRadius={45}
                                    paddingAngle={3}
                                >
                                    {trainings_by_status.map(entry => (
                                        <Cell key={entry.status} fill={STATUS_PIE_COLORS[entry.status] ?? '#cbd5e1'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, STATUS_LABELS[n] ?? n]} />
                                <Legend formatter={v => STATUS_LABELS[v] ?? v} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Treinamentos por Categoria">
                    {trainings_by_category.length === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={trainings_by_category} layout="vertical" margin={{ left: 8, right: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip />
                                <Bar dataKey="count" name="Treinamentos" radius={[0, 4, 4, 0]}>
                                    {trainings_by_category.map((_, i) => (
                                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            {/* Row 4: Top 10 scenarios */}
            <ChartCard title="Top 10 Cenários Mais Usados">
                {top_scenarios.length === 0 ? <EmptyChart message="Nenhum treinamento criado ainda" /> : (
                    <ResponsiveContainer width="100%" height={Math.max(220, top_scenarios.length * 38)}>
                        <BarChart data={top_scenarios} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis
                                type="category" dataKey="title" width={200}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickFormatter={t => t && t.length > 32 ? `${t.slice(0, 32)}…` : t}
                            />
                            <Tooltip formatter={v => [v, 'Usos']} />
                            <Bar dataKey="count" name="Usos" fill={CHART_BLUE} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCard>

            {/* Row 5: Evaluation ratings + would_recommend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ChartCard title="Avaliações Médias" className="lg:col-span-2">
                    {evaluation_ratings.total_evaluations === 0
                        ? <EmptyChart message="Nenhuma avaliação enviada ainda" />
                        : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={[
                                        { label: 'Treinamento', value: evaluation_ratings.avg_overall },
                                        { label: 'Cenário',     value: evaluation_ratings.avg_scenario },
                                        { label: 'Dificuldade', value: evaluation_ratings.avg_difficulty },
                                    ]}
                                    margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip formatter={v => [`${v} / 5`, 'Média']} />
                                    <Bar dataKey="value" name="Média" radius={[4, 4, 0, 0]}>
                                        <Cell fill={CHART_BLUE} />
                                        <Cell fill={CHART_INDIGO} />
                                        <Cell fill="#8b5cf6" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )
                    }
                </ChartCard>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col items-center justify-center gap-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Recomendariam o Treinamento
                    </p>
                    {evaluation_ratings.total_evaluations === 0
                        ? <p className="text-5xl font-bold text-slate-300">—</p>
                        : (
                            <>
                                <p className="text-5xl font-bold text-emerald-500">
                                    {evaluation_ratings.would_recommend_pct}%
                                </p>
                                <p className="text-xs text-slate-400 text-center">
                                    de {evaluation_ratings.total_evaluations} avaliação{evaluation_ratings.total_evaluations !== 1 ? 'ões' : ''}
                                </p>
                            </>
                        )
                    }
                </div>
            </div>

            {/* Row 6: Top 5 facilitators */}
            <ChartCard title="Top 5 Facilitadores por Treinamentos Criados">
                {top_facilitators.length === 0 ? <EmptyChart message="Nenhum facilitador encontrado" /> : (
                    <ResponsiveContainer width="100%" height={Math.max(180, top_facilitators.length * 44)}>
                        <BarChart data={top_facilitators} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis
                                type="category" dataKey="nickname" width={120}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickFormatter={v => `@${v}`}
                            />
                            <Tooltip
                                formatter={v => [v, 'Treinamentos']}
                                labelFormatter={l => `@${l}`}
                            />
                            <Bar dataKey="count" name="Treinamentos" fill={CHART_INDIGO} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCard>
        </div>
    );
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview');
    const [csrfToken, setCsrfToken] = useState(null);

    // Users tab state
    const [users, setUsers] = useState([]);
    const [usersPagination, setUsersPagination] = useState(null);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersPage, setUsersPage] = useState(1);

    // Overview tab state
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    // Trainings tab state
    const [trainings, setTrainings] = useState([]);
    const [trainingsPagination, setTrainingsPagination] = useState(null);
    const [trainingsLoading, setTrainingsLoading] = useState(false);
    const [trainingsSearch, setTrainingsSearch] = useState('');
    const [trainingsStatusFilter, setTrainingsStatusFilter] = useState('all');
    const [trainingsPage, setTrainingsPage] = useState(1);

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        type: null,   // 'user' | 'training'
        id: null,
        name: null,
    });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auth guard
    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (status === 'authenticated' && !session?.user?.admin) router.push('/dashboard');
    }, [status, session, router]);

    // Fetch CSRF token
    useEffect(() => {
        fetch('/api/csrf')
            .then(r => r.json())
            .then(d => { if (d.success) setCsrfToken(d.csrf_token); });
    }, []);

    // --- Stats (Overview) ---
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        setStatsError(null);
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) setStats(data);
            else setStatsError(data.message);
        } catch {
            setStatsError('Erro ao buscar estatísticas');
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' && status === 'authenticated' && session?.user?.admin && !stats) {
            fetchStats();
        }
    }, [activeTab, status, session, stats, fetchStats]);

    // --- Users ---
    const fetchUsers = useCallback(async (page = 1, search = '') => {
        setUsersLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page, limit: 20, search });
            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setUsersPagination(data.pagination);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Erro ao buscar usuários');
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // Debounce users search
    useEffect(() => {
        if (activeTab !== 'users') return;
        const timer = setTimeout(() => {
            setUsersPage(1);
            fetchUsers(1, usersSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [usersSearch, activeTab, fetchUsers]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers(usersPage, usersSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usersPage]);

    // Load users on tab switch
    useEffect(() => {
        if (activeTab === 'users' && status === 'authenticated' && session?.user?.admin) {
            fetchUsers(1, '');
            setUsersSearch('');
            setUsersPage(1);
        }
    }, [activeTab, status, session, fetchUsers]);

    const handleToggleFacilitator = async (userId, currentValue) => {
        if (!csrfToken) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
                body: JSON.stringify({ facilitator: !currentValue }),
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, facilitator: data.user.facilitator } : u));
            } else {
                setError(data.message);
            }
        } catch {
            setError('Erro ao atualizar usuário');
        }
    };

    // --- Trainings ---
    const fetchTrainings = useCallback(async (page = 1, search = '', statusFilter = 'all') => {
        setTrainingsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page, limit: 20, search, status: statusFilter });
            const res = await fetch(`/api/admin/trainings?${params}`);
            const data = await res.json();
            if (data.success) {
                setTrainings(data.trainings);
                setTrainingsPagination(data.pagination);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Erro ao buscar treinamentos');
        } finally {
            setTrainingsLoading(false);
        }
    }, []);

    // Debounce trainings search
    useEffect(() => {
        if (activeTab !== 'trainings') return;
        const timer = setTimeout(() => {
            setTrainingsPage(1);
            fetchTrainings(1, trainingsSearch, trainingsStatusFilter);
        }, 400);
        return () => clearTimeout(timer);
    }, [trainingsSearch, trainingsStatusFilter, activeTab, fetchTrainings]);

    useEffect(() => {
        if (activeTab === 'trainings') fetchTrainings(trainingsPage, trainingsSearch, trainingsStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trainingsPage]);

    // Load trainings on tab switch
    useEffect(() => {
        if (activeTab === 'trainings' && status === 'authenticated' && session?.user?.admin) {
            fetchTrainings(1, '', 'all');
            setTrainingsSearch('');
            setTrainingsStatusFilter('all');
            setTrainingsPage(1);
        }
    }, [activeTab, status, session, fetchTrainings]);

    // --- Delete ---
    const openDeleteModal = (type, id, name) => {
        setDeleteModal({ open: true, type, id, name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, type: null, id: null, name: null });
    };

    const handleDeleteConfirm = async () => {
        if (!csrfToken || !deleteModal.id) return;
        setDeleteLoading(true);
        setError(null);
        try {
            const url = deleteModal.type === 'user'
                ? `/api/admin/users/${deleteModal.id}`
                : `/api/admin/trainings/${deleteModal.id}`;

            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'X-CSRF-Token': csrfToken },
            });
            const data = await res.json();
            if (data.success) {
                closeDeleteModal();
                if (deleteModal.type === 'user') {
                    fetchUsers(usersPage, usersSearch);
                } else {
                    fetchTrainings(trainingsPage, trainingsSearch, trainingsStatusFilter);
                }
            } else {
                setError(data.message);
                closeDeleteModal();
            }
        } catch {
            setError('Erro ao deletar');
            closeDeleteModal();
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (status === 'loading' || (status === 'authenticated' && !session?.user?.admin)) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <FaSpinner className="animate-spin text-2xl text-slate-400" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-linear-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25">
                        <FaCrown className="text-xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
                        <p className="text-sm text-slate-500">Gerencie usuários e treinamentos da plataforma</p>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <FaExclamationTriangle className="shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto"><FaTimes /></button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'overview'
                                ? 'border-rose-500 text-rose-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <FaChartBar /> Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'users'
                                ? 'border-rose-500 text-rose-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <FaUsers /> Usuários
                    </button>
                    <button
                        onClick={() => setActiveTab('trainings')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'trainings'
                                ? 'border-rose-500 text-rose-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <FaBook /> Treinamentos
                    </button>
                </div>

                {/* ---- OVERVIEW TAB ---- */}
                {activeTab === 'overview' && (
                    <OverviewTab
                        stats={stats}
                        loading={statsLoading}
                        error={statsError}
                        onRetry={fetchStats}
                    />
                )}

                {/* ---- USERS TAB ---- */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                value={usersSearch}
                                onChange={e => setUsersSearch(e.target.value)}
                                placeholder="Buscar por nome, email ou nickname..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                            />
                            {usersSearch && (
                                <button onClick={() => setUsersSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                            {usersLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <FaSpinner className="animate-spin text-xl text-slate-400" />
                                </div>
                            ) : users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                                    <FaUsers className="text-3xl" />
                                    <p className="text-sm">Nenhum usuário encontrado</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nickname</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facilitador</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map(user => (
                                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                                    <td className="px-4 py-3 text-slate-500">@{user.nickname}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleToggleFacilitator(user.id, user.facilitator)}
                                                            title={user.facilitator ? 'Remover facilitador' : 'Tornar facilitador'}
                                                            className="text-2xl transition-colors"
                                                        >
                                                            {user.facilitator
                                                                ? <FaToggleOn className="text-green-500 hover:text-green-600" />
                                                                : <FaToggleOff className="text-slate-300 hover:text-slate-400" />
                                                            }
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {user.admin
                                                            ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full"><FaCrown className="text-[10px]" /> Admin</span>
                                                            : <span className="text-slate-300">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {user.id !== session?.user?.id && !user.admin && (
                                                            <button
                                                                onClick={() => openDeleteModal('user', user.id, user.name)}
                                                                title="Deletar usuário"
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {usersPagination && usersPagination.total_pages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    {usersPagination.total_items} usuário{usersPagination.total_items !== 1 ? 's' : ''}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                        disabled={!usersPagination.has_prev}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronLeft className="text-xs" />
                                    </button>
                                    <span className="text-sm text-slate-600">
                                        {usersPagination.current_page} / {usersPagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => setUsersPage(p => p + 1)}
                                        disabled={!usersPagination.has_next}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ---- TRAININGS TAB ---- */}
                {activeTab === 'trainings' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="text"
                                    value={trainingsSearch}
                                    onChange={e => setTrainingsSearch(e.target.value)}
                                    placeholder="Buscar por nome do treinamento..."
                                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                                />
                                {trainingsSearch && (
                                    <button onClick={() => setTrainingsSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                            <select
                                value={trainingsStatusFilter}
                                onChange={e => { setTrainingsStatusFilter(e.target.value); setTrainingsPage(1); }}
                                className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-slate-700"
                            >
                                <option value="all">Todos os status</option>
                                <option value="not_started">Não iniciado</option>
                                <option value="active">Em andamento</option>
                                <option value="paused">Pausado</option>
                                <option value="completed">Concluído</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                            {trainingsLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <FaSpinner className="animate-spin text-xl text-slate-400" />
                                </div>
                            ) : trainings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                                    <FaBook className="text-3xl" />
                                    <p className="text-sm">Nenhum treinamento encontrado</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cenário</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Criador</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Participantes</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Criado em</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {trainings.map(training => (
                                                <tr key={training.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-800 max-w-50 truncate" title={training.name}>
                                                        {training.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[training.status] || 'bg-slate-100 text-slate-600'}`}>
                                                            {STATUS_LABELS[training.status] || training.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 max-w-40 truncate" title={training.scenario?.title}>
                                                        {training.scenario?.title || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {training.created_by?.nickname ? `@${training.created_by.nickname}` : training.created_by?.name || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-slate-600">
                                                        {training.participants_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {formatDate(training.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => openDeleteModal('training', training.id, training.name)}
                                                            title="Deletar treinamento"
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {trainingsPagination && trainingsPagination.total_pages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    {trainingsPagination.total_items} treinamento{trainingsPagination.total_items !== 1 ? 's' : ''}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTrainingsPage(p => Math.max(1, p - 1))}
                                        disabled={!trainingsPagination.has_prev}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronLeft className="text-xs" />
                                    </button>
                                    <span className="text-sm text-slate-600">
                                        {trainingsPagination.current_page} / {trainingsPagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => setTrainingsPage(p => p + 1)}
                                        disabled={!trainingsPagination.has_next}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-xl">
                                <FaExclamationTriangle className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {deleteModal.type === 'user' ? 'Deletar Usuário' : 'Deletar Treinamento'}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                            Tem certeza que deseja deletar <span className="font-semibold text-slate-800">{deleteModal.name}</span>?
                        </p>
                        <p className="text-xs text-slate-500 mb-6">
                            {deleteModal.type === 'user'
                                ? 'Isso removerá o usuário de todos os treinamentos e apagará suas respostas e avaliações. Esta ação não pode ser desfeita.'
                                : 'Isso apagará o treinamento, todas as respostas e avaliações associadas permanentemente. Esta ação não pode ser desfeita.'
                            }
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleteLoading && <FaSpinner className="animate-spin text-xs" />}
                                Confirmar Exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
