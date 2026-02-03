"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import StepIndicator from '@/components/Trainings/StepIndicator';
import CategoryCard from '@/components/Trainings/CategoryCard';
import IncidentTypeCard from '@/components/Trainings/IncidentTypeCard';
import ScenarioCard from '@/components/Trainings/ScenarioCard';
import ErrorAlert from '@/components/Trainings/ErrorAlert';
import LoadingSpinner from '@/components/Trainings/LoadingSpinner';
import {
	FaCheck,
	FaChevronRight,
	FaChevronLeft,
	FaShieldAlt,
	FaBolt,
	FaFileAlt,
	FaRandom,
	FaLock,
	FaLockOpen,
	FaUsers
} from 'react-icons/fa';

export default function NewTrainingPage() {
	const router = useRouter();
	const [current_step, setCurrentStep] = useState(1);
	const [loading_categories, setLoadingCategories] = useState(false);
	const [loading_scenarios, setLoadingScenarios] = useState(false);
	const [error, setError] = useState(null);
	const [csrf_token, setCsrfToken] = useState(null);

	// Form state
	const [categories, setCategories] = useState([]);
	const [selected_category, setSelectedCategory] = useState(null);
	const [selected_type, setSelectedType] = useState(null);

	const [scenarios, setScenarios] = useState([]);
	const [selected_scenario, setSelectedScenario] = useState(null);

	// Step 3 - Session configuration
	const [session_name, setSessionName] = useState('');
	const [session_description, setSessionDescription] = useState('');
	const [access_type, setAccessType] = useState('open'); // 'open' or 'code'
	const [access_code, setAccessCode] = useState('');
	const [max_participants, setMaxParticipants] = useState('15');

	// Load CSRF token and categories on mount
	useEffect(() => {
		const fetchCsrfToken = async () => {
			try {
				const response = await fetch('/api/csrf');
				const data = await response.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Error fetching CSRF token:', err);
			}
		};

		fetchCsrfToken();
		loadCategories();
	}, []);

	// Load scenarios when type is selected
	useEffect(() => {
		if (selected_type && selected_category) {
			loadScenarios();
		}
	}, [selected_type, selected_category]);

	const loadCategories = async () => {
		setLoadingCategories(true);
		setError(null);
		try {
			const response = await fetch('/api/trainings/categories');
			const data = await response.json();

			if (data.success) {
				setCategories(data.categories);
			} else {
				setError(data.message);
			}
		} catch (err) {
			setError('Erro ao carregar categorias');
			console.error(err);
		} finally {
			setLoadingCategories(false);
		}
	};

	const loadScenarios = async () => {
		setLoadingScenarios(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/trainings/scenarios?category_id=${selected_category.id}&type_id=${selected_type.id}`
			);
			const data = await response.json();

			if (data.success) {
				setScenarios(data.scenarios);
			} else {
				setError(data.message);
			}
		} catch (err) {
			setError('Erro ao carregar cenários');
			console.error(err);
		} finally {
			setLoadingScenarios(false);
		}
	};

	const handleNext = () => {
		if (current_step === 1 && !selected_type) {
			setError('Selecione uma categoria e tipo de incidente');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		if (current_step === 2 && !selected_scenario) {
			setError('Selecione um cenário');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		setError(null);
		setCurrentStep(prev => prev + 1);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleBack = () => {
		setError(null);
		setCurrentStep(prev => prev - 1);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleCategorySelect = (category) => {
		setSelectedCategory(category);
		setSelectedType(null);
		setSelectedScenario(null);
		setScenarios([]);
	};

	const handleTypeSelect = (type) => {
		setSelectedType(type);
		setSelectedScenario(null);
		setScenarios([]);
	};

	const generateAccessCode = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let code = '';
		for (let i = 0; i < 8; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setAccessCode(code);
	};

	const handleCreateTraining = async () => {
		setError(null);

		// Validate session configuration
		if (!session_name.trim()) {
			setError('O nome da sessão é obrigatório');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		if (access_type === 'code' && !access_code.trim()) {
			setError('Defina um código de acesso ou gere um automaticamente');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		if (!max_participants || isNaN(max_participants) || parseInt(max_participants) < 1) {
			setError('O número máximo de participantes é obrigatório e deve ser maior que 0');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		try {
			// Check if CSRF token is available
			if (!csrf_token) {
				setError('Token de segurança não disponível. Recarregue a página.');
				window.scrollTo({ top: 0, behavior: 'smooth' });
				return;
			}

			// Prepare training data
			const trainingData = {
				session_name: session_name.trim(),
				session_description: session_description.trim(),
				selected_category: selected_category,
				selected_type: selected_type,
				selected_scenario: selected_scenario,
				access_type,
				access_code: access_type === 'code' ? access_code.trim() : null,
				max_participants: parseInt(max_participants)
			};

			// Call API to create training
			const response = await fetch('/api/trainings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrf_token,
				},
				body: JSON.stringify(trainingData),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Erro ao criar treinamento');
			}

			// Redirect to training page
			router.push(`/dashboard/trainings/${data.training.id}`);

		} catch (err) {
			console.error('Error creating training:', err);
			setError(err.message || 'Erro ao criar treinamento. Tente novamente.');
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const steps = [
		{ number: 1, title: 'Incidente', icon: FaShieldAlt },
		{ number: 2, title: 'Cenário', icon: FaBolt },
		{ number: 3, title: 'Validação', icon: FaCheck }
	];

	return (
		<DashboardLayout>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-10 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
						<FaShieldAlt className="text-3xl text-white" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
						Criar Novo Treinamento
					</h1>
					<p className="text-lg text-gray-600">
						Configure seu cenário de tabletop em 3 etapas simples
					</p>
				</div>

				{/* Stepper */}
				<div className="mb-10">
					<StepIndicator steps={steps} current_step={current_step} />
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6">
						<ErrorAlert message={error} />
					</div>
				)}

				{/* Content Card */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
					{/* Step 1: Category and Type */}
					{current_step === 1 && (
						<>
							{loading_categories ? (
								<LoadingSpinner />
							) : (
								<div className="space-y-8">
									<div>
										<h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
											Selecione a Categoria
										</h2>
										<p className="text-gray-600 mb-6">
											Escolha a categoria do incidente que você deseja simular
										</p>

										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{categories.map(category => (
												<CategoryCard
													key={category.id}
													category={category}
													isSelected={selected_category?.id === category.id}
													onClick={() => handleCategorySelect(category)}
												/>
											))}
										</div>
									</div>

									{/* Type Selection - Show only when category is selected */}
									{selected_category && (
										<div className="animate-slide-in-right">
											<div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent mb-8" />
											
											<h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
												Selecione o Tipo de Incidente
											</h2>
											<p className="text-gray-600 mb-6">
												Escolha o tipo específico de incidente dentro da categoria <span className="font-semibold text-blue-600">{selected_category.title}</span>
											</p>

											<div className="grid grid-cols-1 gap-3">
												{selected_category.types.map(type => (
													<IncidentTypeCard
														key={type.id}
														type={type}
														isSelected={selected_type?.id === type.id}
														onClick={() => handleTypeSelect(type)}
													/>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</>
					)}

					{/* Step 2: Scenario Selection */}
					{current_step === 2 && (
						<>
							{loading_scenarios ? (
								<LoadingSpinner message="Carregando cenários..." />
							) : (
								<div>
									<h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
										Selecione o Cenário
									</h2>
									<p className="text-gray-600 mb-6">
										Escolha um cenário pré-configurado para o tipo de incidente{' '}
										<span className="font-semibold text-blue-600">{selected_type?.title}</span>
									</p>

									{scenarios.length === 0 ? (
										<div className="text-center py-16">
											<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
												<FaFileAlt className="text-4xl text-gray-400" />
											</div>
											<p className="text-gray-500 text-lg mb-2">
												Nenhum cenário disponível para este tipo de incidente
											</p>
											<p className="text-gray-400 text-sm">
												Volte e selecione outro tipo de incidente
											</p>
										</div>
									) : (
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
											{scenarios.map(scenario => (
												<ScenarioCard
													key={scenario.id}
													scenario={scenario}
													isSelected={selected_scenario?.id === scenario.id}
													onClick={() => setSelectedScenario(scenario)}
												/>
											))}
										</div>
									)}
								</div>
							)}
						</>
					)}

					{/* Step 3: Validation */}
					{current_step === 3 && (
						<div className="space-y-8">
							{/* Scenario Summary */}
							<div>
								<h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
									Resumo do Cenário Selecionado
								</h2>
								<p className="text-gray-600 mb-6">
									Revise os detalhes do cenário e configure a sessão de treinamento
								</p>

								{selected_scenario && (
									<div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
										<div className="mb-4">
											<span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-2">
												{selected_category?.title}
											</span>
											<span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-2 ml-2">
												{selected_type?.title}
											</span>
										</div>
										<h3 className="font-bold text-blue-900 text-xl mb-2">
											{selected_scenario.title}
										</h3>
										<p className="text-blue-700 mb-4">{selected_scenario.description}</p>
										
										{selected_scenario.severity && (
											<div className="flex items-center gap-2 text-sm">
												<span className="text-blue-600 font-semibold">Severidade:</span>
												<span className={`px-2 py-1 rounded font-bold ${
													selected_scenario.severity === 'high' ? 'bg-red-100 text-red-700' :
													selected_scenario.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
													'bg-green-100 text-green-700'
												}`}>
													{selected_scenario.severity === 'high' ? 'Alta' :
													 selected_scenario.severity === 'medium' ? 'Média' : 'Baixa'}
												</span>
											</div>
										)}
									</div>
								)}
							</div>

							<div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />

							{/* Session Configuration */}
							<div>
								<h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
									Configuração da Sessão
								</h2>
								<p className="text-gray-600 mb-6">
									Defina as informações e regras de acesso para esta sessão de treinamento
								</p>

								<div className="space-y-6">
									{/* Session Name */}
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Nome da Sessão <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											value={session_name}
											onChange={(e) => setSessionName(e.target.value)}
											placeholder="Ex: Treinamento DNS Reflection - Turma 2026"
											className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
											maxLength={100}
										/>
										<p className="text-xs text-gray-500 mt-1">
											{session_name.length}/100 caracteres
										</p>
									</div>

									{/* Session Description */}
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Descrição da Sessão
										</label>
										<textarea
											value={session_description}
											onChange={(e) => setSessionDescription(e.target.value)}
											placeholder="Descreva os objetivos e contexto desta sessão de treinamento..."
											rows={4}
											className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
											maxLength={500}
										/>
										<p className="text-xs text-gray-500 mt-1">
											{session_description.length}/500 caracteres
										</p>
									</div>

									{/* Access Type */}
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-3">
											Forma de Acesso <span className="text-red-500">*</span>
										</label>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{/* Open Access */}
											<button
												type="button"
												onClick={() => setAccessType('open')}
												className={`
													p-4 rounded-xl border-2 transition-all text-left
													${access_type === 'open'
														? 'border-blue-500 bg-blue-50 shadow-md'
														: 'border-gray-300 hover:border-gray-400 bg-white'
													}
												`}
											>
												<div className="flex items-start gap-3">
													<div className={`
														w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
														${access_type === 'open' ? 'border-blue-500' : 'border-gray-300'}
													`}>
														{access_type === 'open' && (
															<div className="w-3 h-3 rounded-full bg-blue-500" />
														)}
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<FaLockOpen className={access_type === 'open' ? 'text-blue-600' : 'text-gray-400'} />
															<h4 className={`font-bold ${
																access_type === 'open' ? 'text-blue-900' : 'text-gray-700'
															}`}>
																Acesso Livre
															</h4>
														</div>
														<p className={`text-sm ${
															access_type === 'open' ? 'text-blue-700' : 'text-gray-600'
														}`}>
															Qualquer pessoa pode participar da sessão sem necessidade de código
														</p>
													</div>
												</div>
											</button>

											{/* Code Access */}
											<button
												type="button"
												onClick={() => setAccessType('code')}
												className={`
													p-4 rounded-xl border-2 transition-all text-left
													${access_type === 'code'
														? 'border-blue-500 bg-blue-50 shadow-md'
														: 'border-gray-300 hover:border-gray-400 bg-white'
													}
												`}
											>
												<div className="flex items-start gap-3">
													<div className={`
														w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
														${access_type === 'code' ? 'border-blue-500' : 'border-gray-300'}
													`}>
														{access_type === 'code' && (
															<div className="w-3 h-3 rounded-full bg-blue-500" />
														)}
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<FaLock className={access_type === 'code' ? 'text-blue-600' : 'text-gray-400'} />
															<h4 className={`font-bold ${
																access_type === 'code' ? 'text-blue-900' : 'text-gray-700'
															}`}>
																Código de Acesso
															</h4>
														</div>
														<p className={`text-sm ${
															access_type === 'code' ? 'text-blue-700' : 'text-gray-600'
														}`}>
															Participantes precisam de um código para poder acessar a sessão
														</p>
													</div>
												</div>
											</button>
										</div>
									</div>

									{/* Access Code Input - Only shown when code is selected */}
									{access_type === 'code' && (
										<div className="animate-slide-in-right">
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												Código de Acesso <span className="text-red-500">*</span>
											</label>
											<div className="flex flex-col sm:flex-row gap-2">
												<input
													type="text"
													value={access_code}
													onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
													placeholder="Digite ou gere um código"
													className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono font-bold text-lg"
													maxLength={20}
												/>
												<button
													type="button"
													onClick={generateAccessCode}
													className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all whitespace-nowrap flex items-center justify-center gap-2"
												>
													<FaRandom />
													Gerar Código
												</button>
											</div>
											<p className="text-xs text-gray-500 mt-1">
												O código pode conter letras e números (máx. 20 caracteres)
											</p>
										</div>
									)}

									{/* Max Participants */}
									<div>
										<label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
											<FaUsers className="text-gray-600" />
											Limite de Participantes <span className="text-red-500">*</span>
										</label>
										<input
											type="number"
											value={max_participants}
											onChange={(e) => setMaxParticipants(e.target.value)}
											placeholder="Número máximo de participantes"
											min="1"
											className="w-full md:w-64 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
										/>
										<p className="text-xs text-gray-500 mt-1">
											Defina o número máximo de participantes permitidos nesta sessão. Esse número deve ser a soma de todos os facilitadores, participantes e observadores.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Navigation Buttons */}
				<div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
					<button
						onClick={handleBack}
						disabled={current_step === 1}
						className={`
							group flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold transition-all transform
							${current_step === 1
								? 'bg-gray-100 text-gray-400 cursor-not-allowed'
								: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg hover:scale-105'
							}
						`}
					>
						<FaChevronLeft className={`text-sm transition-transform ${current_step !== 1 ? 'group-hover:-translate-x-1' : ''}`} />
						<span>Voltar</span>
					</button>

					{current_step < 3 ? (
						<button
							onClick={handleNext}
							className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:scale-105"
						>
							<span>Próximo</span>
							<FaChevronRight className="text-sm transition-transform group-hover:translate-x-1" />
						</button>
					) : (
						<button
							onClick={handleCreateTraining}
							className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all transform hover:scale-105"
						>
							<FaCheck className="text-sm" />
							<span>Criar Treinamento</span>
						</button>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
