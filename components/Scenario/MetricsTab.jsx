/**
 * MetricsTab Component
 * Displays training metrics and statistics
 * Only counts users with role 'participant' (excludes facilitator and observer)
 */
export default function MetricsTab({ training, currentTime, formatTime }) {
	// Count only participants with role 'participant'
	const activeParticipants = training?.participants.filter(
		p => p.role === 'participant'
	).length || 0;

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">Métricas e Estatísticas</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-blue-600 font-medium">Tempo Total</p>
							<p className="text-2xl font-bold text-blue-900 mt-1">
								{formatTime(currentTime)}
							</p>
						</div>
						<div className="text-3xl">⏱️</div>
					</div>
				</div>
				<div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-green-600 font-medium">Participantes Ativos</p>
							<p className="text-2xl font-bold text-green-900 mt-1">
								{activeParticipants}
							</p>
						</div>
						<div className="text-3xl">👥</div>
					</div>
				</div>
				<div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-purple-600 font-medium">Rodadas Concluídas</p>
							<p className="text-2xl font-bold text-purple-900 mt-1">0</p>
						</div>
						<div className="text-3xl">✅</div>
					</div>
				</div>
			</div>
			<div className="bg-gray-50 rounded-lg p-8 text-center">
				<p className="text-gray-500">Métricas detalhadas serão exibidas aqui.</p>
				<p className="text-sm text-gray-400 mt-2">
					Acompanhe o desempenho e engajamento dos participantes em tempo real.
				</p>
			</div>
		</div>
	);
}
