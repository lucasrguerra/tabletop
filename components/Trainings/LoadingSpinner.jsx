"use client";

import { FaSpinner } from 'react-icons/fa';

/**
 * LoadingSpinner Component
 * Colorful loading spinner with gradient
 */
export default function LoadingSpinner({ message = "Carregando..." }) {
	return (
		<div className="flex flex-col items-center justify-center py-16">
			{/* Spinner with gradient background */}
			<div className="relative">
				{/* Outer glow */}
				<div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-400 to-indigo-500 blur-xl opacity-40 animate-pulse" />
				
				{/* Spinner */}
				<div className="relative w-16 h-16 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-spin">
					<FaSpinner className="text-3xl text-white" />
				</div>
			</div>

			{/* Message */}
			<p className="mt-6 text-slate-600 font-medium animate-pulse">{message}</p>
		</div>
	);
}
