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
	FaMapMarkerAlt,
	FaCheckCircle,
	FaShieldAlt
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
			setError('Erro ao buscar sessoes');
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
			setError('Token CSRF nao disponivel');
			return;
		}

		if (!confirm('Tem certeza que deseja encerrar esta sessao?')) {
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
			setError('Erro ao revogar sessao');
		} finally {
			setRevoking(null);
		}
	};

	// Revoke all other sessions
	const revokeAllSessions = async () => {
		if (!csrf_token) {
			setError('Token CSRF nao disponivel');
			return;
		}

		if (!confirm('Tem certeza que deseja encerrar todas as outras sessoes? Esta acao nao pode ser desfeita.')) {
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
				alert(`${data.revoked_count} sessao(oes) encerrada(s) com sucesso`);
			} else {
				setError(data.message);
			}
		} catch (err) {
			console.error('Failed to revoke all sessions');
			setError('Erro ao revogar sessoes');
		} finally {
			setLoading(false);
		}
	};

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-gray-50 to-zinc-100">
				<div className="text-center">
					<div className="relative inline-flex">
						<div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
					</div>
					<p className="mt-4 text-slate-600 font-medium">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<DashboardLayout>
			<div className="space-y-6 lg:space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="min-w-0">
						<h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
							Gerenciar Sessoes
						</h1>
						<p className="text-slate-600 mt-1">
							Visualize e gerencie todas as suas sessoes ativas
						</p>
					</div>
					<button
						onClick={revokeAllSessions}
						disabled={loading || sessions.length === 0}
						className="flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto font-semibold"
					>
						<FaExclamationTriangle className="shrink-0" />
						<span className="whitespace-nowrap">Encerrar Todas as Outras</span>
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-shake">
						<div className="p-2 bg-red-100 rounded-xl shrink-0">
							<FaExclamationTriangle className="text-red-500" />
						</div>
						<p className="text-sm text-red-700 pt-1">{error}</p>
					</div>
				)}

				{/* Sessions List */}
				{loading ? (
					<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-12 text-center">
						<div className="relative inline-flex">
							<div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						</div>
						<p className="mt-4 text-slate-600 font-medium">Carregando sessoes...</p>
					</div>
				) : sessions.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-12 text-center">
						<div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
							<div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl" />
							<FaDesktop className="relative text-3xl text-slate-400" />
						</div>
						<p className="text-slate-600 font-medium">Nenhuma sessao ativa encontrada</p>
					</div>
				) : (
					<div className="space-y-4">
						{sessions.map((sess) => (
							<div
								key={sess.id}
								className={`bg-white rounded-2xl shadow-sm shadow-slate-200/50 border p-5 lg:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all ${
									sess.is_current 
										? 'border-emerald-300 ring-2 ring-emerald-100' 
										: 'border-slate-200/60'
								}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
									<div className="flex items-start gap-4 flex-1 min-w-0">
										<div className={`relative p-3.5 rounded-xl shrink-0 ${
											sess.is_current 
												? 'bg-linear-to-br from-emerald-500 to-teal-600' 
												: 'bg-linear-to-br from-blue-500 to-indigo-600'
										}`}>
											<FaDesktop className="text-xl text-white" />
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap mb-3">
												<h3 className="font-semibold text-slate-900">
													{sess.user_agent || 'Navegador Desconhecido'}
												</h3>
												{sess.is_current && (
													<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
														<FaCheckCircle className="text-xs" />
														Sessao Atual
													</span>
												)}
											</div>

											<div className="space-y-2">
												<div className="flex items-start gap-2 text-sm text-slate-600">
													<FaMapMarkerAlt className="text-slate-400 shrink-0 mt-0.5" />
													<span className="break-all">
														IP: {sess.ip_address || 'Nao disponivel'}
													</span>
												</div>

												<div className="flex items-start gap-2 text-sm text-slate-600">
													<FaClock className="text-slate-400 shrink-0 mt-0.5" />
													<span>
														Criada em: {new Date(sess.created_at).toLocaleString('pt-BR')}
													</span>
												</div>

												<div className="flex items-start gap-2 text-sm text-slate-600">
													<FaClock className="text-slate-400 shrink-0 mt-0.5" />
													<span>
														Expira em: {new Date(sess.expires_at).toLocaleString('pt-BR')}
													</span>
												</div>
											</div>
										</div>
									</div>

									<button
										onClick={() => revokeSession(sess.id)}
										disabled={revoking === sess.id}
										className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto font-medium"
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
				<div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-5 lg:p-6">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 shrink-0">
							<FaShieldAlt className="text-lg text-white" />
						</div>
						<div>
							<h3 className="font-semibold text-blue-900 mb-2">
								Sobre as Sessoes
							</h3>
							<p className="text-sm text-blue-800 leading-relaxed">
								Suas sessoes ativas representam os dispositivos e navegadores onde voce esta conectado.
								Se voce perceber alguma sessao suspeita, encerre-a imediatamente e altere sua senha.
								As sessoes expiram automaticamente apos 30 dias.
							</p>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
