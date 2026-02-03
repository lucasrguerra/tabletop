import { useState } from 'react';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

/**
 * PendingInvites Component
 * Displays pending training invitations with accept/decline actions
 */
export default function PendingInvites({ invites, onInviteUpdated }) {
	const [processing, setProcessing] = useState({});
	const [error, setError] = useState('');

	const handleInvite = async (trainingId, action) => {
		setProcessing(prev => ({ ...prev, [trainingId]: action }));
		setError('');

		try {
			// Get CSRF token
			const csrfResponse = await fetch('/api/csrf');
			const csrfData = await csrfResponse.json();

			if (!csrfData.success) {
				throw new Error('Erro ao obter token de segurança');
			}

			// Accept or decline invite
			const endpoint = action === 'accept' ? 'accept' : 'decline';
			const response = await fetch(`/api/trainings/${trainingId}/${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrfData.csrf_token
				}
			});

			const data = await response.json();

			if (!data.success) {
				setError(data.message || `Erro ao ${action === 'accept' ? 'aceitar' : 'recusar'} convite`);
				return;
			}

			// Call callback to refresh invites
			if (onInviteUpdated) {
				onInviteUpdated();
			}

		} catch (err) {
			console.error(`Error ${action}ing invite:`, err);
			setError(`Erro ao ${action === 'accept' ? 'aceitar' : 'recusar'} convite. Tente novamente.`);
		} finally {
			setProcessing(prev => {
				const newProcessing = { ...prev };
				delete newProcessing[trainingId];
				return newProcessing;
			});
		}
	};

	// Get role badge
	const getRoleBadge = (role) => {
		const styles = {
			facilitator: 'bg-purple-100 text-purple-800',
			participant: 'bg-blue-100 text-blue-800',
			observer: 'bg-gray-100 text-gray-800'
		};

		const labels = {
			facilitator: 'Facilitador',
			participant: 'Participante',
			observer: 'Observador'
		};

		return (
			<span className={`px-2 py-1 rounded text-xs font-medium ${styles[role]}`}>
				{labels[role]}
			</span>
		);
	};

	if (!invites || invites.length === 0) {
		return null;
	}

	return (
		<div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg space-y-4">
			<div className="flex items-center gap-2 mb-4">
				<FaClock className="text-blue-600 text-xl" />
				<h2 className="text-lg font-semibold text-gray-900">
					Convites Pendentes ({invites.length})
				</h2>
			</div>

			{error && (
				<div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
					<p className="text-sm text-red-700">{error}</p>
				</div>
			)}

			<div className="space-y-3">
				{invites.map((invite) => (
					<div 
						key={invite.id} 
						className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
					>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<h3 className="font-semibold text-gray-900">
										{invite.name}
									</h3>
									{getRoleBadge(invite.invited_role)}
								</div>
								
								{invite.description && (
									<p className="text-sm text-gray-600 mb-2">
										{invite.description}
									</p>
								)}

								<div className="flex flex-wrap gap-4 text-xs text-gray-500">
									<div>
										<span className="font-medium">Criado por:</span> {invite.created_by.name} (@{invite.created_by.nickname})
									</div>
									<div>
										<span className="font-medium">Cenário:</span> {invite.scenario.scenario_title}
									</div>
									<div>
										<span className="font-medium">Participantes:</span> {invite.participants_count}/{invite.max_participants}
									</div>
									{invite.scheduled_for && (
										<div>
											<span className="font-medium">Agendado para:</span> {new Date(invite.scheduled_for).toLocaleString('pt-BR')}
										</div>
									)}
								</div>
							</div>

							<div className="flex gap-2">
								<button
									onClick={() => handleInvite(invite.id, 'accept')}
									disabled={processing[invite.id]}
									className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{processing[invite.id] === 'accept' ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											Aceitando...
										</>
									) : (
										<>
											<FaCheck />
											Aceitar
										</>
									)}
								</button>

								<button
									onClick={() => handleInvite(invite.id, 'decline')}
									disabled={processing[invite.id]}
									className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{processing[invite.id] === 'decline' ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											Recusando...
										</>
									) : (
										<>
											<FaTimes />
											Recusar
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
