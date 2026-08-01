'use client';

import { FaStar, FaUsers, FaThumbsUp, FaChartBar, FaCommentDots } from 'react-icons/fa';

const DIFFICULTY_LABELS = ['', 'Muito Fácil', 'Fácil', 'Moderado', 'Difícil', 'Muito Difícil'];

function RatingBar({ label, average, icon: Icon, color }) {
	return (
		<div className={`p-4 rounded-xl ${color.bg} border ${color.border}`}>
			<div className="flex items-center gap-2 mb-2">
				<div className={`p-1.5 rounded-lg ${color.iconBg}`}>
					<Icon className={`text-sm ${color.iconText}`} />
				</div>
				<span className={`text-xs font-semibold ${color.label} uppercase`}>{label}</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{average}</span>
				<div className="flex gap-0.5">
					{[1, 2, 3, 4, 5].map(s => (
						<FaStar key={s} className={`text-sm ${s <= Math.round(average) ? 'text-amber-400' : 'text-slate-200'}`} />
					))}
				</div>
				<span className="text-xs text-slate-400 dark:text-slate-500">/5</span>
			</div>
		</div>
	);
}

/**
 * EvaluationStats - Displays evaluation statistics for facilitators.
 *
 * @param {Array} evaluations - List of evaluations
 * @param {Object} stats - Aggregated statistics
 * @param {number} totalParticipants - Total accepted participants
 */
export default function EvaluationStats({ evaluations = [], stats, totalParticipants }) {
	if (!stats) return null;

	const responseRate = totalParticipants > 0
		? Math.round((stats.total / totalParticipants) * 100)
		: 0;

	return (
		<section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden" aria-labelledby="eval-stats-heading">
			{/* Header */}
			<div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50">
						<FaStar className="text-xl text-amber-600 dark:text-amber-400" />
					</div>
					<div>
						<h4 id="eval-stats-heading" className="text-lg font-bold text-slate-900 dark:text-slate-100">Avaliações dos Participantes</h4>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							{stats.total} avaliação{stats.total !== 1 ? 'ões' : ''} recebida{stats.total !== 1 ? 's' : ''} de {totalParticipants} participante{totalParticipants !== 1 ? 's' : ''}
							{totalParticipants > 0 && ` (${responseRate}% de adesão)`}
						</p>
					</div>
				</div>
			</div>

			{stats.total === 0 ? (
				<div className="p-8 text-center">
					<p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma avaliação recebida ainda.</p>
				</div>
			) : (
				<div className="p-6 space-y-6">
					{/* Rating cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<RatingBar
							label="Geral"
							average={stats.avg_overall}
							icon={FaStar}
							color={{ bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/40', iconBg: 'bg-amber-100 dark:bg-amber-900/50', iconText: 'text-amber-600 dark:text-amber-400', label: 'text-amber-700 dark:text-amber-300' }}
						/>
						<RatingBar
							label="Cenário"
							average={stats.avg_scenario}
							icon={FaChartBar}
							color={{ bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900/40', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconText: 'text-blue-600 dark:text-blue-400', label: 'text-blue-700 dark:text-blue-300' }}
						/>
						<div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
							<div className="flex items-center gap-2 mb-2">
								<div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
									<FaChartBar className="text-sm text-purple-600 dark:text-purple-400" />
								</div>
								<span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">Dificuldade</span>
							</div>
							<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.avg_difficulty}</p>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{DIFFICULTY_LABELS[Math.round(stats.avg_difficulty)] || '—'}</p>
						</div>
						<div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
							<div className="flex items-center gap-2 mb-2">
								<div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
									<FaThumbsUp className="text-sm text-emerald-600 dark:text-emerald-400" />
								</div>
								<span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">Recomendariam</span>
							</div>
							<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.recommend_percentage}%</p>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">dos participantes</p>
						</div>
					</div>

					{/* Overall rating distribution */}
					<div>
						<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Distribuição — Avaliação Geral</p>
						<div className="space-y-2">
							{[5, 4, 3, 2, 1].map(star => {
								const count = stats.rating_distribution[star] || 0;
								const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
								return (
									<div key={star} className="flex items-center gap-3">
										<span className="text-sm text-slate-600 dark:text-slate-400 w-6 text-right">{star}</span>
										<FaStar className="text-amber-400 text-xs" />
										<div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
											<div
												className="h-full rounded-full bg-amber-400 transition-all duration-500"
												style={{ width: `${pct}%` }}
											/>
										</div>
										<span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{count}</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Individual evaluations with comments */}
					{evaluations.some(e => e.comment) && (
						<div>
							<div className="flex items-center gap-2 mb-3">
								<FaCommentDots className="text-slate-400 dark:text-slate-500" />
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Comentários</p>
							</div>
							<div className="space-y-3">
								{evaluations.filter(e => e.comment).map(e => (
									<div key={e.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-slate-700 dark:text-slate-300">{e.user.name}</span>
												{e.user.nickname && (
													<span className="text-xs text-slate-400 dark:text-slate-500">@{e.user.nickname}</span>
												)}
											</div>
											<div className="flex gap-0.5">
												{[1, 2, 3, 4, 5].map(s => (
													<FaStar key={s} className={`text-xs ${s <= e.overall_rating ? 'text-amber-400' : 'text-slate-200'}`} />
												))}
											</div>
										</div>
										<p className="text-sm text-slate-600 dark:text-slate-400">{e.comment}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Response rate */}
					<div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
						<FaUsers className="text-slate-400 dark:text-slate-500 text-lg" />
						<div>
							<p className="text-sm font-medium text-slate-700 dark:text-slate-300">Taxa de Resposta</p>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{stats.total} de {totalParticipants} participante{totalParticipants !== 1 ? 's' : ''} avaliaram o treinamento ({responseRate}%)
							</p>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
