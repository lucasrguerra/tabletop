'use client';

import { useState } from 'react';
import { FaChevronDown, FaServer, FaSearch, FaNetworkWired, FaGlobe, FaShieldAlt, FaChartBar, FaEye } from 'react-icons/fa';

const METRIC_ICONS = {
	'server-status': FaServer,
	'query-analysis': FaSearch,
	'ip-analysis': FaGlobe,
	'network-analysis': FaNetworkWired,
	'security-analysis': FaShieldAlt,
};

const METRIC_COLORS = {
	'server-status': { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/40', icon: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300', headerBorder: 'border-red-100 dark:border-red-900/30' },
	'query-analysis': { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/40', icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300', headerBorder: 'border-amber-100 dark:border-amber-900/30' },
	'ip-analysis': { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900/40', icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300', headerBorder: 'border-blue-100 dark:border-blue-900/30' },
	'network-analysis': { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-900/40', icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300', headerBorder: 'border-purple-100 dark:border-purple-900/30' },
	'security-analysis': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900/40', icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300', headerBorder: 'border-emerald-100 dark:border-emerald-900/30' },
};

const DEFAULT_COLORS = { bg: 'bg-slate-50 dark:bg-slate-800/40', border: 'border-slate-200 dark:border-slate-800', icon: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', headerBorder: 'border-slate-100 dark:border-slate-800' };

function humanizeKey(key) {
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.replace(/^\w/, c => c.toUpperCase())
		.trim();
}

/**
 * Renders a metric data object as a key-value list.
 * Handles nested objects and arrays gracefully.
 */
function MetricData({ data }) {
	if (!data || typeof data !== 'object') return null;

	return (
		<div className="space-y-4">
			{Object.entries(data).map(([key, value]) => {
				if (key === 'observation') return null;

				const label = humanizeKey(key);

				// Array of objects (e.g. topQueriedDomains, topSourceIPs)
				if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
					return (
						<div key={key} className="mt-3">
							<p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">{label}</p>
							<div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
											{Object.keys(value[0]).map(col => (
												<th key={col} className="text-left py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">
													{col.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{value.map((row, i) => (
											<tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
												{Object.values(row).map((cell, j) => (
													<td key={j} className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-mono text-sm">
														{typeof cell === 'number' && !Number.isInteger(cell) ? cell.toFixed(1) : String(cell)}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					);
				}

				// Nested object (e.g. distribution, queryTypes)
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					return (
						<div key={key} className="mt-3">
							<p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">{label}</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
								{Object.entries(value).map(([subKey, subValue]) => {
									const subLabel = humanizeKey(subKey);
									if (typeof subValue === 'object' && subValue !== null) {
										return (
											<div key={subKey} className="p-3 bg-white/70 dark:bg-slate-800/60 rounded-xl border border-slate-150 dark:border-slate-700/60 shadow-xs">
												<p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{subLabel}</p>
												<div className="space-y-1.5">
													{Object.entries(subValue).map(([k, v]) => (
														<div key={k} className="flex justify-between text-sm">
															<span className="text-slate-500 dark:text-slate-400">{humanizeKey(k)}</span>
															<span className="font-mono font-medium text-slate-800 dark:text-slate-200">{String(v)}</span>
														</div>
													))}
												</div>
											</div>
										);
									}
									return (
										<div key={subKey} className="flex justify-between items-center p-3 bg-white/70 dark:bg-slate-800/60 rounded-xl border border-slate-150 dark:border-slate-700/60 shadow-xs">
											<span className="text-sm text-slate-600 dark:text-slate-400">{subLabel}</span>
											<span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">{String(subValue)}</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				}

				// Simple value
				return (
					<div key={key} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
						<span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
						<span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">{String(value)}</span>
					</div>
				);
			})}
		</div>
	);
}

/**
 * Single metric card — collapsible, with larger display.
 */
function MetricCard({ metric, defaultOpen = false }) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const colors = METRIC_COLORS[metric.type] || DEFAULT_COLORS;
	const Icon = METRIC_ICONS[metric.type] || FaChartBar;

	return (
		<div className={`rounded-2xl border ${colors.border} overflow-hidden shadow-xs`}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/40 dark:hover:bg-slate-800/40 ${colors.bg}`}
			>
				<div className={`p-3 rounded-xl ${colors.icon}`}>
					<Icon className="text-lg" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{metric.title}</p>
					<span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${colors.badge}`}>
						{humanizeKey(metric.type)}
					</span>
				</div>
				<div className={`p-2 rounded-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
					<FaChevronDown className="text-slate-400 dark:text-slate-500 text-sm shrink-0" />
				</div>
			</button>

			{isOpen && (
				<div className={`p-5 lg:p-6 border-t ${colors.headerBorder} bg-white dark:bg-slate-900`}>
					<MetricData data={metric.data} />
					{metric.data?.observation && (
						<div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
							<div className="flex items-start gap-3">
								<div className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg shrink-0 mt-0.5">
									<FaEye className="text-amber-600 dark:text-amber-400 text-sm" />
								</div>
								<div>
									<p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Observação</p>
									<p className="text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed">{metric.data.observation}</p>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

/**
 * MetricsDisplay
 * Shows metrics cumulatively across rounds, with the current round's metrics
 * expanded by default and past rounds collapsed.
 *
 * @param {Array} rounds - Array of round objects (up to current round)
 * @param {number} currentRound - Current round index (0-based)
 */
export default function MetricsDisplay({ rounds, currentRound }) {
	if (!rounds || rounds.length === 0) return null;

	// Collect rounds that have metrics
	const roundsWithMetrics = rounds
		.map((round, index) => ({ round, index }))
		.filter(({ round }) => round.metrics && round.metrics.length > 0);

	if (roundsWithMetrics.length === 0) return null;

	return (
		<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 p-6 lg:p-8">
			<div className="flex items-center gap-3 mb-8">
				<div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl">
					<FaChartBar className="text-2xl text-emerald-600 dark:text-emerald-400" />
				</div>
				<div>
					<h3 className="text-xl font-bold text-slate-900 dark:text-white">
						Métricas e Evidências
					</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
						Dados técnicos disponíveis para análise
					</p>
				</div>
			</div>

			<div className="space-y-8">
				{roundsWithMetrics.map(({ round, index }) => {
					const isCurrent = index === currentRound;
					return (
						<div key={round.id}>
							{/* Round label */}
							<div className="flex items-center gap-3 mb-4">
								<span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
									isCurrent
										? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
										: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
								}`}>
									Rodada {index + 1}
								</span>
								<span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{round.title}</span>
								{isCurrent && (
									<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
										Atual
									</span>
								)}
							</div>

							{/* Metrics list */}
							<div className="space-y-3">
								{round.metrics.map((metric, mi) => (
									<MetricCard
										key={`${round.id}-${mi}`}
										metric={metric}
										defaultOpen={false}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
