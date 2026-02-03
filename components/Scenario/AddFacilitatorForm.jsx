import { useState } from 'react';

/**
 * AddParticipantForm Component
 * Form to add a new participant (facilitator, participant, or observer) to the training using nickname
 */
export default function AddParticipantForm({ trainingId, onSuccess }) {
	const [nickname, setNickname] = useState('');
	const [role, setRole] = useState('participant');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!nickname.trim()) {
			setError('Por favor, insira um nickname');
			return;
		}

		setLoading(true);

		try {
			// Get CSRF token
			const csrfResponse = await fetch('/api/csrf');
			const csrfData = await csrfResponse.json();

			if (!csrfData.success) {
				throw new Error('Erro ao obter token de segurança');
			}

			// Add participant
			const response = await fetch(`/api/trainings/${trainingId}/facilitator`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrfData.csrf_token
				},
				body: JSON.stringify({ 
					nickname: nickname.trim(),
					role: role
				})
			});

			const data = await response.json();

			if (!data.success) {
				setError(data.message || 'Erro ao enviar convite');
				return;
			}

			setSuccess(data.message);
			setNickname('');
			setRole('participant');
			
			// Call onSuccess callback if provided
			if (onSuccess) {
				onSuccess(data.participant);
			}

			// Clear success message after 5 seconds
			setTimeout(() => {
				setSuccess('');
			}, 5000);

		} catch (err) {
			console.error('Error adding participant:', err);
			setError('Erro ao enviar convite. Tente novamente.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Adicionar Participante
			</h3>
			
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
						Nickname do Usuário
					</label>
					<input
						type="text"
						id="nickname"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						placeholder="Digite o nickname"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						disabled={loading}
					/>
				</div>

				<div>
					<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
						Função
					</label>
					<select
						id="role"
						value={role}
						onChange={(e) => setRole(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						disabled={loading}
					>
						<option value="participant">Participante</option>
						<option value="facilitator">Facilitador</option>
						<option value="observer">Observador</option>
					</select>
					<p className="mt-1 text-sm text-gray-500">
						O usuário receberá um convite que deverá aceitar para participar
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border-l-4 border-red-400 p-4">
						<div className="flex">
							<div className="shrink-0">
								<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				)}

				{success && (
					<div className="bg-green-50 border-l-4 border-green-400 p-4">
						<div className="flex">
							<div className="shrink-0">
								<svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-green-700">{success}</p>
							</div>
						</div>
					</div>
				)}

				<button
					type="submit"
					disabled={loading}
					className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Enviando convite...' : 'Enviar Convite'}
				</button>
			</form>
		</div>
	);
}
