/**
 * ParticipantsTab Component
 * Displays list of all training participants
 * Protects data of pending/declined participants (only shows role, nickname, and status)
 */
export default function ParticipantsTab({ training, getRoleBadge }) {
	// Get status badge
	const getStatusBadge = (status) => {
		const styles = {
			pending: 'bg-yellow-100 text-yellow-800',
			accepted: 'bg-green-100 text-green-800',
			declined: 'bg-red-100 text-red-800'
		};

		const labels = {
			pending: 'Pendente',
			accepted: 'Aceito',
			declined: 'Recusado'
		};

		return (
			<span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
				{labels[status]}
			</span>
		);
	};

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">
				Lista de Participantes ({training?.participants.length || 0})
			</h3>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nome
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nickname
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Função
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Entrou em
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{training?.participants.map((participant) => (
							<tr key={participant.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{participant.status === 'accepted' ? participant.name : '•••'}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{participant.status === 'accepted' ? participant.email : '•••'}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{participant.nickname}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{getRoleBadge(participant.role)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{getStatusBadge(participant.status)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(participant.joined_at).toLocaleString('pt-BR')}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
