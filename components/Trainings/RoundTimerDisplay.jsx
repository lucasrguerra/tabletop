import { useState, useEffect } from 'react';
import { FaStopwatch, FaPlay, FaPause, FaStop } from 'react-icons/fa';

export default function RoundTimerDisplay({ training, userRole, onTimerAction }) {
	const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
	const isFacilitator = userRole === 'facilitator';
	const roundTimer = training.round_timer || {};

	// Time thresholds in milliseconds
	const TIME_WITHIN = 6 * 60 * 1000; // 6 minutes
	const TIME_LIMIT = 7 * 60 * 1000;  // 7 minutes

	// Calculate elapsed time
	useEffect(() => {
		let interval;

		const calculateElapsedTime = () => {
			if (roundTimer.is_paused || !roundTimer.started_at) {
				// Timer is paused or not started, use stored elapsed_time
				return roundTimer.elapsed_time || 0;
			} else {
				// Timer is running, calculate current elapsed time
				const startedAt = new Date(roundTimer.started_at);
				const now = new Date();
				const currentRunTime = now - startedAt;
				return (roundTimer.elapsed_time || 0) + currentRunTime;
			}
		};

		// Update immediately
		setCurrentElapsedTime(calculateElapsedTime());

		// Update every second if timer is running
		if (!roundTimer.is_paused && roundTimer.started_at) {
			interval = setInterval(() => {
				setCurrentElapsedTime(calculateElapsedTime());
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [roundTimer.is_paused, roundTimer.started_at, roundTimer.elapsed_time]);

	// Format time as MM:SS
	const formatTime = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	// Determine time status and styling
	const getTimeStatus = () => {
		if (currentElapsedTime <= TIME_WITHIN) {
			return {
				status: 'within',
				color: 'text-emerald-600',
				bgColor: 'bg-emerald-50',
				borderColor: 'border-emerald-200',
				message: 'Dentro do tempo',
				icon: '✓'
			};
		} else if (currentElapsedTime <= TIME_LIMIT) {
			return {
				status: 'approaching',
				color: 'text-amber-600',
				bgColor: 'bg-amber-50',
				borderColor: 'border-amber-200',
				message: 'Chegando no limite',
				icon: '⚠'
			};
		} else {
			return {
				status: 'exceeded',
				color: 'text-red-600',
				bgColor: 'bg-red-50',
				borderColor: 'border-red-200',
				message: 'Tempo excedido',
				icon: '✕'
			};
		}
	};

	const isRunning = !roundTimer.is_paused && roundTimer.started_at;
	const timeStatus = getTimeStatus();

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Timer Display */}
			<div className="flex flex-col items-center mb-6">
				<div className="flex items-center gap-3 mb-3">
					<FaStopwatch className="text-2xl text-indigo-500" />
					<h3 className="text-lg font-semibold text-slate-900">
						Timer da Rodada
					</h3>
				</div>

				{/* Time Display with Status Color */}
				<div className="relative">
					<div className={`text-5xl lg:text-6xl font-mono font-bold ${timeStatus.color} transition-colors`}>
						{formatTime(currentElapsedTime)}
					</div>
					{isRunning && (
						<div className="absolute -top-2 -right-2">
							<span className="flex h-4 w-4">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
							</span>
						</div>
					)}
				</div>

				{/* Status Badge */}
				<div className={`mt-4 px-4 py-2 rounded-xl ${timeStatus.bgColor} ${timeStatus.borderColor} border-2`}>
					<p className={`text-sm font-semibold ${timeStatus.color} flex items-center gap-2`}>
						<span>{timeStatus.icon}</span>
						{timeStatus.message}
					</p>
				</div>

				{/* Time Guidelines */}
				<div className="mt-4 w-full space-y-2">
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-emerald-500"></div>
							<span className="text-slate-600">Até 6 min</span>
						</div>
						<span className="text-slate-400">Dentro do tempo</span>
					</div>
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-amber-500"></div>
							<span className="text-slate-600">6-7 min</span>
						</div>
						<span className="text-slate-400">Próximo ao limite</span>
					</div>
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-red-500"></div>
							<span className="text-slate-600">Mais de 7 min</span>
						</div>
						<span className="text-slate-400">Tempo excedido</span>
					</div>
				</div>
			</div>

			{/* Facilitator Controls */}
			{isFacilitator && onTimerAction && (
				<div className="flex flex-wrap gap-3 justify-center border-t border-slate-100 pt-6">
					{roundTimer.is_paused ? (
						<button
							onClick={() => onTimerAction('start')}
							className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all"
						>
							<FaPlay className="text-sm" />
							{roundTimer.started_at || roundTimer.elapsed_time > 0 ? 'Retomar' : 'Iniciar'}
						</button>
					) : (
						<button
							onClick={() => onTimerAction('pause')}
							className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all"
						>
							<FaPause className="text-sm" />
							Pausar
						</button>
					)}
					
					<button
						onClick={() => onTimerAction('reset')}
						className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all"
					>
						<FaStop className="text-sm" />
						Resetar
					</button>
				</div>
			)}

			{/* Read-only note for non-facilitators */}
			{!isFacilitator && (
				<div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
					Apenas o facilitador pode controlar o timer da rodada
				</div>
			)}
		</div>
	);
}
