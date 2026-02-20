"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import {
	FaUser,
	FaEnvelope,
	FaLock,
	FaUserPlus,
	FaExclamationCircle,
	FaCheckCircle,
	FaEye,
	FaEyeSlash,
	FaArrowLeft,
	FaAt
} from 'react-icons/fa';

export default function RegisterPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		nickname: '',
		password: '',
		confirmPassword: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
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
		setSuccess('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (formData.password !== formData.confirmPassword) {
			setError('As senhas nao coincidem');
			return;
		}

		if (!csrf_token) {
			setError('Token de seguranca nao encontrado. Recarregue a pagina.');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch('/api/users/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrf_token,
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					nickname: formData.nickname,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setSuccess(data.message);
				setFormData({
					name: '',
					email: '',
					nickname: '',
					password: '',
					confirmPassword: ''
				});
				
				setTimeout(() => {
					router.push('/login');
				}, 1500);
			} else {
				setError(data.message);
			}
		} catch (err) {
			console.error('Registration error');
			setError('Erro ao cadastrar. Tente novamente.');
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
								<div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-40" />
								<div className="relative w-full h-full bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
									<FaUserPlus className="text-2xl text-white" />
								</div>
							</div>
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
								Criar Conta
							</h1>
							<p className="text-slate-500">
								Preencha os dados para se cadastrar
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

						{/* Success Message */}
						{success && (
							<div id="success-message" className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-fade-in">
								<div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
									<FaCheckCircle className="text-emerald-500" />
								</div>
								<p className="text-sm text-emerald-700 pt-0.5">{success}</p>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
									Nome Completo
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<FaUser className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
										className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl 
											text-slate-900 placeholder-slate-400
											focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
											transition-all duration-200"
										placeholder="Seu nome completo"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
									Email
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<FaEnvelope className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl 
											text-slate-900 placeholder-slate-400
											focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
											transition-all duration-200"
										placeholder="seu@email.com"
									/>
								</div>
							</div>

							<div>
								<label htmlFor="nickname" className="block text-sm font-semibold text-slate-700 mb-2">
									Nickname
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<FaAt className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<input
										type="text"
										id="nickname"
										name="nickname"
										value={formData.nickname}
										onChange={handleChange}
										required
										className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl 
											text-slate-900 placeholder-slate-400
											focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
											transition-all duration-200"
										placeholder="seu_nickname"
									/>
								</div>
								<p className="mt-2 text-xs text-slate-500">
									Apenas letras, numeros, pontos e underscore
								</p>
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
										placeholder="Crie uma senha"
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
								<p className="mt-2 text-xs text-slate-500">
									Minimo 8 caracteres, com maiusculas, minusculas, numeros e caracteres especiais
								</p>
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
									Confirmar Senha
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<FaLock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<input
										type={showConfirmPassword ? "text" : "password"}
										id="confirmPassword"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl 
											text-slate-900 placeholder-slate-400
											focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
											transition-all duration-200"
										placeholder="Confirme sua senha"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
										aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
									>
										{showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
									</button>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-6 py-3.5 
									bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
									text-white font-semibold rounded-xl 
									shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 
									focus:outline-none focus:ring-4 focus:ring-emerald-500/20 
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
										<span>Cadastrando...</span>
									</>
								) : (
									<>
										<FaUserPlus />
										<span>Cadastrar</span>
									</>
								)}
							</button>
						</form>

						{/* Footer */}
						<div className="mt-8 pt-6 border-t border-slate-100 text-center">
							<p className="text-sm text-slate-600">
								Ja tem uma conta?{' '}
								<Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
									Entrar
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
