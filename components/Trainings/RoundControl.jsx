'use client';
import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaList } from 'react-icons/fa';

/**
 * RoundControl Component
 * Controls for navigating through training rounds
 * Only visible to facilitators
 * 
 * @param {Object} training - Training data with current_round and scenario
 * @param {Array} rounds - Array of rounds from scenario
 * @param {Function} onRoundChange - Callback when round changes
 * @param {boolean} disabled - Whether controls are disabled
 */
export default function RoundControl({ training, rounds, onRoundChange, disabled = false }) {
	const [loading, setLoading] = useState(false);

	if (!rounds || rounds.length === 0) {
		return null;
	}

	const currentRound = training.current_round || 0;
	const totalRounds = rounds.length;
	const currentRoundData = rounds[currentRound];

	const handleRoundChange = async (action, roundNumber = null) => {
		if (disabled || loading) return;

		try {
			setLoading(true);
			await onRoundChange(action, roundNumber);
		} catch (error) {
			console.error('Error changing round:', error);
		} finally {
			setLoading(false);
		}
	};

	const canGoPrevious = currentRound > 0;
	const canGoNext = currentRound < totalRounds - 1;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			<div className="flex items-center gap-3 mb-6">
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
					<FaList className="text-white text-lg" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Controle de Rodadas
					</h3>
					<p className="text-sm text-slate-500">
						Rodada {currentRound + 1} de {totalRounds}
					</p>
				</div>
			</div>

			{/* Current Round Info */}
			<div className="mb-6 p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
				<div className="flex items-center gap-2 mb-2">
					<span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
						Rodada {currentRound + 1}
					</span>
					{currentRoundData.phase && (
						<span className="text-xs font-medium text-slate-600">
							{currentRoundData.phase}
						</span>
					)}
				</div>
				<h4 className="text-base font-semibold text-slate-900 mb-1">
					{currentRoundData.title}
				</h4>
				{currentRoundData.description && (
					<p className="text-sm text-slate-600 line-clamp-2">
						{currentRoundData.description}
					</p>
				)}
			</div>

			{/* Navigation Controls */}
			<div className="flex items-center gap-3">
				<button
					onClick={() => handleRoundChange('previous')}
					disabled={disabled || loading || !canGoPrevious}
					className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200"
					title={!canGoPrevious ? "Já está na primeira rodada" : "Rodada anterior"}
				>
					<FaChevronLeft className="text-sm" />
					<span className="hidden sm:inline">Anterior</span>
				</button>

				<button
					onClick={() => handleRoundChange('next')}
					disabled={disabled || loading || !canGoNext}
					className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-indigo-600"
					title={!canGoNext ? "Já está na última rodada" : "Próxima rodada"}
				>
					<span className="hidden sm:inline">Próxima</span>
					<FaChevronRight className="text-sm" />
				</button>
			</div>

			{/* Round Progress Bar */}
			<div className="mt-4">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-medium text-slate-600">Progresso</span>
					<span className="text-xs font-semibold text-purple-600">
						{Math.round(((currentRound + 1) / totalRounds) * 100)}%
					</span>
				</div>
				<div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
					<div
						className="h-full bg-linear-to-r from-purple-500 to-indigo-600 transition-all duration-300 ease-out"
						style={{ width: `${((currentRound + 1) / totalRounds) * 100}%` }}
					/>
				</div>
			</div>

			{/* Round List (collapsed) */}
			<details className="mt-4">
				<summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors select-none">
					Ver todas as rodadas
				</summary>
				<div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
					{rounds.map((round, index) => (
						<button
							key={round.id}
							onClick={() => handleRoundChange('set', index)}
							disabled={disabled || loading || index === currentRound}
							className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
								index === currentRound
									? 'bg-purple-100 text-purple-900 font-semibold border border-purple-200'
									: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent'
							} disabled:cursor-not-allowed`}
						>
							<div className="flex items-center gap-2">
								<span className={`text-xs font-semibold ${
									index === currentRound ? 'text-purple-600' : 'text-slate-500'
								}`}>
									{index + 1}.
								</span>
								<span className="flex-1">{round.title}</span>
								{index === currentRound && (
									<span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
										Atual
									</span>
								)}
							</div>
						</button>
					))}
				</div>
			</details>
		</div>
	);
}
