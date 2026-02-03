"use client";

import { FaShieldAlt, FaNetworkWired, FaChartLine, FaServer, FaGraduationCap, FaLock } from 'react-icons/fa';

/**
 * Get gradient colors and icon for each category
 */
const getCategoryStyle = (category_id) => {
	const styles = {
		'GOV_LEGAL': {
			gradient: 'from-purple-500 to-pink-600',
			bgGradient: 'from-purple-50 to-pink-50',
			borderColor: 'border-purple-500',
			icon: FaShieldAlt,
			iconColor: 'text-purple-600'
		},
		'NET_ROUT': {
			gradient: 'from-blue-500 to-cyan-600',
			bgGradient: 'from-blue-50 to-cyan-50',
			borderColor: 'border-blue-500',
			icon: FaNetworkWired,
			iconColor: 'text-blue-600'
		},
		'NET_VOL': {
			gradient: 'from-red-500 to-orange-600',
			bgGradient: 'from-red-50 to-orange-50',
			borderColor: 'border-red-500',
			icon: FaChartLine,
			iconColor: 'text-red-600'
		},
		'PHY_L2': {
			gradient: 'from-green-500 to-teal-600',
			bgGradient: 'from-green-50 to-teal-50',
			borderColor: 'border-green-500',
			icon: FaServer,
			iconColor: 'text-green-600'
		},
		'SCI_DATA': {
			gradient: 'from-indigo-500 to-purple-600',
			bgGradient: 'from-indigo-50 to-purple-50',
			borderColor: 'border-indigo-500',
			icon: FaGraduationCap,
			iconColor: 'text-indigo-600'
		},
		'SEC_SYS': {
			gradient: 'from-rose-500 to-red-600',
			bgGradient: 'from-rose-50 to-red-50',
			borderColor: 'border-rose-500',
			icon: FaLock,
			iconColor: 'text-rose-600'
		}
	};
	
	return styles[category_id] || {
		gradient: 'from-gray-500 to-gray-600',
		bgGradient: 'from-gray-50 to-gray-100',
		borderColor: 'border-gray-500',
		icon: FaShieldAlt,
		iconColor: 'text-gray-600'
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
				transform hover:scale-105 hover:shadow-xl
				${isSelected
					? `${style.borderColor} bg-linear-to-br ${style.bgGradient} shadow-lg`
					: 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
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
						: 'bg-gray-100 group-hover:bg-gray-200'
					}
				`}>
					<Icon className={`text-2xl ${isSelected ? 'text-white' : style.iconColor}`} />
				</div>

				<div className="flex-1 min-w-0">
					<h3 className={`
						text-lg font-bold mb-2 transition-colors duration-300
						${isSelected ? style.iconColor : 'text-gray-900 group-hover:text-gray-700'}
					`}>
						{category.title}
					</h3>
				</div>
			</div>

			<p className="text-sm text-gray-600 leading-relaxed line-clamp-4 mt-2">
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
