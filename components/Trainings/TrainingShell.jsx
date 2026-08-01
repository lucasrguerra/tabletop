'use client';

import Link from 'next/link';
import { FaArrowLeft, FaExclamationTriangle, FaSpinner, FaArrowDown, FaTimes } from 'react-icons/fa';
import DashboardLayout from '@/components/Dashboard/Layout';
import TrainingConsole from '@/components/Trainings/TrainingConsole';

/**
 * Section heading used across the three role pages. Sections are named by what
 * the reader does there, not by the component that fills them.
 */
export function Section({ title, hint, action, children, className = '' }) {
	return (
		<section className={`space-y-3 ${className}`}>
			{(title || action) && (
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<div className="min-w-0">
						{title && (
							<h2 className="text-xs uppercase tracking-[0.14em] font-semibold text-slate-500 dark:text-slate-400">
								{title}
							</h2>
						)}
						{hint && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>}
					</div>
					{action}
				</div>
			)}
			{children}
		</section>
	);
}

/**
 * Non-blocking notice that the facilitator opened a new round. Replaces the old
 * behaviour of silently moving the reader, which could interrupt an answer in
 * progress.
 */
export function NewRoundNotice({ round, onGo, onDismiss }) {
	if (round === null || round === undefined) { return null; }

	return (
		<div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
			<FaArrowDown className="text-blue-500 dark:text-blue-400 shrink-0" />
			<p className="text-sm flex-1 min-w-0">
				O facilitador abriu a <strong className="font-semibold">rodada {round + 1}</strong>.
			</p>
			<button
				onClick={onGo}
				className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 focus-visible:ring-offset-2"
			>
				Ir para a rodada {round + 1}
			</button>
			<button
				onClick={onDismiss}
				aria-label="Dispensar aviso"
				className="p-1.5 rounded-lg text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800"
			>
				<FaTimes className="text-xs" />
			</button>
		</div>
	);
}

/**
 * TrainingShell
 *
 * Page chrome shared by the facilitator, participant and observer views:
 * loading and error states, the console, and the content column. Each page
 * passes what belongs in the console and what belongs below it.
 */
export default function TrainingShell({
	loading,
	error,
	onRetry,
	training,
	userRole,
	rounds,
	isConnected,
	consoleExtra,
	children,
}) {
	if (loading) {
		return (
			<DashboardLayout>
				<div
					className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
					role="status"
					aria-live="polite"
				>
					<FaSpinner className="text-3xl text-slate-300 animate-spin" />
					<p className="text-sm text-slate-500 dark:text-slate-400">Carregando treinamento…</p>
				</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout>
				<div className="max-w-lg mx-auto text-center py-20 px-4">
					<div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 flex items-center justify-center mx-auto mb-5">
						<FaExclamationTriangle className="text-xl text-red-500 dark:text-red-400" />
					</div>
					<h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
						Não foi possível abrir este treinamento
					</h1>
					<p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						{onRetry && (
							<button
								onClick={onRetry}
								className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 focus-visible:ring-offset-2"
							>
								Tentar de novo
							</button>
						)}
						<Link
							href="/dashboard/trainings"
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
						>
							<FaArrowLeft className="text-xs" />
							Voltar para treinamentos
						</Link>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<TrainingConsole
					training={training}
					userRole={userRole}
					rounds={rounds}
					isConnected={isConnected}
				>
					{consoleExtra}
				</TrainingConsole>

				{children}
			</div>
		</DashboardLayout>
	);
}
