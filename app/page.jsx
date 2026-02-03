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
	FaBookOpen
} from 'react-icons/fa';

export default function HomePage() {
	const { data: session } = useSession();

	const features = [
		{
			icon: FaShieldAlt,
			title: "O que é um Exercício Tabletop?",
			description: "Exercícios tabletop são simulações baseadas em discussão onde equipes trabalham juntas para resolver cenários de incidentes de segurança. Sem sistemas reais em risco, a equipe analisa métricas, toma decisões e aprende com feedback imediato.",
		},
		{
			icon: FaNetworkWired,
			title: "Cenários Realistas",
			description: "Baseados em incidentes reais, os exercícios apresentam ataques DDoS, análises de logs, identificação de botnets e outras ameaças comuns. Cada rodada simula a evolução temporal de um ataque real.",
		},
		{
			icon: FaClipboardCheck,
			title: "Aprendizado Prático",
			description: "Participantes analisam métricas reais de servidores, logs de rede e dados de tráfego. Respondem questões sobre identificação, análise e mitigação de ataques, recebendo feedback detalhado sobre suas respostas.",
		},
	];

	const facilitator_steps = [
		"Selecione um exercício disponível",
		"Inicie o treinamento quando a equipe estiver pronta",
		"Controle o fluxo das rodadas",
		"Apresente métricas e dados em tempo real",
		"Avalie o desempenho da equipe"
	];

	const participant_steps = [
		"Receba o link de acesso do facilitador",
		"Cadastre-se na sessão com seu nome e função",
		"Aguarde o facilitador iniciar o exercício",
		"Leia os cenários e responda as questões",
		"Receba feedback e pontuação ao final"
	];

	const benefits = [
		{
			icon: FaUsers,
			title: "Trabalho em Equipe",
			description: "Desenvolva coordenação e comunicação",
		},
		{
			icon: FaClock,
			title: "Ambiente Seguro",
			description: "Pratique sem riscos para sistemas reais",
		},
		{
			icon: FaTrophy,
			title: "Avaliação Objetiva",
			description: "Identifique lacunas de conhecimento",
		},
		{
			icon: FaShieldAlt,
			title: "Preparação Real",
			description: "Baseado em incidentes cibernéticos reais",
		},
	];

	return (
		<div className="min-h-screen bg-linear-to-b from-gray-100 to-white">
			<Header />

			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
				<div className="text-center">
					<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
						Treinamentos de{" "}
						<span className="bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
							Resposta a Incidentes
						</span>
					</h1>
					<p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
						Treine sua equipe em cenários realistas com exercícios tabletop,
						sem comprometer a segurança de sistemas reais
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						{session ? (
							<Link
								href="/dashboard"
								className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
							>
								<FaBookOpen />
								Acessar Dashboard
							</Link>
						) : (
							<>
								<Link
									href="/login"
									className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
								>
									<FaUser />
									Fazer Login
								</Link>
								<Link
									href="/register"
									className="flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
								>
									<FaUserPlus />
									Criar Conta
								</Link>
							</>
						)}
					</div>
				</div>
			</section>

			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Entenda o Conceito
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Conheça os fundamentos dos exercícios tabletop e como eles fortalecem sua equipe
							para responder a incidentes de segurança cibernética.
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<div
									key={index}
									className="group bg-white border border-gray-200 p-8 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300"
								>
									<div className="inline-flex p-3 bg-blue-50 rounded-xl mb-5 group-hover:bg-blue-100 transition-colors">
										<Icon className="text-3xl text-blue-600" />
									</div>
									<h3 className="text-xl font-bold text-gray-900 mb-3">
										{feature.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Como Funciona
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Processo simples e eficiente para facilitadores e participantes
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						<div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
							<div className="flex items-center gap-3 mb-8">
								<div className="p-2 bg-blue-100 rounded-xl">
									<FaChalkboardTeacher className="text-2xl text-blue-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900">
									Para Facilitadores
								</h3>
							</div>

							<ol className="space-y-4">
								{facilitator_steps.map((step, index) => (
									<li key={index} className="flex gap-4 items-start">
										<span className="shrink-0 w-7 h-7 bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
											{index + 1}
										</span>
										<span className="text-gray-700 leading-relaxed pt-0.5">{step}</span>
									</li>
								))}
							</ol>
						</div>

						<div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
							<div className="flex items-center gap-3 mb-8">
								<div className="p-2 bg-green-100 rounded-xl">
									<FaUserGraduate className="text-2xl text-green-600" />
								</div>
								<h3 className="text-xl font-bold text-gray-900">
									Para Participantes
								</h3>
							</div>
							<ol className="space-y-4">
								{participant_steps.map((step, index) => (
									<li key={index} className="flex gap-4 items-start">
										<span className="shrink-0 w-7 h-7 bg-linear-to-br from-green-600 to-green-700 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
											{index + 1}
										</span>
										<span className="text-gray-700 leading-relaxed pt-0.5">{step}</span>
									</li>
								))}
							</ol>
						</div>
					</div>
				</div>
			</section>
		
			<section className="bg-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Benefícios do Treinamento
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Desenvolver competências essenciais para resposta a incidentes de segurança
						</p>
					</div>
					
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{benefits.map((benefit, index) => {
							const Icon = benefit.icon;
							return (
								<div
									key={index}
									className="group text-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300"
								>
									<div className="inline-flex p-3 bg-blue-50 rounded-xl mb-4 group-hover:bg-blue-100 transition-colors">
										<Icon className="text-3xl text-blue-600" />
									</div>
									<h3 className="text-lg font-bold text-gray-900 mb-2">
										{benefit.title}
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										{benefit.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section className="py-20 bg-linear-to-br from-blue-600 via-blue-700 to-blue-800">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Pronto para Começar?
					</h2>

					<p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
						{session ? 'Acesse seu dashboard e comece a treinar sua equipe' : 'Crie sua conta gratuitamente e comece a treinar sua equipe hoje mesmo'}
					</p>


					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						{session ? (
							<Link
								href="/dashboard"
								className="flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
							>
								<FaBookOpen />
								Acessar Dashboard
							</Link>
						) : (
							<>
								<Link
									href="/register"
									className="flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
								>
									<FaUserPlus />
									Criar Conta Gratuita
								</Link>

								<Link
									href="/login"
									className="flex items-center justify-center gap-2 bg-transparent text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-white/10 transition-all border-2 border-white w-full sm:w-auto"
								>
									<FaUser />
									Já tenho conta
								</Link>
							</>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
