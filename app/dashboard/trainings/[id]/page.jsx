'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/Dashboard/Layout';
import { FaArrowLeft, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

/**
 * Sends the user to the view that matches their role in this training.
 * Rendered only for the moment it takes to resolve that role.
 */
export default function TrainingRedirectPage() {
	const router = useRouter();
	const params = useParams();
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;

		async function redirectToRole() {
			try {
				const response = await fetch(`/api/trainings/${params.id}`, {
					method: 'GET',
					credentials: 'include',
				});

				if (cancelled) { return; }

				if (!response.ok) {
					const data = await response.json().catch(() => ({}));
					if (response.status === 403) {
						setError('Você não participa deste treinamento.');
					} else if (response.status === 404) {
						setError('Este treinamento não existe ou foi removido.');
					} else {
						setError(data.message || 'Não foi possível abrir este treinamento.');
					}
					return;
				}

				const data = await response.json();

				if (data.success && data.userRole) {
					router.replace(`/dashboard/trainings/${params.id}/${data.userRole}`);
				} else {
					setError('Não foi possível determinar seu papel neste treinamento.');
				}
			} catch (err) {
				if (cancelled) { return; }
				console.error('Error redirecting to role page:', err);
				setError('Não foi possível abrir este treinamento.');
			}
		}

		redirectToRole();
		return () => { cancelled = true; };
	}, [params.id, router]);

	if (error) {
		return (
			<DashboardLayout>
				<div className="max-w-lg mx-auto text-center py-20 px-4">
					<div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
						<FaExclamationTriangle className="text-xl text-red-500" />
					</div>
					<h1 className="text-xl font-bold text-slate-900 mb-2">
						Não foi possível abrir este treinamento
					</h1>
					<p className="text-slate-600 mb-6">{error}</p>
					<Link
						href="/dashboard/trainings"
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
					>
						<FaArrowLeft className="text-xs" />
						Voltar para treinamentos
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div
				className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
				role="status"
				aria-live="polite"
			>
				<FaSpinner className="text-3xl text-slate-300 animate-spin" />
				<p className="text-sm text-slate-500">Abrindo treinamento…</p>
			</div>
		</DashboardLayout>
	);
}
