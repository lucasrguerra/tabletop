'use client';

import DashboardLayout from '@/components/Dashboard/Layout';
import Link from 'next/link';
import { FaTools, FaArrowLeft, FaHardHat } from 'react-icons/fa';

export default function TrainingPage() {
	return (
		<DashboardLayout>
			<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
				{/* Icon */}
				<div className="relative mb-8">
					<div className="absolute inset-0 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
					<div className="relative w-24 h-24 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/25">
						<FaTools className="text-4xl text-white" />
					</div>
					<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
						<FaHardHat className="text-white text-lg" />
					</div>
				</div>

				{/* Title */}
				<h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
					Em Desenvolvimento
				</h1>

				{/* Description */}
				<p className="text-slate-600 text-lg text-center max-w-md mb-8">
					Esta pagina ainda esta sendo construida. Em breve voce podera acessar todos os detalhes do treinamento aqui.
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
