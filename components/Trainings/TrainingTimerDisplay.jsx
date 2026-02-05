import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

export default function TrainingTimerDisplay({ training }) {
	const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
	const trainingTimer = training.training_timer || {};

	// Calculate elapsed time
	useEffect(() => {
		let interval;

		const calculateElapsedTime = () => {
			if (trainingTimer.is_paused || !trainingTimer.started_at) {
				// Timer is paused or not started, use stored elapsed_time
				return trainingTimer.elapsed_time || 0;
			} else {
				// Timer is running, calculate current elapsed time
				const startedAt = new Date(trainingTimer.started_at);
				const now = new Date();
				const currentRunTime = now - startedAt;
				return (trainingTimer.elapsed_time || 0) + currentRunTime;
			}
		};

		// Update immediately
		setCurrentElapsedTime(calculateElapsedTime());

		// Update every second if timer is running
		if (!trainingTimer.is_paused && trainingTimer.started_at) {
			interval = setInterval(() => {
				setCurrentElapsedTime(calculateElapsedTime());
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [trainingTimer.is_paused, trainingTimer.started_at, trainingTimer.elapsed_time]);

	// Format time as HH:MM:SS
	const formatTime = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	const isRunning = !trainingTimer.is_paused && trainingTimer.started_at;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Timer Display */}
			<div className="flex flex-col items-center">
				<div className="flex items-center gap-3 mb-3">
					<FaClock className="text-2xl text-slate-400" />
					<h3 className="text-lg font-semibold text-slate-900">
						Tempo Total de Treinamento
					</h3>
				</div>

				{/* Time Display */}
				<div className="relative">
					<div className={`text-5xl lg:text-6xl font-mono font-bold ${isRunning ? 'text-blue-600' : 'text-slate-700'} transition-colors`}>
						{formatTime(currentElapsedTime)}
					</div>
					{isRunning && (
						<div className="absolute -top-2 -right-2">
							<span className="flex h-4 w-4">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
							</span>
						</div>
					)}
				</div>

				{/* Status Text */}
				<p className="text-sm text-slate-500 mt-2">
					{isRunning ? 'Treinamento em execução' : 'Tempo pausado'}
				</p>

				{/* Info Note */}
				<div className="text-center text-xs text-slate-400 mt-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
					Timer automático controlado pelo status do treinamento
				</div>
			</div>
		</div>
	);
}
