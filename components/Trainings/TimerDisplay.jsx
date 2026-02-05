import { useState, useEffect } from 'react';
import { FaClock, FaPlay, FaPause, FaStop } from 'react-icons/fa';

export default function TimerDisplay({ training, userRole, onTimerAction }) {
	const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
	const isFacilitator = userRole === 'facilitator';
	const timer = training.timer || {};

	// Calculate elapsed time
	useEffect(() => {
		let interval;

		const calculateElapsedTime = () => {
			if (timer.is_paused || !timer.started_at) {
				// Timer is paused or not started, use stored elapsed_time
				return timer.elapsed_time || 0;
			} else {
				// Timer is running, calculate current elapsed time
				const startedAt = new Date(timer.started_at);
				const now = new Date();
				const currentRunTime = now - startedAt;
				return (timer.elapsed_time || 0) + currentRunTime;
			}
		};

		// Update immediately
		setCurrentElapsedTime(calculateElapsedTime());

		// Update every second if timer is running
		if (!timer.is_paused && timer.started_at) {
			interval = setInterval(() => {
				setCurrentElapsedTime(calculateElapsedTime());
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [timer.is_paused, timer.started_at, timer.elapsed_time]);

	// Format time as HH:MM:SS
	const formatTime = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	const isRunning = !timer.is_paused && timer.started_at;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Timer Display */}
			<div className="flex flex-col items-center mb-6">
				<div className="flex items-center gap-3 mb-3">
					<FaClock className="text-2xl text-slate-400" />
					<h3 className="text-lg font-semibold text-slate-900">
						Tempo de Treinamento
					</h3>
				</div>

				{/* Time Display */}
				<div className="relative">
					<div className={`text-5xl lg:text-6xl font-mono font-bold ${isRunning ? 'text-emerald-600' : 'text-slate-700'} transition-colors`}>
						{formatTime(currentElapsedTime)}
					</div>
					{isRunning && (
						<div className="absolute -top-2 -right-2">
							<span className="flex h-4 w-4">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
							</span>
						</div>
					)}
				</div>

				{/* Status Text */}
				<p className="text-sm text-slate-500 mt-2">
					{isRunning ? 'Em andamento' : 'Pausado'}
				</p>
			</div>

			{/* Facilitator Controls */}
			{isFacilitator && onTimerAction && (
				<div className="flex flex-wrap gap-3 justify-center border-t border-slate-100 pt-6">
					{timer.is_paused ? (
						<button
							onClick={() => onTimerAction('start')}
							className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all"
						>
							<FaPlay className="text-sm" />
							{timer.started_at ? 'Retomar' : 'Iniciar'}
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
					
					{timer.started_at && (
						<button
							onClick={() => onTimerAction('reset')}
							className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all"
						>
							<FaStop className="text-sm" />
							Resetar
						</button>
					)}
				</div>
			)}

			{/* Read-only note for non-facilitators */}
			{!isFacilitator && (
				<div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
					Apenas o facilitador pode controlar o timer
				</div>
			)}
		</div>
	);
}
