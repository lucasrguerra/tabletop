"use client";

import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * ErrorAlert Component
 * Beautiful error alert with gradient background
 */
export default function ErrorAlert({ message }) {
	if (!message) return null;

	return (
		<div className="relative overflow-hidden rounded-2xl border border-red-200/60 bg-linear-to-br from-red-50 to-rose-50 shadow-lg shadow-red-500/10 animate-shake">
			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-linear-to-r from-red-500/5 to-rose-500/5" />
			
			<div className="relative p-4 flex items-start gap-3">
				{/* Icon with pulsing effect */}
				<div className="shrink-0 w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/25 animate-pulse">
					<FaExclamationTriangle className="text-white text-lg" />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<p className="text-sm font-bold text-red-800 mb-1">Erro</p>
					<p className="text-sm text-red-700 leading-relaxed">{message}</p>
				</div>
			</div>

			{/* Bottom accent bar */}
			<div className="h-1 bg-linear-to-r from-red-500 to-rose-600" />
		</div>
	);
}
