"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import { 
	FaDesktop, 
	FaTrash, 
	FaExclamationTriangle,
	FaSpinner,
	FaClock,
	FaMapMarkerAlt
} from 'react-icons/fa';

export default function SessionsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [sessions, setSessions] = useState([]);
	const [csrf_token, setCsrfToken] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [revoking, setRevoking] = useState(null);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	// Fetch CSRF token
	useEffect(() => {
		const fetchCsrfToken = async () => {
			try {
				const response = await fetch('/api/csrf');
				const data = await response.json();
				if (data.success) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Failed to fetch CSRF token');
			}
		};

		fetchCsrfToken();
	}, []);

	// Fetch sessions
	const fetchSessions = async () => {
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/users/sessions');
			const data = await response.json();

			if (data.success) {
				setSessions(data.sessions);
			} else {
				setError(data.message);
			}
		} catch (err) {
			console.error('Failed to fetch sessions');
			setError('Erro ao buscar sessões');
		} finally {
			setLoading(false);
		}
	};

	// Fetch sessions on mount
	useEffect(() => {
		if (session) {
			fetchSessions();
		}
	}, [session]);

	// Revoke specific session
	const revokeSession = async (token_id) => {
		if (!csrf_token) {
			setError('Token CSRF não disponível');
			return;
		}

		if (!confirm('Tem certeza que deseja encerrar esta sessão?')) {
			return;
		}

		setRevoking(token_id);
		setError('');

		try {
			const response = await fetch('/api/users/sessions/revoke', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrf_token,
				},
				body: JSON.stringify({ token_id }),
			});

			const data = await response.json();

			if (data.success) {
				fetchSessions();
			} else {
				setError(data.message);
			}
		} catch (err) {
			console.error('Failed to revoke session');
			setError('Erro ao revogar sessão');
		} finally {
			setRevoking(null);
		}
	};

	// Revoke all other sessions
	const revokeAllSessions = async () => {
		if (!csrf_token) {
			setError('Token CSRF não disponível');
			return;
		}

		if (!confirm('Tem certeza que deseja encerrar todas as outras sessões? Esta ação não pode ser desfeita.')) {
			return;
		}

		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/users/sessions/revoke-all', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrf_token,
				},
			});

			const data = await response.json();

			if (data.success) {
				fetchSessions();
				alert(`${data.revoked_count} sessão(ões) encerrada(s) com sucesso`);
			} else {
				setError(data.message);
			}
		} catch (err) {
			console.error('Failed to revoke all sessions');
			setError('Erro ao revogar sessões');
		} finally {
			setLoading(false);
		}
	};

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<DashboardLayout>
			<div className="space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="min-w-0">
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							Gerenciar Sessões
						</h1>
						<p className="text-sm sm:text-base text-gray-600 mt-1">
							Visualize e gerencie todas as suas sessões ativas
						</p>
					</div>
					<button
						onClick={revokeAllSessions}
						disabled={loading || sessions.length === 0}
						className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto"
					>
						<FaExclamationTriangle className="shrink-0" />
						<span className="whitespace-nowrap">Encerrar Todas as Outras</span>
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
						<FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0 text-sm sm:text-base" />
						<p className="text-xs sm:text-sm text-red-700 warp-break-words">{error}</p>
					</div>
				)}

				{/* Sessions List */}
				{loading ? (
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
						<div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-sm sm:text-base text-gray-600">Carregando sessões...</p>
					</div>
				) : sessions.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
						<FaDesktop className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-4" />
						<p className="text-sm sm:text-base text-gray-600">Nenhuma sessão ativa encontrada</p>
					</div>
				) : (
					<div className="space-y-4">
						{sessions.map((sess) => (
							<div
								key={sess.id}
								className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
									<div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
										<div className="p-2 sm:p-3 bg-blue-50 rounded-lg shrink-0">
											<FaDesktop className="text-xl sm:text-2xl text-blue-600" />
										</div>

										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 wrap-break-words">
												{sess.user_agent || 'Navegador Desconhecido'}
											</h3>

											<div className="space-y-1">
												<div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
													<FaMapMarkerAlt className="text-gray-400 shrink-0 mt-0.5" />
													<span className="break-all">
														IP: {sess.ip_address || 'Não disponível'}
													</span>
												</div>

												<div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
													<FaClock className="text-gray-400 shrink-0 mt-0.5" />
													<span className="wrap-break-words">
														Criada em: {new Date(sess.created_at).toLocaleString('pt-BR')}
													</span>
												</div>

												<div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
													<FaClock className="text-gray-400 shrink-0 mt-0.5" />
													<span className="wrap-break-words">
														Expira em: {new Date(sess.expires_at).toLocaleString('pt-BR')}
													</span>
												</div>
											</div>
										</div>
									</div>

									<button
										onClick={() => revokeSession(sess.id)}
										disabled={revoking === sess.id}
										className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto"
									>
										{revoking === sess.id ? (
											<>
												<FaSpinner className="animate-spin shrink-0" />
												<span>Encerrando...</span>
											</>
										) : (
											<>
												<FaTrash className="shrink-0" />
												<span>Encerrar</span>
											</>
										)}
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Info Box */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
					<h3 className="font-semibold text-sm sm:text-base text-blue-900 mb-2">
						Sobre as Sessões
					</h3>
					<p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
						Suas sessões ativas representam os dispositivos e navegadores onde você está conectado.
						Se você perceber alguma sessão suspeita, encerre-a imediatamente e altere sua senha.
						As sessões expiram automaticamente após 30 dias.
					</p>
				</div>
			</div>
		</DashboardLayout>
	);
}
