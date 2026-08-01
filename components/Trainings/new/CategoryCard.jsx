"use client";

import { FaShieldAlt, FaNetworkWired, FaChartLine, FaServer, FaGraduationCap, FaLock } from 'react-icons/fa';

/**
 * Get gradient colors and icon for each category
 */
const getCategoryStyle = (category_id) => {
	const styles = {
		'GOV_LEGAL': {
			gradient: 'from-purple-500 to-pink-600',
			bgGradient: 'from-purple-50 dark:from-purple-950/40 to-pink-50 dark:to-pink-950/40',
			borderColor: 'border-purple-500',
			icon: FaShieldAlt,
			iconColor: 'text-purple-600 dark:text-purple-400'
		},
		'NET_ROUT': {
			gradient: 'from-blue-500 to-cyan-600',
			bgGradient: 'from-blue-50 dark:from-blue-950/40 to-cyan-50 dark:to-cyan-950/40',
			borderColor: 'border-blue-500',
			icon: FaNetworkWired,
			iconColor: 'text-blue-600 dark:text-blue-400'
		},
		'NET_VOL': {
			gradient: 'from-red-500 to-orange-600',
			bgGradient: 'from-red-50 dark:from-red-950/40 to-orange-50 dark:to-orange-950/40',
			borderColor: 'border-red-500',
			icon: FaChartLine,
			iconColor: 'text-red-600 dark:text-red-400'
		},
		'PHY_L2': {
			gradient: 'from-green-500 to-teal-600',
			bgGradient: 'from-green-50 dark:from-green-950/40 to-teal-50 dark:to-teal-950/40',
			borderColor: 'border-green-500',
			icon: FaServer,
			iconColor: 'text-green-600 dark:text-green-400'
		},
		'SCI_DATA': {
			gradient: 'from-indigo-500 to-purple-600',
			bgGradient: 'from-indigo-50 dark:from-indigo-950/40 to-purple-50 dark:to-purple-950/40',
			borderColor: 'border-indigo-500',
			icon: FaGraduationCap,
			iconColor: 'text-indigo-600 dark:text-indigo-400'
		},
		'SEC_SYS': {
			gradient: 'from-rose-500 to-red-600',
			bgGradient: 'from-rose-50 dark:from-rose-950/40 to-red-50 dark:to-red-950/40',
			borderColor: 'border-rose-500',
			icon: FaLock,
			iconColor: 'text-rose-600 dark:text-rose-400'
		}
	};
	
	return styles[category_id] || {
		gradient: 'from-gray-500 to-gray-600',
		bgGradient: 'from-gray-50 dark:from-slate-900 to-gray-100 dark:to-slate-800',
		borderColor: 'border-gray-500',
		icon: FaShieldAlt,
		iconColor: 'text-gray-600 dark:text-slate-400'
	};
};

/**
 * CategoryCard Component
 * Beautiful card with gradient background for category selection
 */
export default function CategoryCard({ category, isSelected, onClick }) {
	const style = getCategoryStyle(category.id);
	const Icon = style.icon;

	return (
		<button
			onClick={onClick}
			className={`
				group relative p-6 rounded-2xl border-2 text-left transition-all duration-300
				transform hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50
				${isSelected
					? `${style.borderColor} bg-linear-to-br ${style.bgGradient} shadow-lg`
					: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm shadow-slate-200/50'
				}
			`}
		>
			{/* Gradient overlay on hover */}
			<div className={`
				absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300
				bg-linear-to-br ${style.gradient}
			`} />

			{/* Icon with gradient background */}
			<div className="relative flex items-start gap-4">
				<div className={`
					shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
					transition-all duration-300 transform group-hover:scale-110
					${isSelected
						? `bg-linear-to-br ${style.gradient} shadow-lg`
						: 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
					}
				`}>
					<Icon className={`text-2xl ${isSelected ? 'text-white' : style.iconColor}`} />
				</div>

				<div className="flex-1 min-w-0">
					<h3 className={`
						text-lg font-bold mb-2 transition-colors duration-300
						${isSelected ? style.iconColor : 'text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300'}
					`}>
						{category.title}
					</h3>
				</div>
			</div>

			<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4 mt-2">
				{category.description}
			</p>

			{/* Selection indicator */}
			{isSelected && (
				<div className={`
					absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center
					bg-linear-to-br ${style.gradient} shadow-lg
				`}>
					<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
					</svg>
				</div>
			)}
		</button>
	);
}
