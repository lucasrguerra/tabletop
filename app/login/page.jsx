"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import {
	FaUser,
	FaLock,
	FaSignInAlt,
	FaExclamationCircle,
	FaEye,
	FaEyeSlash,
	FaArrowLeft
} from 'react-icons/fa';

export default function LoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		identifier: '',
		password: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [csrf_token, setCsrfToken] = useState('');

	// Fetch CSRF token on component mount
	useEffect(() => {
		const fetchCsrfToken = async () => {
			try {
				const response = await fetch('/api/csrf');
				const data = await response.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				} else {
					setError('Erro ao carregar token de seguranca');
				}
			} catch (err) {
				console.error('Failed to fetch CSRF token');
				setError('Erro ao carregar token de seguranca');
			}
		};

		fetchCsrfToken();
	}, []);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
		setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!csrf_token) {
			setError('Token de seguranca nao encontrado. Recarregue a pagina.');
			return;
		}

		setLoading(true);

		try {
			const result = await signIn('credentials', {
				identifier: formData.identifier,
				password: formData.password,
				csrfToken: csrf_token,
				redirect: false,
			});

			if (result?.error) {
				setError('Email/Nickname ou senha invalidos');
			} else if (result?.ok) {
				router.push('/dashboard');
				router.refresh();
			}
		} catch (err) {
			console.error('Login error');
			setError('Erro ao fazer login. Tente novamente.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
			<Header />
			
			<div className="flex items-center justify-center px-4 py-12 lg:py-16">
				<div className="w-full max-w-md animate-slide-in-up">
					{/* Card */}
					<div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8 lg:p-10">
						{/* Header */}
						<div className="text-center mb-8">
							<div className="relative inline-flex items-center justify-center w-16 h-16 mb-5">
								<div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-40" />
								<div className="relative w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
									<FaSignInAlt className="text-2xl text-white" />
								</div>
							</div>
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
								Bem-vindo de volta
							</h1>
							<p className="text-slate-500">
								Acesse sua conta para continuar
							</p>
						</div>

						{/* Error Message */}
						{error && (
							<div id="error-message" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
								<div className="p-1.5 bg-red-100 rounded-lg shrink-0">
									<FaExclamationCircle className="text-red-500" />
								</div>
								<p className="text-sm text-red-700 pt-0.5">{error}</p>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 mb-2">
									Email ou Nickname
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<FaUser className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<input
										type="text"
										id="identifier"
										name="identifier"
										value={formData.identifier}
										onChange={handleChange}
										required
										className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl 
											text-slate-900 placeholder-slate-400
											focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
											transition-all duration-200"
										placeholder="seu@email.com ou nickname"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
									Senha
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<FaLock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<input
										type={showPassword ? "text" : "password"}
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl 
											text-slate-900 placeholder-slate-400
											focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
											transition-all duration-200"
										placeholder="Digite sua senha"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
										aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
									>
										{showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
									</button>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-6 py-3.5 
									bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
									text-white font-semibold rounded-xl 
									shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 
									focus:outline-none focus:ring-4 focus:ring-blue-500/20 
									transition-all duration-200 
									disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg
									btn-press"
							>
								{loading ? (
									<>
										<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										<span>Entrando...</span>
									</>
								) : (
									<>
										<FaSignInAlt />
										<span>Entrar</span>
									</>
								)}
							</button>
						</form>

						{/* Footer */}
						<div className="mt-8 pt-6 border-t border-slate-100 text-center">
							<p className="text-sm text-slate-600">
								Nao tem uma conta?{' '}
								<Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
									Cadastre-se
								</Link>
							</p>
						</div>
					</div>

					{/* Back Link */}
					<div className="text-center mt-6">
						<Link 
							href="/" 
							className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
						>
							<FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
							<span>Voltar para pagina inicial</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
