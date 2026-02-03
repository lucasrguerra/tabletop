/**
 * RoundsTab Component
 * Displays and manages training rounds
 */
export default function RoundsTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">Gerenciamento de Rodadas</h3>
				<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
					+ Nova Rodada
				</button>
			</div>
			<div className="bg-gray-50 rounded-lg p-8 text-center">
				<p className="text-gray-500">Nenhuma rodada criada ainda.</p>
				<p className="text-sm text-gray-400 mt-2">
					Crie rodadas para dividir o treinamento em etapas e acompanhar o progresso.
				</p>
			</div>
		</div>
	);
}
