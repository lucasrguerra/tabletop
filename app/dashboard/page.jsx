"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Dashboard/Layout';
import PendingInvites from '@/components/Dashboard/PendingInvites';
import { 
	FaChartLine, 
	FaUsers, 
	FaClock, 
	FaCheckCircle 
} from 'react-icons/fa';

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [pendingInvites, setPendingInvites] = useState([]);
	const [loadingInvites, setLoadingInvites] = useState(true);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	// Fetch pending invites
	const fetchPendingInvites = async () => {
		try {
			setLoadingInvites(true);
			const response = await fetch('/api/trainings/invites');
			const data = await response.json();

			if (data.success) {
				setPendingInvites(data.invites || []);
			}
		} catch (error) {
			console.error('Error fetching pending invites:', error);
		} finally {
			setLoadingInvites(false);
		}
	};

	useEffect(() => {
		if (session) {
			fetchPendingInvites();
		}
	}, [session]);

	// Callback when invite is accepted/declined
	const handleInviteUpdated = () => {
		fetchPendingInvites();
	};

	// Show loading state while checking authentication
	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Carregando...</p>
				</div>
			</div>
		);
	}

	// Don't render content if not authenticated
	if (!session) {
		return null;
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Pending Invites Section */}
				{!loadingInvites && pendingInvites.length > 0 && (
					<PendingInvites 
						invites={pendingInvites} 
						onInviteUpdated={handleInviteUpdated}
					/>
				)}

				{/* Welcome Section */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Bem-vindo, {session.user.name}!
					</h1>
					<p className="text-gray-600">
						Este é o seu painel de controle para gerenciar treinamentos e resposta a incidentes.
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Stat Card 1 */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">
									Treinamentos
								</p>
								<p className="text-3xl font-bold text-gray-900">0</p>
							</div>
							<div className="p-3 bg-blue-50 rounded-lg">
								<FaChartLine className="text-2xl text-blue-600" />
							</div>
						</div>
					</div>

					{/* Stat Card 2 */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">
									Participantes
								</p>
								<p className="text-3xl font-bold text-gray-900">0</p>
							</div>
							<div className="p-3 bg-green-50 rounded-lg">
								<FaUsers className="text-2xl text-green-600" />
							</div>
						</div>
					</div>

					{/* Stat Card 3 */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">
									Em Andamento
								</p>
								<p className="text-3xl font-bold text-gray-900">0</p>
							</div>
							<div className="p-3 bg-yellow-50 rounded-lg">
								<FaClock className="text-2xl text-yellow-600" />
							</div>
						</div>
					</div>

					{/* Stat Card 4 */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">
									Concluídos
								</p>
								<p className="text-3xl font-bold text-gray-900">0</p>
							</div>
							<div className="p-3 bg-purple-50 rounded-lg">
								<FaCheckCircle className="text-2xl text-purple-600" />
							</div>
						</div>
					</div>
				</div>

				{/* User Info Section */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Informações da Conta
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600 mb-1">Nome</p>
							<p className="font-medium text-gray-900">{session.user.name}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 mb-1">Email</p>
							<p className="font-medium text-gray-900">{session.user.email}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 mb-1">Nickname</p>
							<p className="font-medium text-gray-900">{session.user.nickname}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 mb-1">ID do Usuário</p>
							<p className="font-medium text-gray-900 font-mono text-xs">
								{session.user.id}
							</p>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Ações Rápidas
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
							<div className="font-medium text-gray-900 mb-1">
								Novo Treinamento
							</div>
							<p className="text-sm text-gray-600">
								Criar um novo cenário de treinamento
							</p>
						</button>
						<button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
							<div className="font-medium text-gray-900 mb-1">
								Gerenciar Equipe
							</div>
							<p className="text-sm text-gray-600">
								Adicionar ou remover participantes
							</p>
						</button>
						<button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
							<div className="font-medium text-gray-900 mb-1">
								Relatórios
							</div>
							<p className="text-sm text-gray-600">
								Visualizar relatórios de desempenho
							</p>
						</button>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
