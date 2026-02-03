import { useState } from 'react';
import AddFacilitatorForm from './AddFacilitatorForm';

/**
 * TrainingHeader Component
 * Displays training session header information
 */
export default function TrainingHeader({ training, userRole, getStatusBadge, getRoleBadge, onFacilitatorAdded }) {
	const [showAddFacilitator, setShowAddFacilitator] = useState(false);

	const handleFacilitatorAdded = (facilitator) => {
		setShowAddFacilitator(false);
		if (onFacilitatorAdded) {
			onFacilitatorAdded(facilitator);
		}
	};

	return (
		<div className="bg-white shadow rounded-lg p-6">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">{training.name}</h1>
					<p className="mt-1 text-sm text-gray-500">
						Criado por {training.created_by.name} ({training.created_by.nickname})
					</p>
				</div>
				<div className="flex items-center gap-3">
					{getRoleBadge(userRole)}
					{getStatusBadge(training.status)}
				</div>
			</div>
			
			{training.description && (
				<p className="text-gray-700 mb-4">{training.description}</p>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
				<div>
					<p className="text-sm text-gray-500">Cenário</p>
					<p className="font-medium text-gray-900">{training.scenario.scenario_title}</p>
				</div>
				<div>
					<p className="text-sm text-gray-500">Tipo de Acesso</p>
					<p className="font-medium text-gray-900">
						{training.access_type === 'open' ? 'Aberto' : 'Com Código'}
					</p>
					{training.access_code && (
						<p className="text-sm text-indigo-600 font-mono">{training.access_code}</p>
					)}
				</div>
				<div>
					<p className="text-sm text-gray-500">Participantes</p>
					<p className="font-medium text-gray-900">
						{training.participants.length} / {training.max_participants}
					</p>
				</div>
			</div>

			{/* Add Facilitator Section */}
			<div className="mt-6 pt-4 border-t">
				<button
					onClick={() => setShowAddFacilitator(!showAddFacilitator)}
					className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
				>
					<svg 
						className={`w-5 h-5 transition-transform ${showAddFacilitator ? 'rotate-180' : ''}`}
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
					{showAddFacilitator ? 'Ocultar' : 'Adicionar Facilitador'}
				</button>

				{showAddFacilitator && (
					<div className="mt-4">
						<AddFacilitatorForm 
							trainingId={training.id}
							onSuccess={handleFacilitatorAdded}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
