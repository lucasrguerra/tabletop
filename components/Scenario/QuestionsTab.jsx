/**
 * QuestionsTab Component
 * Displays and manages training questions and issues
 */
export default function QuestionsTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">Questões e Problemas</h3>
				<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
					+ Nova Questão
				</button>
			</div>
			<div className="bg-gray-50 rounded-lg p-8 text-center">
				<p className="text-gray-500">Nenhuma questão registrada ainda.</p>
				<p className="text-sm text-gray-400 mt-2">
					Documente questões, problemas e decisões tomadas durante o treinamento.
				</p>
			</div>
		</div>
	);
}
