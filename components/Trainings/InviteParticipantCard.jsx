import { useState, useEffect } from 'react';
import { FaUserPlus, FaSpinner } from 'react-icons/fa';

export default function InviteParticipantCard({ trainingId, onInviteSent }) {
	const [nickname, setNickname] = useState('');
	const [role, setRole] = useState('participant');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [csrfToken, setCsrfToken] = useState(null);

	useEffect(() => {
		const fetchCsrf = async () => {
			try {
				const res = await fetch('/api/csrf');
				const data = await res.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Error fetching CSRF token:', err);
			}
		};
		fetchCsrf();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!nickname.trim()) {
			setError('Digite um nickname válido');
			return;
		}

		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const response = await fetch(`/api/trainings/${trainingId}/participants`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				credentials: 'include',
				body: JSON.stringify({ nickname: nickname.trim(), role })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao enviar convite');
			}

			setSuccess(data.message);
			setNickname('');
			setRole('participant');

			// Notify parent component
			if (onInviteSent) {
				onInviteSent(data.participant);
			}

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(null), 3000);

		} catch (err) {
			console.error('Error inviting participant:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			<div className="flex items-start gap-4 mb-6">
				<div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
					<FaUserPlus className="text-xl text-white" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900 mb-1">
						Convidar Participante
					</h3>
					<p className="text-sm text-slate-600">
						Adicione usuários ao treinamento usando o nickname
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-2">
						Nickname do Usuário
					</label>
					<input
						type="text"
						id="nickname"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						placeholder="Digite o nickname"
						className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
						disabled={loading}
						required
					/>
				</div>

				<div>
					<label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
						Papel no Treinamento
					</label>
					<select
						id="role"
						value={role}
						onChange={(e) => setRole(e.target.value)}
						className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
						disabled={loading}
					>
						<option value="participant">Participante</option>
						<option value="facilitator">Facilitador</option>
						<option value="observer">Observador</option>
					</select>
					<p className="mt-2 text-xs text-slate-500">
						O usuário receberá um convite e precisará aceitá-lo para participar
					</p>
				</div>

				{error && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-xl">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{success && (
					<div className="p-3 bg-green-50 border border-green-200 rounded-xl">
						<p className="text-sm text-green-700">{success}</p>
					</div>
				)}

				<button
					type="submit"
					disabled={loading || !nickname.trim()}
					className="w-full px-5 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? (
						<>
							<FaSpinner className="text-sm animate-spin" />
							<span>Enviando convite...</span>
						</>
					) : (
						<>
							<FaUserPlus className="text-sm" />
							<span>Enviar Convite</span>
						</>
					)}
				</button>
			</form>
		</div>
	);
}
