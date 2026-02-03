"use client";

import { FaBolt } from 'react-icons/fa';

/**
 * IncidentTypeCard Component
 * Card for incident type selection with description
 */
export default function IncidentTypeCard({ type, isSelected, onClick }) {
	return (
		<button
			onClick={onClick}
			className={`
				group relative p-5 rounded-xl border-2 text-left transition-all duration-300
				transform hover:scale-[1.01] hover:shadow-lg
				${isSelected
					? 'border-blue-500 bg-linear-to-br from-blue-50 to-indigo-50 shadow-md'
					: 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
				}
			`}
		>
			{/* Selection indicator */}
			{isSelected && (
				<div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
					<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
					</svg>
				</div>
			)}

			<div className="flex items-start gap-3">
				{/* Icon */}
				<div className={`
					shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
					${isSelected
						? 'bg-linear-to-br from-blue-500 to-indigo-600 shadow-md'
						: 'bg-gray-100 group-hover:bg-blue-100'
					}
				`}>
					<FaBolt className={`text-lg ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h4 className={`
						font-bold mb-1 transition-colors duration-300
						${isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'}
					`}>
						{type.title}
					</h4>
					<p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
						{type.description}
					</p>
				</div>
			</div>

			{/* Hover effect overlay */}
			<div className={`
				absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300
				bg-linear-to-br from-blue-500 to-indigo-600 pointer-events-none
			`} />
		</button>
	);
}
