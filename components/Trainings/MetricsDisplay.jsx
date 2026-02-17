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
	'server-status': { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600', badge: 'bg-red-100 text-red-700', headerBorder: 'border-red-100' },
	'query-analysis': { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-100 text-amber-700', headerBorder: 'border-amber-100' },
	'ip-analysis': { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-100 text-blue-700', headerBorder: 'border-blue-100' },
	'network-analysis': { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-100 text-purple-700', headerBorder: 'border-purple-100' },
	'security-analysis': { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', headerBorder: 'border-emerald-100' },
};

const DEFAULT_COLORS = { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-700', headerBorder: 'border-slate-100' };

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
							<p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">{label}</p>
							<div className="overflow-x-auto rounded-lg border border-slate-200">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-slate-50 border-b border-slate-200">
											{Object.keys(value[0]).map(col => (
												<th key={col} className="text-left py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
													{col.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{value.map((row, i) => (
											<tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
												{Object.values(row).map((cell, j) => (
													<td key={j} className="py-2.5 px-3 text-slate-700 font-mono text-sm">
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
							<p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">{label}</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
								{Object.entries(value).map(([subKey, subValue]) => {
									const subLabel = humanizeKey(subKey);
									if (typeof subValue === 'object' && subValue !== null) {
										return (
											<div key={subKey} className="p-3 bg-white/70 rounded-xl border border-slate-150 shadow-sm">
												<p className="text-sm font-semibold text-slate-700 mb-2">{subLabel}</p>
												<div className="space-y-1.5">
													{Object.entries(subValue).map(([k, v]) => (
														<div key={k} className="flex justify-between text-sm">
															<span className="text-slate-500">{humanizeKey(k)}</span>
															<span className="font-mono font-medium text-slate-800">{String(v)}</span>
														</div>
													))}
												</div>
											</div>
										);
									}
									return (
										<div key={subKey} className="flex justify-between items-center p-3 bg-white/70 rounded-xl border border-slate-150 shadow-sm">
											<span className="text-sm text-slate-600">{subLabel}</span>
											<span className="text-sm font-mono font-semibold text-slate-900">{String(subValue)}</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				}

				// Simple value
				return (
					<div key={key} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
						<span className="text-sm text-slate-600">{label}</span>
						<span className="text-sm font-mono font-semibold text-slate-900">{String(value)}</span>
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
		<div className={`rounded-2xl border ${colors.border} overflow-hidden shadow-sm`}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/40 ${colors.bg}`}
			>
				<div className={`p-3 rounded-xl ${colors.icon}`}>
					<Icon className="text-lg" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-base font-semibold text-slate-900 truncate">{metric.title}</p>
					<span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${colors.badge}`}>
						{humanizeKey(metric.type)}
					</span>
				</div>
				<div className={`p-2 rounded-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
					<FaChevronDown className="text-slate-400 text-sm shrink-0" />
				</div>
			</button>

			{isOpen && (
				<div className={`p-5 lg:p-6 border-t ${colors.headerBorder} bg-white`}>
					<MetricData data={metric.data} />
					{metric.data?.observation && (
						<div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
							<div className="flex items-start gap-3">
								<div className="p-1.5 bg-amber-100 rounded-lg shrink-0 mt-0.5">
									<FaEye className="text-amber-600 text-sm" />
								</div>
								<div>
									<p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Observação</p>
									<p className="text-sm text-amber-900 font-medium leading-relaxed">{metric.data.observation}</p>
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
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			<div className="flex items-center gap-3 mb-8">
				<div className="p-3 bg-emerald-100 rounded-xl">
					<FaChartBar className="text-2xl text-emerald-600" />
				</div>
				<div>
					<h3 className="text-xl font-bold text-slate-900">
						Métricas e Evidências
					</h3>
					<p className="text-sm text-slate-500 mt-0.5">
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
										? 'bg-emerald-100 text-emerald-700'
										: 'bg-slate-100 text-slate-600'
								}`}>
									Rodada {index + 1}
								</span>
								<span className="text-sm text-slate-600 font-medium">{round.title}</span>
								{isCurrent && (
									<span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
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
