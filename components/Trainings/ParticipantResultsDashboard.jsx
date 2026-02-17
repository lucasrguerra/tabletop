'use client';

import { useMemo } from 'react';
import {
	FaTrophy, FaPercent, FaClock,
	FaBolt, FaChartBar, FaArrowUp, FaArrowDown, FaMinus, FaStar,
	FaFire, FaChartLine, FaStopwatch, FaListOl
} from 'react-icons/fa';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
	RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
	PieChart, Pie, Cell,
} from 'recharts';

const TYPE_LABELS = {
	'multiple-choice': 'Múltipla Escolha',
	'true-false': 'V ou F',
	'numeric': 'Numérica',
	'matching': 'Correspondência',
	'ordering': 'Ordenação',
};

function formatDuration(ms) {
	if (!ms || ms <= 0) return '—';
	const totalSec = Math.floor(ms / 1000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	if (h > 0) return `${h}h ${m}m ${s}s`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
}

function ComparisonIndicator({ userValue, avgValue, higherIsBetter = true, suffix = '' }) {
	if (avgValue === null || avgValue === undefined || userValue === null || userValue === undefined) return null;

	const diff = userValue - avgValue;
	const pctDiff = avgValue > 0 ? Math.round(Math.abs(diff / avgValue) * 100) : 0;

	if (Math.abs(diff) < 0.5) {
		return (
			<span className="inline-flex items-center gap-1 text-xs text-slate-500" role="status">
				<FaMinus className="text-[9px]" aria-hidden="true" /> Na média
			</span>
		);
	}

	const isAbove = diff > 0;
	const isGood = higherIsBetter ? isAbove : !isAbove;

	return (
		<span className={`inline-flex items-center gap-1 text-xs font-medium ${isGood ? 'text-emerald-600' : 'text-red-500'}`} role="status">
			{isAbove ? <FaArrowUp className="text-[9px]" aria-hidden="true" /> : <FaArrowDown className="text-[9px]" aria-hidden="true" />}
			{pctDiff}% {isAbove ? 'acima' : 'abaixo'} da média{suffix}
		</span>
	);
}

function PositionBadge({ position, total }) {
	if (!position) return null;

	const medals = {
		1: { emoji: '🥇', bg: 'from-amber-400 to-yellow-500', text: 'text-amber-900', label: '1º Lugar' },
		2: { emoji: '🥈', bg: 'from-slate-300 to-gray-400', text: 'text-slate-800', label: '2º Lugar' },
		3: { emoji: '🥉', bg: 'from-amber-600 to-orange-700', text: 'text-amber-100', label: '3º Lugar' },
	};

	const medal = medals[position];

	if (medal) {
		return (
			<div className="text-center" aria-label={`${medal.label} de ${total} participantes`}>
				<div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br ${medal.bg} shadow-lg mb-2`} aria-hidden="true">
					<span className="text-4xl" role="img" aria-label={`Medalha de ${medal.label}`}>{medal.emoji}</span>
				</div>
				<p className={`text-lg font-bold text-white`}>{medal.label}</p>
				<p className="text-sm text-white/70">de {total} participantes</p>
			</div>
		);
	}

	return (
		<div className="text-center" aria-label={`${position}º Lugar de ${total} participantes`}>
			<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-slate-100 to-slate-200 shadow-md mb-2" aria-hidden="true">
				<span className="text-2xl font-bold text-slate-700">{position}º</span>
			</div>
			<p className="text-lg font-bold text-white">{position}º Lugar</p>
			<p className="text-sm text-white/70">de {total} participantes</p>
		</div>
	);
}

function CustomTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm" role="tooltip">
			<p className="font-semibold text-slate-900 mb-1">{label}</p>
			{payload.map((entry, i) => (
				<p key={i} style={{ color: entry.color }} className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} aria-hidden="true" />
					{entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
				</p>
			))}
		</div>
	);
}

/**
 * ParticipantResultsDashboard
 * Displays comprehensive post-training results for a participant.
 * Shows personal stats, ranking, comparison with anonymous averages,
 * per-round breakdown, and performance insights.
 *
 * @param {Object} results - Results data from GET /api/trainings/[id]/results
 * @param {Array} rounds - Scenario rounds (for titles)
 */
export default function ParticipantResultsDashboard({ results, rounds = [] }) {
	const data = useMemo(() => {
		if (!results) return null;

		const { personal, ranking, general, per_round, type_stats, training_duration } = results;

		// Round chart data
		const roundChartData = per_round.map(r => ({
			name: `R${r.round_id + 1}`,
			fullName: rounds[r.round_id]?.title || `Rodada ${r.round_id + 1}`,
			'Você (%)': r.accuracy,
			'Média Geral (%)': r.general_avg_accuracy,
		}));

		// Radar chart data for round performance
		const radarData = per_round.map(r => ({
			round: `R${r.round_id + 1}`,
			'Seu Aproveitamento': r.accuracy,
			'Média Geral': r.general_avg_accuracy,
		}));

		// Pie data
		const pieData = personal.total_responses > 0
			? [
				{ name: 'Corretas', value: personal.correct_count },
				{ name: 'Incorretas', value: personal.incorrect_count },
			]
			: [];

		// Type chart data
		const typeChartData = (type_stats || []).map(t => ({
			name: TYPE_LABELS[t.type] || t.type,
			'Aproveitamento (%)': t.accuracy,
			'Questões': t.total,
		}));

		// Performance level
		let performanceLevel;
		if (personal.accuracy >= 90) {
			performanceLevel = { label: 'Excelente', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: FaFire };
		} else if (personal.accuracy >= 70) {
			performanceLevel = { label: 'Muito Bom', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: FaStar };
		} else if (personal.accuracy >= 50) {
			performanceLevel = { label: 'Bom', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: FaChartLine };
		} else {
			performanceLevel = { label: 'Em Desenvolvimento', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: FaChartBar };
		}

		// Speed comparison
		const isFaster = general.avg_response_interval && personal.avg_response_interval
			? personal.avg_response_interval < general.avg_response_interval
			: null;

		// Best and worst rounds
		const sortedRounds = [...per_round].sort((a, b) => b.accuracy - a.accuracy);
		const bestRound = sortedRounds.length > 0 ? sortedRounds[0] : null;
		const worstRound = sortedRounds.length > 1 ? sortedRounds[sortedRounds.length - 1] : null;

		return {
			personal,
			ranking,
			general,
			per_round,
			type_stats: type_stats || [],
			training_duration,
			roundChartData,
			radarData,
			pieData,
			typeChartData,
			performanceLevel,
			isFaster,
			bestRound,
			worstRound,
		};
	}, [results, rounds]);

	if (!data) return null;

	const { personal, ranking, general, per_round, performanceLevel, isFaster, bestRound, worstRound } = data;
	const PerformanceIcon = performanceLevel.icon;

	return (
		<section className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden" aria-labelledby="results-heading">
			{/* ── HERO BANNER ── */}
			<div className="bg-linear-to-br from-indigo-600 via-blue-600 to-purple-700 px-6 py-8 lg:px-10 lg:py-10 text-white" role="banner">
				<div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
					{/* Position badge */}
					<div className="shrink-0">
						<PositionBadge position={ranking.position} total={ranking.total_participants} />
					</div>

					{/* Core stats */}
					<div className="flex-1 text-center lg:text-left">
						<h3 id="results-heading" className="text-2xl lg:text-3xl font-bold mb-1">Seus Resultados</h3>
						<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${performanceLevel.bg} mb-4`}>
							<PerformanceIcon className={`text-sm ${performanceLevel.color}`} aria-hidden="true" />
							<span className={`text-sm font-semibold ${performanceLevel.color}`}>
								{performanceLevel.label}
							</span>
						</div>

						<dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<div>
								<dd className="text-3xl lg:text-4xl font-bold">{personal.accuracy}%</dd>
								<dt className="text-sm text-white/70">Aproveitamento</dt>
							</div>
							<div>
								<dd className="text-3xl lg:text-4xl font-bold">
									{personal.total_points_earned}
									<span className="text-lg text-white/70" aria-label={`de ${personal.total_points_possible}`}>/{personal.total_points_possible}</span>
								</dd>
								<dt className="text-sm text-white/70">Pontos</dt>
							</div>
							<div>
								<dd className="text-3xl lg:text-4xl font-bold">{personal.correct_count}</dd>
								<dt className="text-sm text-white/70">Acertos</dt>
							</div>
							<div>
								<dd className="text-3xl lg:text-4xl font-bold">{personal.total_responses}</dd>
								<dt className="text-sm text-white/70">Respostas</dt>
							</div>
						</dl>
					</div>
				</div>
			</div>

			{/* ── CONTENT ── */}
			<div className="p-6 lg:p-8 space-y-8">

				{/* ── COMPARISON CARDS ── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="group" aria-label="Comparação com a média geral">
					{/* Accuracy vs average */}
					<div className="p-4 rounded-xl bg-blue-50 border border-blue-100" aria-label={`Aproveitamento: ${personal.accuracy}%, média geral ${general.avg_accuracy}%`}>
						<div className="flex items-center gap-2 mb-2">
							<div className="p-1.5 rounded-lg bg-blue-100" aria-hidden="true">
								<FaPercent className="text-blue-600 text-sm" aria-hidden="true" />
							</div>
							<span className="text-xs font-semibold text-blue-700 uppercase">Aproveitamento</span>
						</div>
						<p className="text-2xl font-bold text-slate-900">{personal.accuracy}%</p>
						<p className="text-xs text-slate-500 mt-1">Média geral: {general.avg_accuracy}%</p>
						<div className="mt-2">
							<ComparisonIndicator
								userValue={personal.accuracy}
								avgValue={general.avg_accuracy}
								higherIsBetter={true}
							/>
						</div>
					</div>

					{/* Points vs average */}
					<div className="p-4 rounded-xl bg-amber-50 border border-amber-100" aria-label={`Pontuação: ${personal.total_points_earned} pontos, média ${general.avg_points_per_user} pontos`}>
						<div className="flex items-center gap-2 mb-2">
							<div className="p-1.5 rounded-lg bg-amber-100" aria-hidden="true">
								<FaTrophy className="text-amber-600 text-sm" aria-hidden="true" />
							</div>
							<span className="text-xs font-semibold text-amber-700 uppercase">Pontuação</span>
						</div>
						<p className="text-2xl font-bold text-slate-900">{personal.total_points_earned} pts</p>
						<p className="text-xs text-slate-500 mt-1">Média: {general.avg_points_per_user} pts</p>
						<div className="mt-2">
							<ComparisonIndicator
								userValue={personal.total_points_earned}
								avgValue={general.avg_points_per_user}
								higherIsBetter={true}
							/>
						</div>
					</div>

					{/* Speed comparison */}
					<div className="p-4 rounded-xl bg-purple-50 border border-purple-100" aria-label={`Velocidade: tempo médio de resposta ${formatDuration(personal.avg_response_interval)}, média geral ${formatDuration(general.avg_response_interval)}`}>
						<div className="flex items-center gap-2 mb-2">
							<div className="p-1.5 rounded-lg bg-purple-100" aria-hidden="true">
								<FaBolt className="text-purple-600 text-sm" aria-hidden="true" />
							</div>
							<span className="text-xs font-semibold text-purple-700 uppercase">Velocidade</span>
						</div>
						<p className="text-2xl font-bold text-slate-900">
							{formatDuration(personal.avg_response_interval)}
						</p>
						<p className="text-xs text-slate-500 mt-1">
							Média: {formatDuration(general.avg_response_interval)}
						</p>
						{isFaster !== null && (
							<div className="mt-2">
								<span className={`inline-flex items-center gap-1 text-xs font-medium ${isFaster ? 'text-emerald-600' : 'text-red-500'}`} role="status">
									{isFaster ? <FaBolt className="text-[9px]" aria-hidden="true" /> : <FaClock className="text-[9px]" aria-hidden="true" />}
									{isFaster ? 'Mais rápido' : 'Mais lento'} que a média
								</span>
							</div>
						)}
					</div>

					{/* Active time */}
					<div className="p-4 rounded-xl bg-teal-50 border border-teal-100" aria-label={`Tempo ativo: ${formatDuration(personal.active_time)}, média ${formatDuration(general.avg_active_time)}`}>
						<div className="flex items-center gap-2 mb-2">
							<div className="p-1.5 rounded-lg bg-teal-100" aria-hidden="true">
								<FaStopwatch className="text-teal-600 text-sm" aria-hidden="true" />
							</div>
							<span className="text-xs font-semibold text-teal-700 uppercase">Tempo Ativo</span>
						</div>
						<p className="text-2xl font-bold text-slate-900">
							{formatDuration(personal.active_time)}
						</p>
						<p className="text-xs text-slate-500 mt-1">
							Média: {formatDuration(general.avg_active_time)}
						</p>
						{general.avg_active_time && personal.active_time > 0 && (
							<div className="mt-2">
								<ComparisonIndicator
									userValue={personal.active_time}
									avgValue={general.avg_active_time}
									higherIsBetter={false}
								/>
							</div>
						)}
					</div>
				</div>

				{/* ── INSIGHTS ROW ── */}
				{(bestRound || worstRound) && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-label="Destaques de desempenho">
						{bestRound && (
							<div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
								<div className="p-3 rounded-xl bg-emerald-100" aria-hidden="true">
									<FaArrowUp className="text-emerald-600 text-lg" aria-hidden="true" />
								</div>
								<div>
									<p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Melhor Rodada</p>
									<p className="text-sm font-bold text-slate-900 mt-0.5">
										Rodada {bestRound.round_id + 1}
										{rounds[bestRound.round_id] && ` — ${rounds[bestRound.round_id].title}`}
									</p>
									<p className="text-xs text-slate-500 mt-0.5">
										{bestRound.accuracy}% de aproveitamento · {bestRound.correct_count} acertos
									</p>
								</div>
							</div>
						)}
						{worstRound && worstRound.round_id !== bestRound?.round_id && (
							<div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
								<div className="p-3 rounded-xl bg-orange-100" aria-hidden="true">
									<FaArrowDown className="text-orange-600 text-lg" aria-hidden="true" />
								</div>
								<div>
									<p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Rodada Mais Difícil</p>
									<p className="text-sm font-bold text-slate-900 mt-0.5">
										Rodada {worstRound.round_id + 1}
										{rounds[worstRound.round_id] && ` — ${rounds[worstRound.round_id].title}`}
									</p>
									<p className="text-xs text-slate-500 mt-0.5">
										{worstRound.accuracy}% de aproveitamento · {worstRound.correct_count} acertos
									</p>
								</div>
							</div>
						)}
					</div>
				)}

				{/* ── PER-ROUND ACCURACY CHART (You vs Average) ── */}
				{data.roundChartData.length > 1 && (
					<section aria-labelledby="round-accuracy-heading">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2.5 rounded-xl bg-indigo-100" aria-hidden="true">
								<FaChartBar className="text-xl text-indigo-600" aria-hidden="true" />
							</div>
							<div>
								<h4 id="round-accuracy-heading" className="text-lg font-bold text-slate-900">Aproveitamento por Rodada</h4>
								<p className="text-sm text-slate-500">Comparação com a média geral dos participantes</p>
							</div>
						</div>

						<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50" role="img" aria-label={`Gráfico de barras mostrando aproveitamento por rodada. ${data.roundChartData.map(r => `${r.fullName}: você ${r['Você (%)']}%, média ${r['Média Geral (%)']}%`).join('. ')}`}>
							<ResponsiveContainer width="100%" height={260}>
								<BarChart data={data.roundChartData} barGap={4}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
									<XAxis dataKey="name" tick={{ fontSize: 12 }} />
									<YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
									<Tooltip content={<CustomTooltip />} />
									<Legend wrapperStyle={{ fontSize: '12px' }} />
									<Bar dataKey="Você (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
									<Bar dataKey="Média Geral (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</section>
				)}

				{/* ── CHARTS ROW: Pie + Radar ── */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Accuracy pie */}
					{data.pieData.length > 0 && (
						<div>
							<p className="text-sm font-semibold text-slate-700 mb-3" id="pie-chart-label">Distribuição de Respostas</p>
							<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50" role="img" aria-labelledby="pie-chart-label" aria-describedby="pie-chart-desc">
								<p id="pie-chart-desc" className="sr-only">
									{personal.correct_count} respostas corretas ({personal.total_responses > 0 ? Math.round(personal.correct_count / personal.total_responses * 100) : 0}%) e {personal.incorrect_count} incorretas ({personal.total_responses > 0 ? Math.round(personal.incorrect_count / personal.total_responses * 100) : 0}%)
								</p>
								<ResponsiveContainer width="100%" height={220}>
									<PieChart>
										<Pie
											data={data.pieData}
											cx="50%"
											cy="50%"
											innerRadius={55}
											outerRadius={85}
											paddingAngle={3}
											dataKey="value"
											label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
										>
											<Cell fill="#10b981" />
											<Cell fill="#ef4444" />
										</Pie>
										<Tooltip content={<CustomTooltip />} />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}

					{/* Radar chart */}
					{data.radarData.length >= 3 && (
						<div>
							<p className="text-sm font-semibold text-slate-700 mb-3" id="radar-chart-label">Perfil por Rodada</p>
							<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50" role="img" aria-labelledby="radar-chart-label" aria-describedby="radar-chart-desc">
								<p id="radar-chart-desc" className="sr-only">
									Gráfico radar comparando seu aproveitamento com a média por rodada. {data.radarData.map(r => `${r.round}: você ${r['Seu Aproveitamento']}%, média ${r['Média Geral']}%`).join('. ')}
								</p>
								<ResponsiveContainer width="100%" height={220}>
									<RadarChart data={data.radarData}>
										<PolarGrid stroke="#e2e8f0" />
										<PolarAngleAxis dataKey="round" tick={{ fontSize: 11 }} />
										<PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
										<Radar name="Você" dataKey="Seu Aproveitamento" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
										<Radar name="Média" dataKey="Média Geral" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
										<Legend wrapperStyle={{ fontSize: '11px' }} />
									</RadarChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
				</div>

				{/* ── PER-ROUND TABLE ── */}
				{per_round.length > 0 && (
					<section aria-labelledby="round-detail-heading">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2.5 rounded-xl bg-blue-100" aria-hidden="true">
								<FaListOl className="text-xl text-blue-600" aria-hidden="true" />
							</div>
							<div>
								<h4 id="round-detail-heading" className="text-lg font-bold text-slate-900">Detalhamento por Rodada</h4>
								<p className="text-sm text-slate-500">Desempenho detalhado em cada rodada do exercício</p>
							</div>
						</div>

						<div className="overflow-x-auto rounded-xl border border-slate-200" tabIndex="0" role="region" aria-label="Tabela de detalhamento por rodada">
							<table className="w-full text-sm">
								<caption className="sr-only">Desempenho detalhado em cada rodada: acertos, erros, pontos, aproveitamento, média e tempo</caption>
								<thead>
									<tr className="bg-slate-50 border-b border-slate-200">
										<th scope="col" className="text-left py-3 px-4 font-semibold text-slate-600 text-xs">Rodada</th>
										<th scope="col" className="text-center py-3 px-4 font-semibold text-slate-600 text-xs">Acertos</th>
										<th scope="col" className="text-center py-3 px-4 font-semibold text-slate-600 text-xs">Erros</th>
										<th scope="col" className="text-center py-3 px-4 font-semibold text-slate-600 text-xs">Pontos</th>
										<th scope="col" className="text-center py-3 px-4 font-semibold text-slate-600 text-xs">Seu %</th>
										<th scope="col" className="text-center py-3 px-4 font-semibold text-slate-600 text-xs">Média %</th>
										<th scope="col" className="text-center py-3 px-4 font-semibold text-slate-600 text-xs">Tempo</th>
									</tr>
								</thead>
								<tbody>
									{per_round.map(r => {
										const roundTitle = rounds[r.round_id]?.title || `Rodada ${r.round_id + 1}`;
										const aboveAvg = r.accuracy >= r.general_avg_accuracy;
										return (
											<tr key={r.round_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
												<td className="py-3 px-4">
													<p className="font-medium text-slate-900">R{r.round_id + 1}</p>
													<p className="text-xs text-slate-500 truncate max-w-45">{roundTitle}</p>
												</td>
												<td className="py-3 px-4 text-center">
													<span className="text-emerald-600 font-semibold">{r.correct_count}</span>
												</td>
												<td className="py-3 px-4 text-center">
													<span className="text-red-500 font-semibold">{r.incorrect_count}</span>
												</td>
												<td className="py-3 px-4 text-center text-slate-700 font-medium">
													{r.points_earned}/{r.points_possible}
												</td>
												<td className="py-3 px-4 text-center">
													<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
														r.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' :
														r.accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
														'bg-red-100 text-red-700'
													}`}>
														{r.accuracy}%
													</span>
												</td>
												<td className="py-3 px-4 text-center">
													<span className="text-xs text-slate-500">{r.general_avg_accuracy}%</span>
											<span className={`block text-[10px] mt-0.5 ${aboveAvg ? 'text-emerald-600' : 'text-red-500'}`} aria-label={`${Math.abs(r.accuracy - r.general_avg_accuracy).toFixed(1)} pontos percentuais ${aboveAvg ? 'acima' : 'abaixo'} da média`}>
												<span aria-hidden="true">{aboveAvg ? '▲' : '▼'}</span> {Math.abs(r.accuracy - r.general_avg_accuracy).toFixed(1)}pp
													</span>
												</td>
												<td className="py-3 px-4 text-center text-xs text-slate-600">
													{formatDuration(r.round_time)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</section>
				)}

				{/* ── TYPE BREAKDOWN ── */}
				{data.typeChartData.length > 1 && (
					<section aria-labelledby="type-breakdown-heading">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2.5 rounded-xl bg-purple-100" aria-hidden="true">
								<FaChartLine className="text-xl text-purple-600" aria-hidden="true" />
							</div>
							<div>
								<h4 id="type-breakdown-heading" className="text-lg font-bold text-slate-900">Por Tipo de Questão</h4>
								<p className="text-sm text-slate-500">Seu desempenho em cada formato de questão</p>
							</div>
						</div>
						<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
							{data.type_stats.map(t => (
								<li key={t.type} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100" aria-label={`${TYPE_LABELS[t.type] || t.type}: ${t.accuracy}% de aproveitamento, ${t.correct} de ${t.total} corretas`}>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-slate-700">
											{TYPE_LABELS[t.type] || t.type}
										</p>
										<p className="text-xs text-slate-400 mt-0.5">
											{t.correct}/{t.total} corretas · {t.points_earned}/{t.points_possible} pts
										</p>
									</div>
									<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
										t.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' :
										t.accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
										'bg-red-100 text-red-700'
									}`}>
										{t.accuracy}%
									</span>
								</li>
							))}
						</ul>
					</section>
				)}

				{/* ── TRAINING TIME INFO ── */}
				{data.training_duration > 0 && (
					<div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
						<FaClock className="text-slate-400 text-lg" aria-hidden="true" />
						<div>
							<p className="text-sm font-medium text-slate-700">Duração Total do Treinamento</p>
							<p className="text-xs text-slate-500">{formatDuration(data.training_duration)}</p>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
