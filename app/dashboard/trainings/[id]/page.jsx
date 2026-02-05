'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/Layout';
import Link from 'next/link';
import { FaArrowLeft, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

export default function TrainingRedirectPage() {
	const router = useRouter();
	const params = useParams();
	const [error, setError] = useState(null);

	useEffect(() => {
		async function redirectToRole() {
			try {
				const trainingId = params.id;
				
				// Fetch training to get user's role
				const response = await fetch(`/api/trainings/${trainingId}`, {
					method: 'GET',
					credentials: 'include'
				});

				if (!response.ok) {
					const data = await response.json();
					
					if (response.status === 403) {
						setError('Você não tem acesso a este treinamento');
					} else if (response.status === 404) {
						setError('Treinamento não encontrado');
					} else {
						setError(data.message || 'Erro ao carregar treinamento');
					}
					return;
				}

				const data = await response.json();
				
				// Redirect to appropriate role page
				if (data.success && data.userRole) {
					router.replace(`/dashboard/trainings/${trainingId}/${data.userRole}`);
				} else {
					setError('Erro ao determinar suas permissões');
				}

			} catch (err) {
				console.error('Error redirecting to role page:', err);
				setError('Erro ao carregar treinamento');
			}
		}

		redirectToRole();
	}, [params.id, router]);

	// Show error state
	if (error) {
		return (
			<DashboardLayout>
				<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
					{/* Error Icon */}
					<div className="relative mb-8">
						<div className="absolute inset-0 bg-linear-to-br from-red-400 to-rose-500 rounded-3xl blur-xl opacity-30" />
						<div className="relative w-24 h-24 bg-linear-to-br from-red-400 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/25">
							<FaExclamationTriangle className="text-4xl text-white" />
						</div>
					</div>

					{/* Title */}
					<h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
						Acesso Negado
					</h1>

					{/* Error Message */}
					<p className="text-slate-600 text-lg text-center max-w-md mb-8">
						{error}
					</p>

					{/* Back Button */}
					<Link
						href="/dashboard/trainings"
						className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all"
					>
						<FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
						Voltar para Treinamentos
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	// Show loading state
	return (
		<DashboardLayout>
			<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
				{/* Loading Icon */}
				<div className="relative mb-8">
					<div className="absolute inset-0 bg-linear-to-br from-blue-400 to-indigo-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
					<div className="relative w-24 h-24 bg-linear-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/25">
						<FaSpinner className="text-4xl text-white animate-spin" />
					</div>
				</div>

				{/* Title */}
				<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-center">
					Carregando treinamento...
				</h1>

				{/* Description */}
				<p className="text-slate-600 text-center max-w-md">
					Aguarde enquanto verificamos suas permissões
				</p>
			</div>
		</DashboardLayout>
	);
}
