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
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 dark:from-slate-900 via-gray-50 dark:via-slate-900 to-zinc-100 dark:to-slate-800">
				<div className="text-center">
					<div className="relative inline-flex">
						<div className="w-14 h-14 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-600 rounded-full animate-spin"></div>
					</div>
					<p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Carregando...</p>
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
						<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
							Gerenciar Sessões
						</h1>
						<p className="text-slate-600 dark:text-slate-400 mt-1">
							Visualize e gerencie todas as suas sessões ativas
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
					<div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex items-start gap-3 animate-shake">
						<div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl shrink-0">
							<FaExclamationTriangle className="text-red-500 dark:text-red-400" />
						</div>
						<p className="text-sm text-red-700 dark:text-red-300 pt-1">{error}</p>
					</div>
				)}

				{/* Sessions List */}
				{loading ? (
					<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 dark:border-slate-700/60 p-12 text-center">
						<div className="relative inline-flex">
							<div className="w-14 h-14 border-4 border-blue-200 dark:border-blue-900/50 border-t-blue-600 rounded-full animate-spin"></div>
						</div>
						<p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Carregando sessões...</p>
					</div>
				) : sessions.length === 0 ? (
					<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 dark:border-slate-700/60 p-12 text-center">
						<div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
							<div className="absolute inset-0 bg-linear-to-br from-slate-100 dark:from-slate-800 to-slate-200 rounded-2xl" />
							<FaDesktop className="relative text-3xl text-slate-400 dark:text-slate-500" />
						</div>
						<p className="text-slate-600 dark:text-slate-400 font-medium">Nenhuma sessão ativa encontrada</p>
					</div>
				) : (
					<div className="space-y-4">
						{sessions.map((sess) => (
							<div
								key={sess.id}
								className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 border p-5 lg:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all ${
									sess.is_current 
										? 'border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-900/40' 
										: 'border-slate-200/60 dark:border-slate-700/60'
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
												<h3 className="font-semibold text-slate-900 dark:text-slate-100">
													{sess.user_agent || 'Navegador Desconhecido'}
												</h3>
												{sess.is_current && (
													<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
														<FaCheckCircle className="text-xs" />
														Sessão Atual
													</span>
												)}
											</div>

											<div className="space-y-2">
												<div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
													<FaMapMarkerAlt className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
													<span className="break-all">
														IP: {sess.ip_address || 'Não disponível'}
													</span>
												</div>

												<div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
													<FaClock className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
													<span>
														Criada em: {new Date(sess.created_at).toLocaleString('pt-BR')}
													</span>
												</div>

												<div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
													<FaClock className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
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
				<div className="bg-linear-to-br from-blue-50 dark:from-blue-950/40 to-indigo-50 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-2xl p-5 lg:p-6">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 shrink-0">
							<FaShieldAlt className="text-lg text-white" />
						</div>
						<div>
							<h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
								Sobre as Sessões
							</h3>
							<p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
								Suas sessões ativas representam os dispositivos e navegadores onde você está conectado.
								Se você perceber alguma sessão suspeita, encerre-a imediatamente e altere sua senha.
								As sessões expiram automaticamente após 30 dias.
							</p>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
