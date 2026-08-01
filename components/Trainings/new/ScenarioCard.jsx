"use client";

import { FaFileAlt, FaClock, FaUser, FaCalendar } from 'react-icons/fa';

/**
 * Get difficulty color scheme
 */
const getDifficultyStyle = (difficulty) => {
	const styles = {
		'Basico': {
			bg: 'from-emerald-500 to-teal-600',
			text: 'text-emerald-700 dark:text-emerald-300',
			badge: 'from-emerald-50 dark:from-emerald-950/40 to-teal-50 dark:to-teal-950/40',
			border: 'border-emerald-200 dark:border-emerald-900/50',
			label: 'Básico'
		},
		'Intermediario': {
			bg: 'from-amber-500 to-orange-600',
			text: 'text-amber-700 dark:text-amber-300',
			badge: 'from-amber-50 dark:from-amber-950/40 to-orange-50 dark:to-orange-950/40',
			border: 'border-amber-200 dark:border-amber-900/50',
			label: 'Intermediário'
		},
		'Avancado': {
			bg: 'from-red-500 to-rose-600',
			text: 'text-red-700 dark:text-red-300',
			badge: 'from-red-50 dark:from-red-950/40 to-rose-50 dark:to-rose-950/40',
			border: 'border-red-200 dark:border-red-900/50',
			label: 'Avançado'
		}
	};

	return styles[difficulty] || styles['Intermediario'];
};

/**
 * ScenarioCard Component
 * Beautiful card for scenario selection with metadata
 */
export default function ScenarioCard({ scenario, isSelected, onClick }) {
	const difficultyStyle = getDifficultyStyle(scenario.metadata?.difficulty);

	return (
		<button
			onClick={onClick}
			className={`
				group relative p-6 rounded-2xl border-2 text-left transition-all duration-300
				transform hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50
				${isSelected
					? 'border-blue-500 bg-linear-to-br from-blue-50 dark:from-blue-950/40 to-indigo-50 dark:to-indigo-950/40 shadow-lg shadow-blue-500/10'
					: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm shadow-slate-200/50'
				}
			`}
		>
			{/* Selection indicator */}
			{isSelected && (
				<div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
					<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
					</svg>
				</div>
			)}

			{/* Header with icon and difficulty badge */}
			<div className="flex items-start justify-between gap-3 mb-4">
				<div className={`
					shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
					${isSelected
						? 'bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25'
						: 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50'
					}
				`}>
					<FaFileAlt className={`text-xl ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
				</div>

				{scenario.metadata?.difficulty && (
					<div className={`
						px-3 py-1.5 rounded-full text-xs font-bold border bg-linear-to-r ${difficultyStyle.badge} ${difficultyStyle.border} ${difficultyStyle.text}
					`}>
						{difficultyStyle.label}
					</div>
				)}
			</div>

			{/* Title */}
			<h3 className={`
				text-lg font-bold mb-3 transition-colors duration-300
				${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
			`}>
				{scenario.title}
			</h3>

			{/* Description */}
			<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-5 mb-4">
				{scenario.description}
			</p>

			{/* Metadata */}
			<div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
				{scenario.metadata?.estimatedDuration && (
					<div className="flex items-center gap-1.5">
						<FaClock className="text-slate-400 dark:text-slate-500" />
						<span>{scenario.metadata.estimatedDuration}</span>
					</div>
				)}
				{scenario.metadata?.targetAudience && (
					<div className="flex items-center gap-1.5">
						<FaUser className="text-slate-400 dark:text-slate-500" />
						<span className="line-clamp-1">{scenario.metadata.targetAudience.split(',')[0]}</span>
					</div>
				)}
				{scenario.metadata?.lastUpdate && (
					<div className="flex items-center gap-1.5">
						<FaCalendar className="text-slate-400 dark:text-slate-500" />
						<span>{new Date(scenario.metadata.lastUpdate).toLocaleDateString('pt-BR')}</span>
					</div>
				)}
			</div>

			{/* Hover effect overlay */}
			<div className={`
				absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300
				bg-linear-to-br from-blue-500 to-indigo-600 pointer-events-none
			`} />
		</button>
	);
}
