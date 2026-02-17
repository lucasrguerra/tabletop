'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FaTrophy, FaMedal, FaStar, FaSync, FaCheck, FaTimes, FaCrown } from 'react-icons/fa';

const PODIUM_STYLES = {
	1: {
		bg: 'bg-linear-to-br from-amber-50 to-yellow-50',
		border: 'border-amber-300',
		badge: 'bg-linear-to-br from-amber-400 to-yellow-500 text-white',
		text: 'text-amber-700',
		icon: FaTrophy,
		glow: 'shadow-amber-200/60',
	},
	2: {
		bg: 'bg-linear-to-br from-slate-50 to-gray-100',
		border: 'border-slate-300',
		badge: 'bg-linear-to-br from-slate-400 to-gray-500 text-white',
		text: 'text-slate-600',
		icon: FaMedal,
		glow: 'shadow-slate-200/60',
	},
	3: {
		bg: 'bg-linear-to-br from-orange-50 to-amber-50',
		border: 'border-orange-300',
		badge: 'bg-linear-to-br from-orange-400 to-amber-500 text-white',
		text: 'text-orange-700',
		icon: FaMedal,
		glow: 'shadow-orange-200/60',
	},
};

function PositionBadge({ position }) {
	const style = PODIUM_STYLES[position];

	if (style) {
		const Icon = style.icon;
		return (
			<div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${style.badge} shadow-lg ${style.glow}`}>
				<Icon className="text-lg sm:text-xl" />
			</div>
		);
	}

	return (
		<div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 border border-slate-200 font-bold text-sm sm:text-base">
			{position}
		</div>
	);
}

function StatusIndicator({ status }) {
	const config = {
		not_started: { label: 'Aguardando início', className: 'bg-slate-100 text-slate-600 border-slate-200' },
		active: { label: 'Em andamento', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
		paused: { label: 'Pausado', className: 'bg-amber-100 text-amber-700 border-amber-200' },
		completed: { label: 'Concluído', className: 'bg-blue-100 text-blue-700 border-blue-200' },
	};

	const s = config[status] || config.not_started;

	return (
		<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.className}`}>
			{status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
			{s.label}
		</span>
	);
}

function RankingRow({ entry, index }) {
	const style = PODIUM_STYLES[entry.position];
	const isTopThree = entry.position <= 3;
	const percentage = entry.total_possible > 0
		? Math.round((entry.total_points / entry.total_possible) * 100)
		: 0;

	return (
		<div
			className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${
				isTopThree
					? `${style.bg} ${style.border} shadow-md ${style.glow}`
					: 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
			}`}
			style={{ animationDelay: `${index * 60}ms` }}
		>
			<PositionBadge position={entry.position} />

			<div className="flex-1 min-w-0">
				<p className={`font-bold truncate text-sm sm:text-base ${
					isTopThree ? style.text : 'text-slate-900'
				}`}>
					{entry.nickname}
				</p>
				<div className="flex items-center gap-3 mt-0.5">
					<span className="text-xs text-slate-500 flex items-center gap-1">
						<FaCheck className="text-emerald-500 text-[10px]" />
						{entry.correct_count}
					</span>
					{entry.total_responses > 0 && entry.total_responses > entry.correct_count && (
						<span className="text-xs text-slate-400 flex items-center gap-1">
							<FaTimes className="text-red-400 text-[10px]" />
							{entry.total_responses - entry.correct_count}
						</span>
					)}
					{entry.total_possible > 0 && (
						<span className="text-xs text-slate-400">
							{percentage}%
						</span>
					)}
				</div>
			</div>

			<div className="text-right shrink-0">
				<p className={`text-lg sm:text-xl font-extrabold tabular-nums ${
					isTopThree ? style.text : 'text-slate-900'
				}`}>
					{entry.total_points}
				</p>
				<p className="text-[10px] sm:text-xs text-slate-400 font-medium">pontos</p>
			</div>
		</div>
	);
}

export default function RankingPage() {
	const params = useParams();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);
	const intervalRef = useRef(null);

	const fetchRanking = useCallback(async (showLoading = false) => {
		try {
			if (showLoading) setLoading(true);
			setError(null);

			const response = await fetch(`/api/trainings/${params.id}/ranking`, {
				method: 'GET',
				headers: { 'Accept': 'application/json' },
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.message || 'Erro ao carregar ranking');
			}

			const result = await response.json();
			if (result.success) {
				setData(result);
				setLastUpdated(new Date());
			}
		} catch (err) {
			console.error('Error fetching ranking:', err);
			setError(err.message);
		} finally {
			if (showLoading) setLoading(false);
		}
	}, [params.id]);

	// Initial load
	useEffect(() => {
		fetchRanking(true);
	}, [fetchRanking]);

	// Poll every 3 seconds while training is active or paused
	useEffect(() => {
		if (!data) return;

		const status = data.training?.status;
		if (status === 'active' || status === 'paused') {
			intervalRef.current = setInterval(() => fetchRanking(false), 3000);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [data?.training?.status, fetchRanking]);

	// ── Loading state ──
	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
					<p className="text-slate-500 text-sm">Carregando ranking...</p>
				</div>
			</div>
		);
	}

	// ── Error state ──
	if (error && !data) {
		return (
			<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
					<div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<FaTimes className="text-red-500 text-xl" />
					</div>
					<h2 className="text-lg font-bold text-slate-900 mb-2">Erro ao carregar</h2>
					<p className="text-sm text-slate-500 mb-6">{error}</p>
					<button
						onClick={() => fetchRanking(true)}
						className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	const training = data?.training;
	const ranking = data?.ranking || [];
	const leader = ranking[0];

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50">
			<div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
				{/* ── Header ── */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-300/40 mb-4">
						<FaCrown className="text-white text-2xl" />
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1.5">
						{training?.name || 'Ranking'}
					</h1>
					<div className="flex items-center justify-center gap-3">
						<StatusIndicator status={training?.status} />
					</div>
				</div>

				{/* ── Leader highlight ── */}
				{leader && leader.total_points > 0 && (
					<div className="mb-6 p-5 sm:p-6 bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200 shadow-md shadow-amber-100/50 text-center">
						<div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full shadow-lg shadow-amber-300/50 mb-3">
							<FaTrophy className="text-white text-2xl" />
						</div>
						<p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Líder</p>
						<p className="text-xl sm:text-2xl font-extrabold text-amber-800">{leader.nickname}</p>
						<p className="text-amber-600 font-bold text-lg mt-0.5">
							{leader.total_points} <span className="text-sm font-medium">pontos</span>
						</p>
					</div>
				)}

				{/* ── Ranking list ── */}
				{ranking.length === 0 ? (
					<div className="text-center py-16">
						<FaStar className="text-slate-300 text-4xl mx-auto mb-3" />
						<p className="text-slate-500 font-medium">Nenhum participante ainda</p>
						<p className="text-slate-400 text-sm mt-1">O ranking será exibido quando houver participantes</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{ranking.map((entry, index) => (
							<RankingRow key={`${entry.position}-${entry.nickname}`} entry={entry} index={index} />
						))}
					</div>
				)}

				{/* ── Footer info ── */}
				<div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
					<FaSync className={`text-[10px] ${data?.training?.status === 'active' ? 'animate-spin' : ''}`} />
					<span>
						{data?.training?.status === 'active' || data?.training?.status === 'paused'
							? 'Atualização automática a cada 3s'
							: 'Ranking final'}
					</span>
					{lastUpdated && (
						<>
							<span>·</span>
							<span>
								{lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
							</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
