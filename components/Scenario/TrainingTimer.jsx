/**
 * TrainingTimer Component
 * Displays and controls the training timer
 */
export default function TrainingTimer({ currentTime, formatTime }) {
	return (
		<div className="bg-white shadow rounded-lg p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">Cronômetro</h2>
			<div className="text-center">
				<div className="text-6xl font-mono font-bold text-indigo-600 mb-6">
					{formatTime(currentTime)}
				</div>
				<div className="flex justify-center gap-3">
					<button
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						disabled
					>
						Iniciar
					</button>
					<button
						className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						disabled
					>
						Pausar
					</button>
					<button
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						disabled
					>
						Resetar
					</button>
				</div>
				<p className="mt-4 text-sm text-gray-500">
					Controles do cronômetro em desenvolvimento
				</p>
			</div>
		</div>
	);
}
