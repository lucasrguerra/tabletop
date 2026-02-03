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
	FaEyeSlash
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
					setError('Erro ao carregar token de segurança');
				}
			} catch (err) {
				console.error('Failed to fetch CSRF token');
				setError('Erro ao carregar token de segurança');
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
			setError('Token de segurança não encontrado. Recarregue a página.');
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
				setError('Email/Nickname ou senha inválidos');
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
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
			<Header />
			
			<div className="flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-2xl shadow-xl p-8">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
								<FaSignInAlt className="text-3xl text-blue-600" />
							</div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Entrar
							</h1>
							<p className="text-gray-600">
								Acesse sua conta
							</p>
						</div>

						{error && (
							<div id="error-message" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
								<FaExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
								<p className="text-sm text-red-700">{error}</p>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
									Email ou Nickname
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaUser className="text-gray-400" />
									</div>
									<input
										type="text"
										id="identifier"
										name="identifier"
										value={formData.identifier}
										onChange={handleChange}
										required
										className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										placeholder="Email ou Nickname"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									Senha
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<FaLock className="text-gray-400" />
									</div>
									<input
										type={showPassword ? "text" : "password"}
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										placeholder="••••••••"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
									>
										{showPassword ? <FaEyeSlash /> : <FaEye />}
									</button>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Não tem uma conta?{' '}
								<Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
									Cadastre-se
								</Link>
							</p>
						</div>
					</div>

					<div className="text-center mt-6">
						<Link href="/" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
							← Voltar para página inicial
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
