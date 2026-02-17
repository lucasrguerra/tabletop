'use client';

import { useState, useMemo } from 'react';
import {
	FaChartBar, FaChartPie, FaUsers, FaUserGraduate, FaClock, FaTrophy,
	FaCheckCircle, FaTimes, FaPercent, FaStar, FaChevronDown,
	FaQuestionCircle, FaListOl, FaArrowUp, FaArrowDown, FaBolt, FaStopwatch
} from 'react-icons/fa';
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
	PieChart, Pie, Cell,
	Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';


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

function StatCard({ icon: Icon, label, value, sublabel, color = 'blue', className = '' }) {
	const colorClasses = {
		blue: 'bg-blue-50 border-blue-100 text-blue-600',
		emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
		red: 'bg-red-50 border-red-100 text-red-600',
		amber: 'bg-amber-50 border-amber-100 text-amber-600',
		purple: 'bg-purple-50 border-purple-100 text-purple-600',
		slate: 'bg-slate-50 border-slate-100 text-slate-600',
		teal: 'bg-teal-50 border-teal-100 text-teal-600',
		indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
	};
	const iconColors = {
		blue: 'bg-blue-100 text-blue-600',
		emerald: 'bg-emerald-100 text-emerald-600',
		red: 'bg-red-100 text-red-600',
		amber: 'bg-amber-100 text-amber-600',
		purple: 'bg-purple-100 text-purple-600',
		slate: 'bg-slate-100 text-slate-600',
		teal: 'bg-teal-100 text-teal-600',
		indigo: 'bg-indigo-100 text-indigo-600',
	};

	return (
		<div className={`p-4 rounded-xl border ${colorClasses[color]} ${className}`}>
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${iconColors[color]}`}>
					<Icon className="text-base" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-2xl font-bold text-slate-900">{value}</p>
					<p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
					{sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
				</div>
			</div>
		</div>
	);
}

function SectionHeader({ icon: Icon, title, subtitle, color = 'bg-blue-100 text-blue-600' }) {
	return (
		<div className="flex items-center gap-3 mb-5">
			<div className={`p-2.5 rounded-xl ${color}`}>
				<Icon className="text-xl" />
			</div>
			<div>
				<h4 className="text-lg font-bold text-slate-900">{title}</h4>
				{subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
			</div>
		</div>
	);
}

function ProgressBar({ value, max, color = 'bg-emerald-500', className = '' }) {
	const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
	return (
		<div className={`w-full bg-slate-100 rounded-full h-2.5 ${className}`}>
			<div
				className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

function CustomTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
			<p className="font-semibold text-slate-900 mb-1">{label}</p>
			{payload.map((entry, i) => (
				<p key={i} style={{ color: entry.color }} className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
					{entry.name}: <span className="font-semibold">{entry.value}{typeof entry.value === 'number' && entry.name?.includes('%') ? '' : ''}</span>
				</p>
			))}
		</div>
	);
}

/**
 * Computes all statistics from the available data.
 */
function useTrainingStats({ training, responses, summary, scenarioData, totalParticipants }) {
	return useMemo(() => {
		const rounds = scenarioData?.rounds || [];
		const allResponses = responses || [];

		// ===== GLOBAL STATS =====
		const totalQuestions = rounds.reduce((sum, r) => sum + (r.questions?.length || 0), 0);
		const totalPointsPossible = summary?.total_points_possible || 0;
		const totalPointsEarned = summary?.total_points_earned || 0;
		const globalAccuracy = summary?.percentage || 0;
		const totalResponses = summary?.total_responses || 0;
		const totalCorrect = summary?.correct_count || 0;
		const totalIncorrect = summary?.incorrect_count || 0;

		// Training time
		const trainingTimer = training?.training_timer || {};
		let trainingElapsed = trainingTimer.elapsed_time || 0;
		if (!trainingTimer.is_paused && trainingTimer.started_at) {
			trainingElapsed += Date.now() - new Date(trainingTimer.started_at).getTime();
		}

		// Completion rate
		const maxPossibleResponses = totalQuestions * totalParticipants;
		const completionRate = maxPossibleResponses > 0
			? Math.round((totalResponses / maxPossibleResponses) * 10000) / 100
			: 0;

		// ===== PER-ROUND STATS =====
		const roundStats = rounds.map((round, ri) => {
			const roundQuestions = round.questions || [];
			const roundResponses = allResponses.filter(r => r.round_id === ri);
			const roundCorrect = roundResponses.filter(r => r.is_correct).length;
			const roundIncorrect = roundResponses.length - roundCorrect;
			const roundPointsEarned = roundResponses.reduce((sum, r) => sum + r.points_earned, 0);
			const roundPointsPossible = roundResponses.reduce((sum, r) => sum + r.points_possible, 0);
			const roundPctCorrect = roundResponses.length > 0
				? Math.round((roundCorrect / roundResponses.length) * 10000) / 100
				: 0;
			const maxRoundResponses = roundQuestions.length * totalParticipants;
			const roundCompletion = maxRoundResponses > 0
				? Math.round((roundResponses.length / maxRoundResponses) * 10000) / 100
				: 0;

			// Per-question stats within round
			const questionStats = roundQuestions.map(q => {
				const qResponses = roundResponses.filter(r => r.question_id === q.id);
				const qCorrect = qResponses.filter(r => r.is_correct).length;
				const qAccuracy = qResponses.length > 0
					? Math.round((qCorrect / qResponses.length) * 10000) / 100
					: null;
				return {
					id: q.id,
					text: q.text,
					type: q.type || 'multiple-choice',
					points: q.points || 1,
					responseCount: qResponses.length,
					correctCount: qCorrect,
					accuracy: qAccuracy,
				};
			});

			// Sort to find hardest/easiest
			const answered = questionStats.filter(q => q.accuracy !== null);
			const hardest = answered.length > 0
				? answered.reduce((min, q) => q.accuracy < min.accuracy ? q : min, answered[0])
				: null;
			const easiest = answered.length > 0
				? answered.reduce((max, q) => q.accuracy > max.accuracy ? q : max, answered[0])
				: null;

			return {
				index: ri,
				title: round.title,
				phase: round.phase,
				questionCount: roundQuestions.length,
				responseCount: roundResponses.length,
				correct: roundCorrect,
				incorrect: roundIncorrect,
				pointsEarned: roundPointsEarned,
				pointsPossible: roundPointsPossible,
				accuracy: roundPctCorrect,
				completion: roundCompletion,
				questionStats,
				hardest,
				easiest,
			};
		}).filter(r => r.questionCount > 0);

		// ===== PER-PARTICIPANT STATS =====
		const participants = (summary?.participants || []).map(p => {
			// Per-round breakdown for this participant
			const userResponses = allResponses.filter(
				r => r.user?.id === p.user.id
			);

			const perRound = rounds.map((round, ri) => {
				const roundQuestions = round.questions || [];
				if (roundQuestions.length === 0) return null;
				const pRoundResp = userResponses.filter(r => r.round_id === ri);
				const pRoundCorrect = pRoundResp.filter(r => r.is_correct).length;
				const pRoundPts = pRoundResp.reduce((sum, r) => sum + r.points_earned, 0);
				const pRoundPtsPossible = pRoundResp.reduce((sum, r) => sum + r.points_possible, 0);
				return {
					roundIndex: ri,
					roundTitle: round.title,
					responses: pRoundResp.length,
					totalQuestions: roundQuestions.length,
					correct: pRoundCorrect,
					incorrect: pRoundResp.length - pRoundCorrect,
					pointsEarned: pRoundPts,
					pointsPossible: pRoundPtsPossible,
					accuracy: pRoundResp.length > 0
						? Math.round((pRoundCorrect / pRoundResp.length) * 10000) / 100
						: null,
				};
			}).filter(Boolean);

			// Response time stats (approximate from submitted_at timestamps)
			const sortedByTime = [...userResponses]
				.filter(r => r.submitted_at)
				.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));

			let avgResponseInterval = null;
			if (sortedByTime.length > 1) {
				const intervals = [];
				for (let i = 1; i < sortedByTime.length; i++) {
					intervals.push(
						new Date(sortedByTime[i].submitted_at).getTime() -
						new Date(sortedByTime[i - 1].submitted_at).getTime()
					);
				}
				avgResponseInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
			}

			return {
				...p,
				perRound,
				avgResponseInterval,
				questionsAnswered: p.total_responses,
				totalQuestions,
			};
		}).sort((a, b) => b.percentage - a.percentage);

		// ===== QUESTION DIFFICULTY RANKING =====
		const allQuestionStats = roundStats.flatMap(r =>
			r.questionStats.map(q => ({ ...q, roundIndex: r.index, roundTitle: r.title }))
		);
		const answeredQuestions = allQuestionStats.filter(q => q.accuracy !== null);
		const hardestQuestions = [...answeredQuestions].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
		const easiestQuestions = [...answeredQuestions].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);

		// ===== QUESTION TYPE DISTRIBUTION =====
		const typeDistribution = {};
		for (const q of allQuestionStats) {
			if (!typeDistribution[q.type]) {
				typeDistribution[q.type] = { type: q.type, count: 0, correct: 0, total: 0 };
			}
			typeDistribution[q.type].count++;
			typeDistribution[q.type].correct += q.correctCount;
			typeDistribution[q.type].total += q.responseCount;
		}

		const TYPE_LABELS = {
			'multiple-choice': 'Múltipla Escolha',
			'true-false': 'Verdadeiro/Falso',
			'numeric': 'Numérica',
			'matching': 'Correspondência',
			'ordering': 'Ordenação',
		};

		const typeStats = Object.values(typeDistribution).map(t => ({
			...t,
			label: TYPE_LABELS[t.type] || t.type,
			accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 10000) / 100 : 0,
		}));

		// ===== CHART DATA =====
		const roundChartData = roundStats.map(r => ({
			name: `R${r.index + 1}`,
			fullName: `Rodada ${r.index + 1}`,
			'Aproveitamento (%)': r.accuracy,
			'Conclusão (%)': r.completion,
			'Acertos': r.correct,
			'Erros': r.incorrect,
		}));

		const accuracyPieData = totalResponses > 0
			? [
				{ name: 'Corretas', value: totalCorrect },
				{ name: 'Incorretas', value: totalIncorrect },
			]
			: [];

		const participantChartData = participants.map(p => ({
			name: p.user.nickname || p.user.name,
			'Aproveitamento (%)': p.percentage,
			'Pontos': p.points_earned,
		}));

		const radarData = roundStats.map(r => ({
			round: `R${r.index + 1}`,
			accuracy: r.accuracy,
			completion: r.completion,
		}));

		// ===== TIME ANALYTICS =====
		// Per-participant speed vs accuracy scatter data
		const speedAccuracyData = participants
			.filter(p => p.avgResponseInterval !== null)
			.map(p => ({
				name: p.user.nickname || p.user.name,
				velocidade: Math.round(p.avgResponseInterval / 1000),
				aproveitamento: p.percentage,
				respostas: p.questionsAnswered,
			}));

		// Fastest/Slowest participants
		const sortedBySpeed = [...participants]
			.filter(p => p.avgResponseInterval !== null)
			.sort((a, b) => a.avgResponseInterval - b.avgResponseInterval);
		const fastestParticipants = sortedBySpeed.slice(0, 3);
		const slowestParticipants = sortedBySpeed.length > 3
			? sortedBySpeed.slice(-3).reverse()
			: [];

		// Per-round average response time chart
		const roundTimeData = roundStats.map(r => {
			const roundParticipantTimes = participants
				.map(p => {
					const pr = p.perRound.find(pr => pr.roundIndex === r.index);
					if (!pr || pr.responses < 2) return null;
					const userRoundResp = allResponses
						.filter(resp => resp.round_id === r.index && resp.user?.id === p.user.id)
						.filter(resp => resp.submitted_at)
						.map(resp => new Date(resp.submitted_at).getTime())
						.sort((a, b) => a - b);
					if (userRoundResp.length < 2) return null;
					const intervals = [];
					for (let i = 1; i < userRoundResp.length; i++) {
						intervals.push(userRoundResp[i] - userRoundResp[i - 1]);
					}
					return intervals.reduce((a, b) => a + b, 0) / intervals.length;
				})
				.filter(Boolean);

			const avgTime = roundParticipantTimes.length > 0
				? roundParticipantTimes.reduce((a, b) => a + b, 0) / roundParticipantTimes.length
				: null;

			return {
				name: `R${r.index + 1}`,
				'Tempo Médio (s)': avgTime !== null ? Math.round(avgTime / 1000) : 0,
				'Aproveitamento (%)': r.accuracy,
			};
		});

		// Average response interval across all participants
		const avgResponseInterval = sortedBySpeed.length > 0
			? sortedBySpeed.reduce((sum, p) => sum + p.avgResponseInterval, 0) / sortedBySpeed.length
			: null;

		return {
			global: {
				totalQuestions,
				totalResponses,
				totalCorrect,
				totalIncorrect,
				totalPointsEarned,
				totalPointsPossible,
				globalAccuracy,
				completionRate,
				trainingElapsed,
				maxPossibleResponses,
			},
			roundStats,
			participants,
			hardestQuestions,
			easiestQuestions,
			typeStats,
			timeAnalytics: {
				speedAccuracyData,
				fastestParticipants,
				slowestParticipants,
				roundTimeData,
				avgResponseInterval,
			},
			charts: {
				roundChartData,
				accuracyPieData,
				participantChartData,
				radarData,
			},
		};
	}, [training, responses, summary, scenarioData, totalParticipants]);
}

// =========== SUB-SECTIONS ===========

function GlobalOverview({ stats }) {
	const { global, charts } = stats;

	return (
		<div>
			<SectionHeader
				icon={FaChartBar}
				title="Visão Geral"
				subtitle="Estatísticas globais do exercício"
				color="bg-indigo-100 text-indigo-600"
			/>

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
				<StatCard icon={FaPercent} label="Aproveitamento Geral" value={`${global.globalAccuracy}%`} color="emerald" />
				<StatCard icon={FaCheckCircle} label="Respostas Corretas" value={global.totalCorrect} sublabel={`de ${global.totalResponses} respostas`} color="emerald" />
				<StatCard icon={FaTimes} label="Respostas Incorretas" value={global.totalIncorrect} color="red" />
				<StatCard icon={FaTrophy} label="Pontos Totais" value={`${global.totalPointsEarned}/${global.totalPointsPossible}`} color="amber" />
				<StatCard icon={FaQuestionCircle} label="Total de Questões" value={global.totalQuestions} color="blue" />
				<StatCard icon={FaListOl} label="Respostas Enviadas" value={global.totalResponses} sublabel={`de ${global.maxPossibleResponses} possíveis`} color="purple" />
				<StatCard icon={FaUserGraduate} label="Taxa de Conclusão" value={`${global.completionRate}%`} color="teal" />
				<StatCard icon={FaClock} label="Tempo Total" value={formatDuration(global.trainingElapsed)} color="slate" />
			</div>

			{/* Charts row */}
			{global.totalResponses > 0 && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Accuracy Pie */}
					<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
						<p className="text-sm font-semibold text-slate-700 mb-3">Distribuição de Acertos</p>
						<ResponsiveContainer width="100%" height={220}>
							<PieChart>
								<Pie
									data={charts.accuracyPieData}
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

					{/* Round accuracy bar chart */}
					{charts.roundChartData.length > 1 && (
						<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
							<p className="text-sm font-semibold text-slate-700 mb-3">Aproveitamento por Rodada</p>
							<ResponsiveContainer width="100%" height={220}>
								<BarChart data={charts.roundChartData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
									<XAxis dataKey="name" tick={{ fontSize: 12 }} />
									<YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
									<Tooltip content={<CustomTooltip />} />
									<Bar dataKey="Aproveitamento (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
									<Bar dataKey="Conclusão (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function RoundBreakdown({ stats }) {
	const { roundStats } = stats;
	const [expandedRound, setExpandedRound] = useState(null);

	if (roundStats.length === 0) return null;

	return (
		<div>
			<SectionHeader
				icon={FaListOl}
				title="Estatísticas por Rodada"
				subtitle="Detalhamento de cada rodada do exercício"
				color="bg-blue-100 text-blue-600"
			/>

			<div className="space-y-3">
				{roundStats.map((round) => {
					const isExpanded = expandedRound === round.index;
					return (
						<div key={round.index} className="rounded-xl border border-slate-200 overflow-hidden">
							<button
								onClick={() => setExpandedRound(isExpanded ? null : round.index)}
								className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/50 transition-colors"
							>
								<span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600">
									{round.index + 1}
								</span>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-slate-900 truncate">{round.title}</p>
									{round.phase && <p className="text-xs text-slate-500">{round.phase}</p>}
								</div>

								{/* Mini stats */}
								<div className="hidden sm:flex items-center gap-3">
									<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
										round.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' :
										round.accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
										'bg-red-100 text-red-700'
									}`}>
										{round.accuracy}%
									</span>
									<span className="text-xs text-slate-500">
										{round.correct}/{round.responseCount} acertos
									</span>
									<span className="text-xs text-slate-400">
										{round.questionCount} questões
									</span>
								</div>

								<FaChevronDown className={`text-slate-400 text-xs shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
							</button>

							{isExpanded && (
								<div className="px-4 pb-4 border-t border-slate-100 space-y-4">
									{/* Round summary cards */}
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
										<div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
											<p className="text-lg font-bold text-blue-700">{round.accuracy}%</p>
											<p className="text-[11px] text-blue-600">Aproveitamento</p>
										</div>
										<div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
											<p className="text-lg font-bold text-emerald-700">{round.correct}</p>
											<p className="text-[11px] text-emerald-600">Acertos</p>
										</div>
										<div className="p-3 rounded-lg bg-red-50 border border-red-100 text-center">
											<p className="text-lg font-bold text-red-700">{round.incorrect}</p>
											<p className="text-[11px] text-red-600">Erros</p>
										</div>
										<div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-center">
											<p className="text-lg font-bold text-purple-700">{round.completion}%</p>
											<p className="text-[11px] text-purple-600">Conclusão</p>
										</div>
									</div>

									{/* Hardest / Easiest questions */}
									{(round.hardest || round.easiest) && (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{round.easiest && (
												<div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
													<p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1 flex items-center gap-1">
														<FaArrowUp className="text-[10px]" /> Mais Fácil
													</p>
													<p className="text-sm text-slate-700 line-clamp-2">{round.easiest.text}</p>
													<p className="text-xs text-emerald-600 mt-1 font-semibold">{round.easiest.accuracy}% de acerto</p>
												</div>
											)}
											{round.hardest && round.hardest.id !== round.easiest?.id && (
												<div className="p-3 rounded-lg bg-red-50 border border-red-100">
													<p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
														<FaArrowDown className="text-[10px]" /> Mais Difícil
													</p>
													<p className="text-sm text-slate-700 line-clamp-2">{round.hardest.text}</p>
													<p className="text-xs text-red-600 mt-1 font-semibold">{round.hardest.accuracy}% de acerto</p>
												</div>
											)}
										</div>
									)}

									{/* Per-question table */}
									{round.questionStats.length > 0 && (
										<div>
											<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
												Questões da rodada
											</p>
											<div className="overflow-x-auto rounded-lg border border-slate-200">
												<table className="w-full text-sm">
													<thead>
														<tr className="bg-slate-50 border-b border-slate-200">
															<th className="text-left py-2.5 px-3 font-semibold text-slate-600 text-xs">#</th>
															<th className="text-left py-2.5 px-3 font-semibold text-slate-600 text-xs">Questão</th>
															<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Respostas</th>
															<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Acertos</th>
															<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Aproveitamento</th>
														</tr>
													</thead>
													<tbody>
														{round.questionStats.map((q, qi) => (
															<tr key={q.id} className="border-b border-slate-100 last:border-0">
																<td className="py-2.5 px-3 text-slate-500 font-mono text-xs">{qi + 1}</td>
																<td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{q.text}</td>
																<td className="py-2.5 px-3 text-center text-slate-600">{q.responseCount}</td>
																<td className="py-2.5 px-3 text-center">
																	<span className={q.correctCount > 0 ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
																		{q.correctCount}
																	</span>
																</td>
																<td className="py-2.5 px-3 text-center">
																	{q.accuracy !== null ? (
																		<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
																			q.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' :
																			q.accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
																			'bg-red-100 text-red-700'
																		}`}>
																			{q.accuracy}%
																		</span>
																	) : (
																		<span className="text-xs text-slate-400">—</span>
																	)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ParticipantBreakdown({ stats }) {
	const { participants } = stats;
	const [expandedUser, setExpandedUser] = useState(null);

	if (participants.length === 0) return null;

	// Ranking medals
	const medals = ['🥇', '🥈', '🥉'];

	return (
		<div>
			<SectionHeader
				icon={FaUsers}
				title="Desempenho Individual"
				subtitle="Ranking e detalhamento por participante"
				color="bg-purple-100 text-purple-600"
			/>

			{/* Participant bar chart */}
			{participants.length > 1 && (
				<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 mb-5">
					<p className="text-sm font-semibold text-slate-700 mb-3">Comparativo de Aproveitamento</p>
					<ResponsiveContainer width="100%" height={Math.max(180, participants.length * 44)}>
						<BarChart data={stats.charts.participantChartData} layout="vertical">
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
							<YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
							<Tooltip content={<CustomTooltip />} />
							<Bar dataKey="Aproveitamento (%)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}

			{/* Participant list */}
			<div className="space-y-2">
				{participants.map((p, idx) => {
					const isExpanded = expandedUser === p.user.id;
					return (
						<div key={p.user.id} className="rounded-xl border border-slate-200 overflow-hidden">
							<button
								onClick={() => setExpandedUser(isExpanded ? null : p.user.id)}
								className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
							>
								{/* Rank */}
								<span className="shrink-0 text-lg w-8 text-center">
									{idx < 3 ? medals[idx] : <span className="text-sm text-slate-400 font-bold">{idx + 1}º</span>}
								</span>

								{/* Name */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-slate-900 truncate">
										{p.user.nickname || p.user.name}
									</p>
									<p className="text-xs text-slate-500">
										{p.questionsAnswered}/{p.totalQuestions} questões respondidas
									</p>
								</div>

								{/* Stats inline */}
								<div className="hidden sm:flex items-center gap-3">
									<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
										p.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' :
										p.percentage >= 40 ? 'bg-amber-100 text-amber-700' :
										'bg-red-100 text-red-700'
									}`}>
										{p.percentage}%
									</span>
									<span className="text-xs text-slate-500 font-medium">
										{p.points_earned}/{p.points_possible} pts
									</span>
									{p.avgResponseInterval && (
										<span className="text-xs text-slate-400">
											~{formatDuration(p.avgResponseInterval)}/resp.
										</span>
									)}
								</div>

								<FaChevronDown className={`text-slate-400 text-xs shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
							</button>

							{isExpanded && (
								<div className="px-4 pb-4 border-t border-slate-100 space-y-4">
									{/* Summary row */}
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
										<div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
											<p className="text-lg font-bold text-blue-700">{p.percentage}%</p>
											<p className="text-[11px] text-blue-600">Aproveitamento</p>
										</div>
										<div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
											<p className="text-lg font-bold text-emerald-700">{p.correct_count}</p>
											<p className="text-[11px] text-emerald-600">Acertos</p>
										</div>
										<div className="p-3 rounded-lg bg-red-50 border border-red-100 text-center">
											<p className="text-lg font-bold text-red-700">{p.total_responses - p.correct_count}</p>
											<p className="text-[11px] text-red-600">Erros</p>
										</div>
										<div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
											<p className="text-lg font-bold text-amber-700">{p.points_earned}</p>
											<p className="text-[11px] text-amber-600">Pontos</p>
										</div>
									</div>

									{/* Progress bar */}
									<div>
										<div className="flex items-center justify-between mb-1.5">
											<span className="text-xs text-slate-500">Progresso geral</span>
											<span className="text-xs font-semibold text-slate-600">
												{p.questionsAnswered}/{p.totalQuestions}
											</span>
										</div>
										<ProgressBar
											value={p.questionsAnswered}
											max={p.totalQuestions}
											color={p.percentage >= 70 ? 'bg-emerald-500' : p.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}
										/>
									</div>

									{/* Per-round breakdown */}
									{p.perRound.length > 0 && (
										<div>
											<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
												Desempenho por Rodada
											</p>
											<div className="overflow-x-auto rounded-lg border border-slate-200">
												<table className="w-full text-sm">
													<thead>
														<tr className="bg-slate-50 border-b border-slate-200">
															<th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Rodada</th>
															<th className="text-center py-2 px-3 font-semibold text-slate-600 text-xs">Respostas</th>
															<th className="text-center py-2 px-3 font-semibold text-slate-600 text-xs">Acertos</th>
															<th className="text-center py-2 px-3 font-semibold text-slate-600 text-xs">Pontos</th>
															<th className="text-center py-2 px-3 font-semibold text-slate-600 text-xs">%</th>
														</tr>
													</thead>
													<tbody>
														{p.perRound.map(pr => (
															<tr key={pr.roundIndex} className="border-b border-slate-100 last:border-0">
																<td className="py-2 px-3 text-slate-700 text-xs font-medium">
																	R{pr.roundIndex + 1} — {pr.roundTitle}
																</td>
																<td className="py-2 px-3 text-center text-slate-600 text-xs">
																	{pr.responses}/{pr.totalQuestions}
																</td>
																<td className="py-2 px-3 text-center text-xs">
																	<span className={pr.correct > 0 ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
																		{pr.correct}
																	</span>
																</td>
																<td className="py-2 px-3 text-center text-xs text-slate-600">
																	{pr.pointsEarned}/{pr.pointsPossible}
																</td>
																<td className="py-2 px-3 text-center">
																	{pr.accuracy !== null ? (
																		<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
																			pr.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' :
																			pr.accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
																			'bg-red-100 text-red-700'
																		}`}>
																			{pr.accuracy}%
																		</span>
																	) : (
																		<span className="text-xs text-slate-400">—</span>
																	)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function QuestionDifficulty({ stats }) {
	const { hardestQuestions, easiestQuestions, typeStats } = stats;

	if (hardestQuestions.length === 0 && typeStats.length === 0) return null;

	return (
		<div>
			<SectionHeader
				icon={FaStar}
				title="Análise de Dificuldade"
				subtitle="Questões mais difíceis, mais fáceis e distribuição por tipo"
				color="bg-amber-100 text-amber-600"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				{/* Hardest questions */}
				{hardestQuestions.length > 0 && (
					<div>
						<p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
							<FaArrowDown className="text-[10px]" /> Questões Mais Difíceis
						</p>
						<div className="space-y-2">
							{hardestQuestions.map((q, i) => (
								<div key={`${q.roundIndex}-${q.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
									<span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-red-200 text-red-700 text-xs font-bold">
										{i + 1}
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-slate-700 line-clamp-1">{q.text}</p>
										<p className="text-[11px] text-slate-400">Rodada {q.roundIndex + 1}</p>
									</div>
									<span className="text-xs font-bold text-red-600 shrink-0">{q.accuracy}%</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Easiest questions */}
				{easiestQuestions.length > 0 && (
					<div>
						<p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
							<FaArrowUp className="text-[10px]" /> Questões Mais Fáceis
						</p>
						<div className="space-y-2">
							{easiestQuestions.map((q, i) => (
								<div key={`${q.roundIndex}-${q.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
									<span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-emerald-200 text-emerald-700 text-xs font-bold">
										{i + 1}
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-slate-700 line-clamp-1">{q.text}</p>
										<p className="text-[11px] text-slate-400">Rodada {q.roundIndex + 1}</p>
									</div>
									<span className="text-xs font-bold text-emerald-600 shrink-0">{q.accuracy}%</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Type distribution */}
			{typeStats.length > 0 && (
				<div className="mt-5">
					<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
						Aproveitamento por Tipo de Questão
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
						{typeStats.map(t => (
							<div key={t.type} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-slate-700">{t.label}</p>
									<p className="text-[11px] text-slate-400">{t.count} questões · {t.total} respostas</p>
								</div>
								<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
									t.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' :
									t.accuracy >= 40 ? 'bg-amber-100 text-amber-700' :
									'bg-red-100 text-red-700'
								}`}>
									{t.accuracy}%
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function TimeAnalytics({ stats }) {
	const { timeAnalytics, participants } = stats;
	const { speedAccuracyData, fastestParticipants, slowestParticipants, roundTimeData, avgResponseInterval } = timeAnalytics;

	if (participants.length === 0) return null;

	const medals = ['🥇', '🥈', '🥉'];

	return (
		<div>
			<SectionHeader
				icon={FaStopwatch}
				title="Tempo & Velocidade"
				subtitle="Análise de tempos de resposta e correlação com desempenho"
				color="bg-teal-100 text-teal-600"
			/>

			{/* Summary cards */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
				<StatCard
					icon={FaBolt}
					label="Tempo Médio/Resposta"
					value={formatDuration(avgResponseInterval)}
					sublabel="Média entre participantes"
					color="teal"
				/>
				{fastestParticipants[0] && (
					<StatCard
						icon={FaBolt}
						label="Mais Rápido"
						value={fastestParticipants[0].user.nickname || fastestParticipants[0].user.name}
						sublabel={`~${formatDuration(fastestParticipants[0].avgResponseInterval)}/resp.`}
						color="emerald"
					/>
				)}
				{slowestParticipants[0] && (
					<StatCard
						icon={FaClock}
						label="Mais Lento"
						value={slowestParticipants[0].user.nickname || slowestParticipants[0].user.name}
						sublabel={`~${formatDuration(slowestParticipants[0].avgResponseInterval)}/resp.`}
						color="amber"
					/>
				)}
			</div>

			{/* Speed vs Accuracy scatter chart */}
			{speedAccuracyData.length > 1 && (
				<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 mb-6">
					<p className="text-sm font-semibold text-slate-700 mb-1">Velocidade vs Aproveitamento</p>
					<p className="text-xs text-slate-400 mb-3">Cada ponto representa um participante. Eixo X = tempo médio entre respostas (s), Y = aproveitamento (%)</p>
					<ResponsiveContainer width="100%" height={260}>
						<ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								type="number"
								dataKey="velocidade"
								name="Tempo (s)"
								tick={{ fontSize: 11 }}
								label={{ value: 'Tempo médio (s)', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#94a3b8' } }}
							/>
							<YAxis
								type="number"
								dataKey="aproveitamento"
								name="Aproveitamento (%)"
								domain={[0, 100]}
								tick={{ fontSize: 11 }}
								label={{ value: 'Aproveit. (%)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#94a3b8' } }}
							/>
							<ZAxis type="number" dataKey="respostas" range={[40, 160]} name="Respostas" />
							<Tooltip
								cursor={{ strokeDasharray: '3 3' }}
								content={({ active, payload }) => {
									if (!active || !payload?.length) return null;
									const d = payload[0].payload;
									return (
										<div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
											<p className="font-semibold text-slate-900">{d.name}</p>
											<p className="text-teal-600">Tempo: {d.velocidade}s/resp.</p>
											<p className="text-indigo-600">Aproveitamento: {d.aproveitamento}%</p>
											<p className="text-slate-500">{d.respostas} respostas</p>
										</div>
									);
								}}
							/>
							<Scatter data={speedAccuracyData} fill="#0d9488" />
						</ScatterChart>
					</ResponsiveContainer>
				</div>
			)}

			{/* Round time chart */}
			{roundTimeData.length > 1 && (
				<div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 mb-6">
					<p className="text-sm font-semibold text-slate-700 mb-3">Tempo Médio por Rodada vs Aproveitamento</p>
					<ResponsiveContainer width="100%" height={240}>
						<BarChart data={roundTimeData} barGap={4}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="name" tick={{ fontSize: 12 }} />
							<YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Tempo (s)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} />
							<YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: '% Acerto', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#94a3b8' } }} />
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ fontSize: '12px' }} />
							<Bar yAxisId="left" dataKey="Tempo Médio (s)" fill="#0d9488" radius={[4, 4, 0, 0]} />
							<Bar yAxisId="right" dataKey="Aproveitamento (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}

			{/* Fastest / Slowest ranking */}
			{fastestParticipants.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
					<div>
						<p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
							<FaBolt className="text-[10px]" /> Mais Rápidos
						</p>
						<div className="space-y-2">
							{fastestParticipants.map((p, i) => (
								<div key={p.user.id} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
									<span className="shrink-0 text-lg w-7 text-center">
										{i < 3 ? medals[i] : `${i + 1}º`}
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-slate-700 truncate">{p.user.nickname || p.user.name}</p>
										<p className="text-[11px] text-slate-400">{p.percentage}% aproveitamento</p>
									</div>
									<span className="text-xs font-bold text-emerald-600 shrink-0">
										{formatDuration(p.avgResponseInterval)}/resp.
									</span>
								</div>
							))}
						</div>
					</div>

					{slowestParticipants.length > 0 && (
						<div>
							<p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
								<FaClock className="text-[10px]" /> Mais Lentos
							</p>
							<div className="space-y-2">
								{slowestParticipants.map((p, i) => (
									<div key={p.user.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
										<span className="shrink-0 w-7 text-center text-sm text-amber-500 font-bold">
											{i + 1}º
										</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-slate-700 truncate">{p.user.nickname || p.user.name}</p>
											<p className="text-[11px] text-slate-400">{p.percentage}% aproveitamento</p>
										</div>
										<span className="text-xs font-bold text-amber-600 shrink-0">
											{formatDuration(p.avgResponseInterval)}/resp.
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Speed ranking table */}
			{participants.filter(p => p.avgResponseInterval).length > 0 && (
				<div className="mt-5">
					<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
						Tempo de Resposta por Participante
					</p>
					<div className="overflow-x-auto rounded-lg border border-slate-200">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-200">
									<th className="text-left py-2.5 px-3 font-semibold text-slate-600 text-xs">Participante</th>
									<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Tempo Médio</th>
									<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Respostas</th>
									<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Aproveitamento</th>
									<th className="text-center py-2.5 px-3 font-semibold text-slate-600 text-xs">Pontos</th>
								</tr>
							</thead>
							<tbody>
								{[...participants]
									.filter(p => p.avgResponseInterval !== null)
									.sort((a, b) => a.avgResponseInterval - b.avgResponseInterval)
									.map((p, i) => (
									<tr key={p.user.id} className="border-b border-slate-100 last:border-0">
										<td className="py-2.5 px-3 font-medium text-slate-700">
											{i < 3 ? <span className="mr-1">{medals[i]}</span> : null}
											{p.user.nickname || p.user.name}
										</td>
										<td className="py-2.5 px-3 text-center text-teal-600 font-semibold">
											{formatDuration(p.avgResponseInterval)}
										</td>
										<td className="py-2.5 px-3 text-center text-slate-600">{p.questionsAnswered}</td>
										<td className="py-2.5 px-3 text-center">
											<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
												p.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' :
												p.percentage >= 40 ? 'bg-amber-100 text-amber-700' :
												'bg-red-100 text-red-700'
											}`}>
												{p.percentage}%
											</span>
										</td>
										<td className="py-2.5 px-3 text-center text-slate-600">
											{p.points_earned}/{p.points_possible}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}

// =========== MAIN COMPONENT ===========

/**
 * TrainingStatsDashboard
 * Comprehensive statistics dashboard for training exercises.
 * Displays global, per-round, and per-participant statistics with charts.
 *
 * @param {Object} training - Training object with timers, status, participants
 * @param {Array} responses - All participant responses (from facilitator GET responses endpoint)
 * @param {Object} summary - Response summary from API (with participants breakdown)
 * @param {Object} scenarioData - Full scenario data including rounds with questions
 * @param {number} totalParticipants - Count of accepted participants
 */
export default function TrainingStatsDashboard({ training, responses, summary, scenarioData, totalParticipants }) {
	const [activeTab, setActiveTab] = useState('global');

	const stats = useTrainingStats({ training, responses, summary, scenarioData, totalParticipants });

	// Don't show dashboard if there are no responses yet
	if (!responses || responses.length === 0) return null;

	const tabs = [
		{ id: 'global', label: 'Visão Geral', icon: FaChartBar },
		{ id: 'rounds', label: 'Por Rodada', icon: FaListOl },
		{ id: 'participants', label: 'Por Participante', icon: FaUsers },
		{ id: 'time', label: 'Tempo', icon: FaStopwatch },
		{ id: 'difficulty', label: 'Dificuldade', icon: FaStar },
	];

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-3 bg-linear-to-br from-indigo-100 to-purple-100 rounded-xl">
					<FaChartPie className="text-2xl text-indigo-600" />
				</div>
				<div className="flex-1">
					<h3 className="text-xl font-bold text-slate-900">
						Painel de Estatísticas
					</h3>
					<p className="text-sm text-slate-500 mt-0.5">
						Análise detalhada do desempenho dos participantes
					</p>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
				{tabs.map(tab => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								activeTab === tab.id
									? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}`}
						>
							<Icon className="text-xs" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			<div>
				{activeTab === 'global' && <GlobalOverview stats={stats} />}
				{activeTab === 'rounds' && <RoundBreakdown stats={stats} />}
				{activeTab === 'participants' && <ParticipantBreakdown stats={stats} />}
				{activeTab === 'time' && <TimeAnalytics stats={stats} />}
				{activeTab === 'difficulty' && <QuestionDifficulty stats={stats} />}
			</div>
		</div>
	);
}
