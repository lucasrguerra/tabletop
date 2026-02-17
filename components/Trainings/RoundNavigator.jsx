'use client';

import { FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * RoundNavigator
 * Allows participants/observers to navigate between visible rounds
 * (from round 1 up to the current round set by the facilitator).
 *
 * @param {Array} rounds - Array of visible round objects
 * @param {number} currentRound - Facilitator's current round index (0-based)
 * @param {number} viewingRound - Which round the user is viewing (0-based)
 * @param {Function} onRoundSelect - Callback(roundIndex)
 */
export default function RoundNavigator({ rounds, currentRound, viewingRound, onRoundSelect }) {
	if (!rounds || rounds.length === 0) return null;

	const canGoPrevious = viewingRound > 0;
	const canGoNext = viewingRound < currentRound;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-4 lg:p-6">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2 bg-purple-100 rounded-lg">
					<FaList className="text-sm text-purple-600" />
				</div>
				<div>
					<h3 className="text-sm font-semibold text-slate-900">
						Navegação de Rodadas
					</h3>
					<p className="text-xs text-slate-500">
						Visualizando rodada {viewingRound + 1} de {currentRound + 1} disponível{currentRound > 0 ? 's' : ''}
					</p>
				</div>
			</div>

			{/* Navigation controls */}
			<div className="flex items-center gap-2 mb-3">
				<button
					onClick={() => onRoundSelect(viewingRound - 1)}
					disabled={!canGoPrevious}
					className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
				>
					<FaChevronLeft className="text-xs" />
				</button>

				<div className="flex-1 flex items-center gap-1 overflow-x-auto py-1">
					{rounds.map((round, index) => (
						<button
							key={round.id}
							onClick={() => onRoundSelect(index)}
							className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
								index === viewingRound
									? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
									: index === currentRound
										? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
										: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
							}`}
						>
							{index + 1}
						</button>
					))}
				</div>

				<button
					onClick={() => onRoundSelect(viewingRound + 1)}
					disabled={!canGoNext}
					className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
				>
					<FaChevronRight className="text-xs" />
				</button>
			</div>

			{/* Current round indicator */}
			{viewingRound !== currentRound && (
				<button
					onClick={() => onRoundSelect(currentRound)}
					className="w-full text-center text-xs text-purple-600 hover:text-purple-700 font-medium py-1.5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
				>
					← Voltar para rodada atual ({currentRound + 1})
				</button>
			)}
		</div>
	);
}
