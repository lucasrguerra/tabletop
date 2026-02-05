"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorAlert from '@/components/Trainings/ErrorAlert';
import DashboardLayout from '@/components/Dashboard/Layout';
import CategoryCard from '@/components/Trainings/new/CategoryCard';
import ScenarioCard from '@/components/Trainings/new/ScenarioCard';
import StepIndicator from '@/components/Trainings/new/StepIndicator';
import LoadingSpinner from '@/components/Trainings/LoadingSpinner';
import IncidentTypeCard from '@/components/Trainings/new/IncidentTypeCard';
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
	FaUsers,
	FaSpinner,
	FaCheckCircle,
	FaTimesCircle
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

	// Access code validation state
	const [generating_code, setGeneratingCode] = useState(false);
	const [validating_code, setValidatingCode] = useState(false);
	const [code_is_valid, setCodeIsValid] = useState(null); // null = not validated, true/false = validation result

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

	// Validate access code when it changes (with debounce)
	useEffect(() => {
		if (access_type !== 'code' || !access_code.trim()) {
			setCodeIsValid(null);
			return;
		}

		const debounceTimer = setTimeout(() => {
			validateAccessCode(access_code);
		}, 500);

		return () => clearTimeout(debounceTimer);
	}, [access_code, access_type, csrf_token]);

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

	// Generate access code via API
	const generateAccessCode = async () => {
		setGeneratingCode(true);
		setError(null);
		try {
			const response = await fetch('/api/trainings/access-code/generate');
			const data = await response.json();

			if (data.success && data.access_code) {
				setAccessCode(data.access_code);
				setCodeIsValid(true); // Generated codes are always valid
			} else {
				setError(data.message || 'Erro ao gerar código de acesso');
			}
		} catch (err) {
			console.error('Error generating access code:', err);
			setError('Erro ao gerar código de acesso');
		} finally {
			setGeneratingCode(false);
		}
	};

	// Validate access code via API
	const validateAccessCode = async (code) => {
		if (!code.trim() || !csrf_token) return;

		setValidatingCode(true);
		try {
			const response = await fetch('/api/trainings/access-code/validate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrf_token,
				},
				body: JSON.stringify({ access_code: code }),
			});
			const data = await response.json();

			if (data.success) {
				setCodeIsValid(data.is_valid);
			} else {
				setCodeIsValid(false);
			}
		} catch (err) {
			console.error('Error validating access code:', err);
			setCodeIsValid(null);
		} finally {
			setValidatingCode(false);
		}
	};

	// Handle access code change
	const handleAccessCodeChange = (e) => {
		const newCode = e.target.value.toUpperCase();
		setAccessCode(newCode);
		setCodeIsValid(null); // Reset validation while typing
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

		if (access_type === 'code' && code_is_valid === false) {
			setError('O código de acesso informado não é válido. Use outro código ou gere um automaticamente.');
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
				name: session_name.trim(),
				description: session_description.trim(),
				scenario: {
					category: selected_category.id,
					type: selected_type.id,
					id: selected_scenario.id
				},
				access_type,
				access_code: access_type === 'code' ? access_code.trim() : null,
				max_participants: parseInt(max_participants)
			};

			// Call API to create training
			const response = await fetch('/api/trainings/new', {
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
					<div className="relative inline-flex items-center justify-center w-16 h-16 mb-5">
						<div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-40" />
						<div className="relative w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
							<FaShieldAlt className="text-2xl text-white" />
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
						Criar Novo Treinamento
					</h1>
					<p className="text-lg text-slate-600">
						Configure seu cenario de tabletop em 3 etapas simples
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
				<div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-6 sm:p-8 mb-8">
					{/* Step 1: Category and Type */}
					{current_step === 1 && (
						<>
							{loading_categories ? (
								<LoadingSpinner />
							) : (
								<div className="space-y-8">
									<div>
										<h2 className="text-2xl font-bold text-slate-900 mb-2">
											Selecione a Categoria
										</h2>
										<p className="text-slate-600 mb-6">
											Escolha a categoria do incidente que voce deseja simular
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
										<div className="animate-slide-in-up">
											<div className="h-px bg-linear-to-r from-transparent via-slate-300 to-transparent mb-8" />
											
											<h2 className="text-2xl font-bold text-slate-900 mb-2">
												Selecione o Tipo de Incidente
											</h2>
											<p className="text-slate-600 mb-6">
												Escolha o tipo especifico de incidente dentro da categoria <span className="font-semibold text-blue-600">{selected_category.title}</span>
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
								<LoadingSpinner message="Carregando cenarios..." />
							) : (
								<div>
									<h2 className="text-2xl font-bold text-slate-900 mb-2">
										Selecione o Cenario
									</h2>
									<p className="text-slate-600 mb-6">
										Escolha um cenario pre-configurado para o tipo de incidente{' '}
										<span className="font-semibold text-blue-600">{selected_type?.title}</span>
									</p>

									{scenarios.length === 0 ? (
										<div className="text-center py-16">
											<div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
												<div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl" />
												<FaFileAlt className="relative text-3xl text-slate-400" />
											</div>
											<p className="text-slate-600 text-lg mb-2">
												Nenhum cenario disponivel para este tipo de incidente
											</p>
											<p className="text-slate-500 text-sm">
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
								<h2 className="text-2xl font-bold text-slate-900 mb-2">
									Resumo do Cenario Selecionado
								</h2>
								<p className="text-slate-600 mb-6">
									Revise os detalhes do cenario e configure a sessao de treinamento
								</p>

								{selected_scenario && (
									<div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/60">
										<div className="mb-4 flex flex-wrap gap-2">
											<span className="inline-block px-3 py-1.5 bg-linear-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full">
												{selected_category?.title}
											</span>
											<span className="inline-block px-3 py-1.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold rounded-full">
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
												<span className={`px-3 py-1 rounded-full font-bold ${
													selected_scenario.severity === 'high' ? 'bg-red-100 text-red-700' :
													selected_scenario.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
													'bg-emerald-100 text-emerald-700'
												}`}>
													{selected_scenario.severity === 'high' ? 'Alta' :
													 selected_scenario.severity === 'medium' ? 'Media' : 'Baixa'}
												</span>
											</div>
										)}
									</div>
								)}
							</div>

							<div className="h-px bg-linear-to-r from-transparent via-slate-300 to-transparent" />

							{/* Session Configuration */}
							<div>
								<h2 className="text-2xl font-bold text-slate-900 mb-2">
									Configuracao da Sessao
								</h2>
								<p className="text-slate-600 mb-6">
									Defina as informacoes e regras de acesso para esta sessao de treinamento
								</p>

								<div className="space-y-6">
									{/* Session Name */}
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-2">
											Nome da Sessao <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											value={session_name}
											onChange={(e) => setSessionName(e.target.value)}
											placeholder="Ex: Treinamento DNS Reflection - Turma 2026"
											className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
											maxLength={100}
										/>
										<p className="text-xs text-slate-500 mt-2">
											{session_name.length}/100 caracteres
										</p>
									</div>

									{/* Session Description */}
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-2">
											Descricao da Sessao <span className="text-red-500">*</span>
										</label>
										<textarea
											value={session_description}
											onChange={(e) => setSessionDescription(e.target.value)}
											placeholder="Descreva os objetivos e contexto desta sessao de treinamento..."
											rows={4}
											className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
											maxLength={500}
										/>
										<p className="text-xs text-slate-500 mt-2">
											{session_description.length}/500 caracteres
										</p>
									</div>

									{/* Access Type */}
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-3">
											Forma de Acesso <span className="text-red-500">*</span>
										</label>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{/* Open Access */}
											<button
												type="button"
												onClick={() => setAccessType('open')}
												className={`
													p-5 rounded-2xl border-2 transition-all text-left
													${access_type === 'open'
														? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
														: 'border-slate-200 hover:border-slate-300 bg-white'
													}
												`}
											>
												<div className="flex items-start gap-3">
													<div className={`
														w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
														${access_type === 'open' ? 'border-blue-500' : 'border-slate-300'}
													`}>
														{access_type === 'open' && (
															<div className="w-3 h-3 rounded-full bg-blue-500" />
														)}
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<FaLockOpen className={access_type === 'open' ? 'text-blue-600' : 'text-slate-400'} />
															<h4 className={`font-bold ${
																access_type === 'open' ? 'text-blue-900' : 'text-slate-700'
															}`}>
																Acesso Livre
															</h4>
														</div>
														<p className={`text-sm ${
															access_type === 'open' ? 'text-blue-700' : 'text-slate-600'
														}`}>
															Qualquer pessoa pode participar da sessao sem necessidade de codigo
														</p>
													</div>
												</div>
											</button>

											{/* Code Access */}
											<button
												type="button"
												onClick={() => setAccessType('code')}
												className={`
													p-5 rounded-2xl border-2 transition-all text-left
													${access_type === 'code'
														? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
														: 'border-slate-200 hover:border-slate-300 bg-white'
													}
												`}
											>
												<div className="flex items-start gap-3">
													<div className={`
														w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
														${access_type === 'code' ? 'border-blue-500' : 'border-slate-300'}
													`}>
														{access_type === 'code' && (
															<div className="w-3 h-3 rounded-full bg-blue-500" />
														)}
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<FaLock className={access_type === 'code' ? 'text-blue-600' : 'text-slate-400'} />
															<h4 className={`font-bold ${
																access_type === 'code' ? 'text-blue-900' : 'text-slate-700'
															}`}>
																Codigo de Acesso
															</h4>
														</div>
														<p className={`text-sm ${
															access_type === 'code' ? 'text-blue-700' : 'text-slate-600'
														}`}>
															Participantes precisam de um codigo para poder acessar a sessao
														</p>
													</div>
												</div>
											</button>
										</div>
									</div>

									{/* Access Code Input - Only shown when code is selected */}
									{access_type === 'code' && (
										<div className="animate-slide-in-up">
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												Codigo de Acesso <span className="text-red-500">*</span>
											</label>
											<div className="flex flex-col sm:flex-row gap-3">
												<div className="flex-1 relative">
													<input
														type="text"
														value={access_code}
														onChange={handleAccessCodeChange}
														placeholder="Digite ou gere um codigo"
														className={`w-full px-4 py-3.5 pr-12 rounded-xl border bg-slate-50 focus:bg-white outline-none transition-all font-mono font-bold text-lg ${
															code_is_valid === true
																? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
																: code_is_valid === false
																? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
																: 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
														}`}
														maxLength={20}
													/>
													{/* Validation indicator */}
													<div className="absolute right-4 top-1/2 -translate-y-1/2">
														{validating_code && (
															<FaSpinner className="text-blue-500 animate-spin text-lg" />
														)}
														{!validating_code && code_is_valid === true && (
															<FaCheckCircle className="text-emerald-500 text-lg" />
														)}
														{!validating_code && code_is_valid === false && (
															<FaTimesCircle className="text-red-500 text-lg" />
														)}
													</div>
												</div>
												<button
													type="button"
													onClick={generateAccessCode}
													disabled={generating_code}
													className="px-6 py-3.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
												>
													{generating_code ? (
														<FaSpinner className="animate-spin" />
													) : (
														<FaRandom />
													)}
													Gerar Codigo
												</button>
											</div>
											{/* Validation message */}
											{code_is_valid === true && (
												<p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
													<FaCheckCircle />
													Codigo valido e disponivel
												</p>
											)}
											{code_is_valid === false && (
												<p className="text-xs text-red-600 mt-2 flex items-center gap-1">
													<FaTimesCircle />
													Codigo invalido. Use outro ou gere automaticamente.
												</p>
											)}
											{code_is_valid === null && (
												<p className="text-xs text-slate-500 mt-2">
													O codigo pode conter letras e numeros (max. 20 caracteres)
												</p>
											)}
										</div>
									)}

									{/* Max Participants */}
									<div>
										<label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
											<FaUsers className="text-slate-500" />
											Limite de Participantes <span className="text-red-500">*</span>
										</label>
										<input
											type="number"
											value={max_participants}
											onChange={(e) => setMaxParticipants(e.target.value)}
											placeholder="Numero maximo de participantes"
											min="1"
											className="w-full md:w-64 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
										/>
										<p className="text-xs text-slate-500 mt-2">
											Defina o numero maximo de participantes permitidos nesta sessao. Esse numero deve ser a soma de todos os facilitadores, participantes e observadores.
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
							group flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold transition-all
							${current_step === 1
								? 'bg-slate-100 text-slate-400 cursor-not-allowed'
								: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-lg'
							}
						`}
					>
						<FaChevronLeft className={`text-sm transition-transform ${current_step !== 1 ? 'group-hover:-translate-x-1' : ''}`} />
						<span>Voltar</span>
					</button>

					{current_step < 3 ? (
						<button
							onClick={handleNext}
							className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
						>
							<span>Proximo</span>
							<FaChevronRight className="text-sm transition-transform group-hover:translate-x-1" />
						</button>
					) : (
						<button
							onClick={handleCreateTraining}
							className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
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
