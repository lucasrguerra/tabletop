"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/Dashboard/Layout';
import { 
	FaChartLine, 
	FaUsers, 
	FaClock, 
	FaCheckCircle,
	FaPlus,
	FaUsersCog,
	FaChartBar,
	FaArrowRight,
	FaEnvelope,
	FaAt,
	FaIdBadge,
	FaFingerprint
} from 'react-icons/fa';

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	// Redirect to login if not authenticated
	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	// Show loading state while checking authentication
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

	// Don't render content if not authenticated
	if (!session) {
		return null;
	}

	const stats = [
		{
			label: 'Treinamentos',
			value: 0,
			icon: FaChartLine,
			bgGradient: 'from-blue-500 to-indigo-600',
			bgLight: 'from-blue-50 to-indigo-50',
			textColor: 'text-blue-600'
		},
		{
			label: 'Participantes',
			value: 0,
			icon: FaUsers,
			bgGradient: 'from-emerald-500 to-teal-600',
			bgLight: 'from-emerald-50 to-teal-50',
			textColor: 'text-emerald-600'
		},
		{
			label: 'Em Andamento',
			value: 0,
			icon: FaClock,
			bgGradient: 'from-amber-500 to-orange-600',
			bgLight: 'from-amber-50 to-orange-50',
			textColor: 'text-amber-600'
		},
		{
			label: 'Concluidos',
			value: 0,
			icon: FaCheckCircle,
			bgGradient: 'from-violet-500 to-purple-600',
			bgLight: 'from-violet-50 to-purple-50',
			textColor: 'text-violet-600'
		}
	];

	const quickActions = [
		{
			title: 'Novo Treinamento',
			description: 'Criar um novo cenario de treinamento',
			icon: FaPlus,
			href: '/dashboard/trainings/new',
			gradient: 'from-blue-500 to-indigo-600',
			hoverBg: 'hover:bg-blue-50'
		},
		{
			title: 'Gerenciar Equipe',
			description: 'Adicionar ou remover participantes',
			icon: FaUsersCog,
			href: '/dashboard/trainings',
			gradient: 'from-emerald-500 to-teal-600',
			hoverBg: 'hover:bg-emerald-50'
		},
		{
			title: 'Relatorios',
			description: 'Visualizar relatorios de desempenho',
			icon: FaChartBar,
			href: '/dashboard/trainings',
			gradient: 'from-violet-500 to-purple-600',
			hoverBg: 'hover:bg-violet-50'
		}
	];

	const userInfoFields = [
		{ label: 'Nome', value: session.user.name, icon: FaIdBadge },
		{ label: 'Email', value: session.user.email, icon: FaEnvelope },
		{ label: 'Nickname', value: session.user.nickname, icon: FaAt },
		{ label: 'ID do Usuario', value: session.user.id, icon: FaFingerprint, mono: true }
	];

	return (
		<DashboardLayout>
			<div className="space-y-6 lg:space-y-8">
				{/* Welcome Section */}
				<div className="relative overflow-hidden bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
					<div className="relative">
						<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
							Bem-vindo, <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{session.user.name}</span>!
						</h1>
						<p className="text-slate-600 text-lg">
							Este e o seu painel de controle para gerenciar treinamentos e resposta a incidentes.
						</p>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
					{stats.map((stat, index) => (
						<div 
							key={index}
							className="group bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-5 lg:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-500 mb-1">
										{stat.label}
									</p>
									<p className="text-3xl lg:text-4xl font-bold text-slate-900">{stat.value}</p>
								</div>
								<div className={`relative p-3.5 bg-linear-to-br ${stat.bgLight} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
									<stat.icon className={`text-xl lg:text-2xl ${stat.textColor}`} />
								</div>
							</div>
						</div>
					))}
				</div>

				{/* User Info Section */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-6">
						Informacoes da Conta
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
						{userInfoFields.map((field, index) => (
							<div 
								key={index}
								className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100"
							>
								<div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-200/60">
									<field.icon className="text-slate-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-slate-500 mb-1">{field.label}</p>
									<p className={`font-medium text-slate-900 truncate ${field.mono ? 'font-mono text-xs' : ''}`}>
										{field.value}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
					<h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-6">
						Acoes Rapidas
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{quickActions.map((action, index) => (
							<Link
								key={index}
								href={action.href}
								className={`group relative p-5 bg-white border-2 border-slate-200 rounded-xl ${action.hoverBg} hover:border-slate-300 transition-all duration-300 text-left overflow-hidden`}
							>
								<div className={`inline-flex p-3 bg-linear-to-br ${action.gradient} rounded-xl mb-4 shadow-lg`}>
									<action.icon className="text-lg text-white" />
								</div>
								<div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
									{action.title}
									<FaArrowRight className="text-sm text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all" />
								</div>
								<p className="text-sm text-slate-500">
									{action.description}
								</p>
							</Link>
						))}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
