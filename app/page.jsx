"use client";

import Link from 'next/link';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import { 
	FaChalkboardTeacher, 
	FaUserGraduate, 
	FaShieldAlt,
	FaNetworkWired,
	FaClipboardCheck,
	FaUsers,
	FaClock,
	FaTrophy,
	FaUser,
	FaUserPlus,
	FaBookOpen,
	FaArrowRight,
	FaCheckCircle
} from 'react-icons/fa';

export default function HomePage() {
	const { data: session } = useSession();

	const features = [
		{
			icon: FaShieldAlt,
			title: "O que e um Exercicio Tabletop?",
			description: "Exercicios tabletop sao simulacoes baseadas em discussao onde equipes trabalham juntas para resolver cenarios de incidentes de seguranca. Sem sistemas reais em risco, a equipe analisa metricas, toma decisoes e aprende com feedback imediato.",
			gradient: "from-blue-500 to-indigo-600"
		},
		{
			icon: FaNetworkWired,
			title: "Cenarios Realistas",
			description: "Baseados em incidentes reais, os exercicios apresentam ataques DDoS, analises de logs, identificacao de botnets e outras ameacas comuns. Cada rodada simula a evolucao temporal de um ataque real.",
			gradient: "from-emerald-500 to-teal-600"
		},
		{
			icon: FaClipboardCheck,
			title: "Aprendizado Pratico",
			description: "Participantes analisam metricas reais de servidores, logs de rede e dados de trafego. Respondem questoes sobre identificacao, analise e mitigacao de ataques, recebendo feedback detalhado sobre suas respostas.",
			gradient: "from-violet-500 to-purple-600"
		},
	];

	const facilitator_steps = [
		"Selecione um exercicio disponivel",
		"Inicie o treinamento quando a equipe estiver pronta",
		"Controle o fluxo das rodadas",
		"Apresente metricas e dados em tempo real",
		"Avalie o desempenho da equipe"
	];

	const participant_steps = [
		"Receba o link de acesso do facilitador",
		"Cadastre-se na sessao com seu nome e funcao",
		"Aguarde o facilitador iniciar o exercicio",
		"Leia os cenarios e responda as questoes",
		"Receba feedback e pontuacao ao final"
	];

	const benefits = [
		{
			icon: FaUsers,
			title: "Trabalho em Equipe",
			description: "Desenvolva coordenacao e comunicacao",
			color: "blue"
		},
		{
			icon: FaClock,
			title: "Ambiente Seguro",
			description: "Pratique sem riscos para sistemas reais",
			color: "emerald"
		},
		{
			icon: FaTrophy,
			title: "Avaliacao Objetiva",
			description: "Identifique lacunas de conhecimento",
			color: "amber"
		},
		{
			icon: FaShieldAlt,
			title: "Preparacao Real",
			description: "Baseado em incidentes ciberneticos reais",
			color: "violet"
		},
	];

	return (
		<div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
			<Header />

			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl" />
					<div className="absolute top-60 -left-40 w-80 h-80 bg-linear-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl" />
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
					<div className="text-center max-w-4xl mx-auto">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8 animate-fade-in">
							<FaShieldAlt className="text-blue-600 text-sm" />
							<span className="text-sm font-medium text-blue-700">Plataforma de Treinamentos em Ciberseguranca</span>
						</div>

						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight animate-slide-in-up">
							Treinamentos de{" "}
							<span className="relative">
								<span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
									Resposta a Incidentes
								</span>
								<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2 10C50 4 150 2 298 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
									<defs>
										<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
											<stop offset="0%" stopColor="#3b82f6" />
											<stop offset="50%" stopColor="#6366f1" />
											<stop offset="100%" stopColor="#8b5cf6" />
										</linearGradient>
									</defs>
								</svg>
							</span>
						</h1>

						<p className="text-lg md:text-xl lg:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
							Treine sua equipe em cenarios realistas com exercicios tabletop, 
							sem comprometer a seguranca de sistemas reais
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
							{session ? (
								<Link
									href="/dashboard"
									className="group flex items-center justify-center gap-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] w-full sm:w-auto"
								>
									<FaBookOpen />
									<span>Acessar Dashboard</span>
									<FaArrowRight className="group-hover:translate-x-1 transition-transform" />
								</Link>
							) : (
								<>
									<Link
										href="/login"
										className="group flex items-center justify-center gap-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] w-full sm:w-auto"
									>
										<FaUser />
										<span>Fazer Login</span>
										<FaArrowRight className="group-hover:translate-x-1 transition-transform" />
									</Link>
									<Link
										href="/register"
										className="flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 px-8 py-4 rounded-xl text-base font-semibold hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
									>
										<FaUserPlus />
										<span>Criar Conta</span>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 lg:py-28 bg-white relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
							Como Funciona
						</span>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
							Entenda o Conceito
						</h2>
						<p className="text-slate-600 max-w-2xl mx-auto text-lg">
							Conheca os fundamentos dos exercicios tabletop e como eles fortalecem sua equipe 
							para responder a incidentes de seguranca cibernetica.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<div
									key={index}
									className="group relative bg-white border border-slate-200 p-8 rounded-2xl hover:border-slate-300 hover:shadow-2xl transition-all duration-500 card-lift"
								>
									{/* Gradient background on hover */}
									<div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
									
									<div className={`relative inline-flex p-4 bg-linear-to-br ${feature.gradient} rounded-xl mb-6 shadow-lg`}>
										<Icon className="text-2xl text-white" />
									</div>
									<h3 className="relative text-xl font-bold text-slate-900 mb-3">
										{feature.title}
									</h3>
									<p className="relative text-slate-600 leading-relaxed">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* How it Works Section */}
			<section className="py-20 lg:py-28 bg-linear-to-b from-slate-50 to-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
							Passo a Passo
						</span>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
							Como Funciona
						</h2>
						<p className="text-slate-600 max-w-2xl mx-auto text-lg">
							Processo simples e eficiente para facilitadores e participantes
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 lg:gap-12">
						{/* Facilitators */}
						<div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-slate-100 card-hover">
							<div className="flex items-center gap-4 mb-8">
								<div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
									<FaChalkboardTeacher className="text-2xl text-white" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-slate-900">
										Para Facilitadores
									</h3>
									<p className="text-sm text-slate-500">Conduza treinamentos eficazes</p>
								</div>
							</div>

							<ol className="space-y-4">
								{facilitator_steps.map((step, index) => (
									<li key={index} className="flex gap-4 items-start group">
										<span className="shrink-0 w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
											{index + 1}
										</span>
										<span className="text-slate-700 leading-relaxed pt-1 group-hover:text-slate-900 transition-colors">
											{step}
										</span>
									</li>
								))}
							</ol>
						</div>

						{/* Participants */}
						<div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-slate-100 card-hover">
							<div className="flex items-center gap-4 mb-8">
								<div className="p-3 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
									<FaUserGraduate className="text-2xl text-white" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-slate-900">
										Para Participantes
									</h3>
									<p className="text-sm text-slate-500">Aprenda na pratica</p>
								</div>
							</div>

							<ol className="space-y-4">
								{participant_steps.map((step, index) => (
									<li key={index} className="flex gap-4 items-start group">
										<span className="shrink-0 w-8 h-8 bg-linear-to-br from-emerald-600 to-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
											{index + 1}
										</span>
										<span className="text-slate-700 leading-relaxed pt-1 group-hover:text-slate-900 transition-colors">
											{step}
										</span>
									</li>
								))}
							</ol>
						</div>
					</div>
				</div>
			</section>
		
			{/* Benefits Section */}
			<section className="bg-white py-20 lg:py-28">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-4">
							Vantagens
						</span>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
							Beneficios do Treinamento
						</h2>
						<p className="text-slate-600 max-w-2xl mx-auto text-lg">
							Desenvolva competencias essenciais para resposta a incidentes de seguranca
						</p>
					</div>
					
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{benefits.map((benefit, index) => {
							const Icon = benefit.icon;
							const colorClasses = {
								blue: 'from-blue-500 to-indigo-600 shadow-blue-500/25',
								emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
								amber: 'from-amber-500 to-orange-600 shadow-amber-500/25',
								violet: 'from-violet-500 to-purple-600 shadow-violet-500/25'
							};
							
							return (
								<div
									key={index}
									className="group text-center p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-xl transition-all duration-300 card-hover"
								>
									<div className={`inline-flex p-4 bg-linear-to-br ${colorClasses[benefit.color]} rounded-xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
										<Icon className="text-2xl text-white" />
									</div>
									<h3 className="text-lg font-bold text-slate-900 mb-2">
										{benefit.title}
									</h3>
									<p className="text-slate-600 text-sm leading-relaxed">
										{benefit.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-20 lg:py-28 overflow-hidden">
				{/* Background */}
				<div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700" />
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-8">
						<FaShieldAlt className="text-3xl text-white" />
					</div>
					
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
						Pronto para Comecar?
					</h2>

					<p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
						{session 
							? 'Acesse seu dashboard e comece a treinar sua equipe' 
							: 'Crie sua conta gratuitamente e comece a treinar sua equipe hoje mesmo'
						}
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						{session ? (
							<Link
								href="/dashboard"
								className="group flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] w-full sm:w-auto"
							>
								<FaBookOpen />
								<span>Acessar Dashboard</span>
								<FaArrowRight className="group-hover:translate-x-1 transition-transform" />
							</Link>
						) : (
							<>
								<Link
									href="/register"
									className="group flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] w-full sm:w-auto"
								>
									<FaUserPlus />
									<span>Criar Conta Gratuita</span>
									<FaArrowRight className="group-hover:translate-x-1 transition-transform" />
								</Link>

								<Link
									href="/login"
									className="flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/10 transition-all duration-300 border-2 border-white/30 hover:border-white/50 w-full sm:w-auto backdrop-blur"
								>
									<FaUser />
									<span>Ja tenho conta</span>
								</Link>
							</>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
