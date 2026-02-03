import RoundsTab from './RoundsTab';
import MetricsTab from './MetricsTab';
import QuestionsTab from './QuestionsTab';
import ParticipantsTab from './ParticipantsTab';

/**
 * TrainingTabs Component
 * Tab navigation system for training management
 */
export default function TrainingTabs({ 
	training, 
	currentTime, 
	formatTime, 
	getRoleBadge,
	activeTab,
	setActiveTab 
}) {
	const tabs = [
		{ id: 'rounds', label: 'Rodadas', icon: '🔄' },
		{ id: 'metrics', label: 'Métricas', icon: '📊' },
		{ id: 'questions', label: 'Questões', icon: '❓' },
		{ id: 'participants', label: 'Participantes', icon: '👥' }
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case 'rounds':
				return <RoundsTab />;
			
			case 'metrics':
				return (
					<MetricsTab 
						training={training}
						currentTime={currentTime}
						formatTime={formatTime}
					/>
				);
			
			case 'questions':
				return <QuestionsTab />;
			
			case 'participants':
				return (
					<ParticipantsTab 
						training={training}
						getRoleBadge={getRoleBadge}
					/>
				);
			
			default:
				return null;
		}
	};

	return (
		<div className="bg-white shadow rounded-lg overflow-hidden">
			{/* Tab Headers */}
			<div className="border-b border-gray-200">
				<nav className="flex -mb-px">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
								flex-1 py-4 px-6 text-center font-medium text-sm transition-colors
								${activeTab === tab.id
									? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
									: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
								}
							`}
						>
							<span className="mr-2">{tab.icon}</span>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			{/* Tab Content */}
			<div className="p-6">
				{renderTabContent()}
			</div>
		</div>
	);
}
