import { FaBook, FaFolder, FaTag, FaAlignLeft } from 'react-icons/fa';

export default function ScenarioInfo({ scenario }) {
	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2.5 bg-indigo-100 rounded-xl">
					<FaBook className="text-xl text-indigo-600" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Cenário do Treinamento
					</h3>
				</div>
			</div>

			{/* Scenario Details */}
			<div className="space-y-4">
				{/* Title */}
				{scenario.title && (
				<div className="p-4 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
						<h4 className="text-lg font-bold text-slate-900 mb-1">
							{scenario.title}
						</h4>
						{scenario.description && (
							<p className="text-sm text-slate-600">
								{scenario.description}
							</p>
						)}
					</div>
				)}

				{/* Metadata Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{/* Category */}
					<div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
						<div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200/60">
							<FaFolder className="text-slate-400" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs text-slate-500 mb-1">Categoria</p>
							<p className="font-semibold text-slate-900 text-sm truncate">
								{scenario.category}
							</p>
						</div>
					</div>

					{/* Type */}
					<div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
						<div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200/60">
							<FaTag className="text-slate-400" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs text-slate-500 mb-1">Tipo</p>
							<p className="font-semibold text-slate-900 text-sm truncate">
								{scenario.type}
							</p>
						</div>
					</div>
				</div>

				{/* Scenario ID */}
				<div className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
					<div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200/60">
						<FaAlignLeft className="text-slate-400" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-xs text-slate-500 mb-1">ID do Cenário</p>
						<p className="font-mono text-xs text-slate-700 break-all">
							{scenario.id}
						</p>
					</div>
				</div>
			</div>

			{/* Info Note */}
			<div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
				<p className="text-xs text-blue-700">
					Este cenário contém todos os detalhes e etapas para o treinamento.
				</p>
			</div>
		</div>
	);
}
