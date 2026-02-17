'use client';

import { FaMapMarkerAlt, FaClock, FaExclamationTriangle, FaBullhorn } from 'react-icons/fa';

/**
 * Renders key-value pairs from the currentSituation object of a round.
 */
function SituationItem({ label, value }) {
	return (
		<div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
			<span className="text-xs text-slate-500 shrink-0 mr-4">{label}</span>
			<span className="text-xs font-medium text-slate-800 text-right">{String(value)}</span>
		</div>
	);
}

function humanizeKey(key) {
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.replace(/^\w/, c => c.toUpperCase())
		.trim();
}

/**
 * RoundInfo
 * Displays the current round's contextual information:
 * - Title, phase, description
 * - Inject (scenario injection text)
 * - Current situation data
 * - Time elapsed
 *
 * @param {Object} round - The current round object from scenario
 * @param {number} roundIndex - 0-based round index
 * @param {number} totalRounds - Total number of rounds
 */
export default function RoundInfo({ round, roundIndex, totalRounds }) {
	if (!round) return null;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
					<FaMapMarkerAlt className="text-white text-lg" />
				</div>
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-slate-900">
						Rodada Atual
					</h3>
					<p className="text-sm text-slate-500">
						Rodada {roundIndex + 1} de {totalRounds}
					</p>
				</div>
			</div>

			{/* Round title & phase */}
			<div className="mb-4 p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
				<div className="flex items-center gap-2 mb-2">
					<span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
						Rodada {roundIndex + 1}
					</span>
					{round.phase && (
						<span className="text-xs font-medium text-slate-600">
							{round.phase}
						</span>
					)}
				</div>
				<h4 className="text-base font-bold text-slate-900 mb-1">
					{round.title}
				</h4>
				{round.description && (
					<p className="text-sm text-slate-700 leading-relaxed">
						{round.description}
					</p>
				)}
			</div>

			{/* Time elapsed */}
			{round.timeElapsed && (
				<div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
					<FaClock className="text-slate-400 text-sm" />
					<span className="text-xs font-medium text-slate-600">Tempo decorrido no cenário:</span>
					<span className="text-xs font-bold text-slate-800">{round.timeElapsed}</span>
				</div>
			)}

			{/* Inject */}
			{round.inject && (
				<div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
					<div className="flex items-start gap-2.5">
						<FaBullhorn className="text-amber-500 mt-0.5 shrink-0" />
						<div>
							<p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Injeção do Cenário</p>
							<p className="text-sm text-amber-900 leading-relaxed">{round.inject}</p>
						</div>
					</div>
				</div>
			)}

			{/* Current situation */}
			{round.currentSituation && Object.keys(round.currentSituation).length > 0 && (
				<div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
					<div className="flex items-center gap-2 mb-3">
						<FaExclamationTriangle className="text-slate-500 text-sm" />
						<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Situação Atual</p>
					</div>
					<div>
						{Object.entries(round.currentSituation).map(([key, value]) => (
							<SituationItem key={key} label={humanizeKey(key)} value={value} />
						))}
					</div>
				</div>
			)}

			{/* Progress bar */}
			<div className="mt-4">
				<div className="flex items-center justify-between mb-1.5">
					<span className="text-xs font-medium text-slate-600">Progresso</span>
					<span className="text-xs font-semibold text-purple-600">
						{Math.round(((roundIndex + 1) / totalRounds) * 100)}%
					</span>
				</div>
				<div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
					<div
						className="h-full bg-linear-to-r from-purple-500 to-indigo-600 transition-all duration-300 ease-out"
						style={{ width: `${((roundIndex + 1) / totalRounds) * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
