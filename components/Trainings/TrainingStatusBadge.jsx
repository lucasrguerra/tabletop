import { FaClock, FaPlay, FaPause, FaCheckCircle } from 'react-icons/fa';

// Status configuration with colors and icons
const STATUS_CONFIG = {
	not_started: {
		label: 'Não Iniciado',
		color: 'bg-slate-100 text-slate-700 border-slate-200',
		icon: FaClock,
		iconColor: 'text-slate-500',
		gradient: 'from-slate-400 to-slate-500'
	},
	active: {
		label: 'Em Andamento',
		color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
		icon: FaPlay,
		iconColor: 'text-emerald-500',
		gradient: 'from-emerald-400 to-teal-500'
	},
	paused: {
		label: 'Pausado',
		color: 'bg-amber-100 text-amber-700 border-amber-200',
		icon: FaPause,
		iconColor: 'text-amber-500',
		gradient: 'from-amber-400 to-orange-500'
	},
	completed: {
		label: 'Concluído',
		color: 'bg-blue-100 text-blue-700 border-blue-200',
		icon: FaCheckCircle,
		iconColor: 'text-blue-500',
		gradient: 'from-blue-400 to-indigo-500'
	}
};

export default function TrainingStatusBadge({ status, size = 'md', showLabel = true }) {
	const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
	const StatusIcon = statusConfig.icon;

	// Size variations
	const sizeClasses = {
		sm: {
			container: 'px-2.5 py-1.5 text-xs',
			icon: 'text-xs',
			gap: 'gap-1.5'
		},
		md: {
			container: 'px-3 py-2 text-sm',
			icon: 'text-sm',
			gap: 'gap-2'
		},
		lg: {
			container: 'px-4 py-2.5 text-base',
			icon: 'text-base',
			gap: 'gap-2.5'
		}
	};

	const currentSize = sizeClasses[size] || sizeClasses.md;

	return (
		<div className={`inline-flex items-center ${currentSize.gap} ${currentSize.container} rounded-lg font-semibold border ${statusConfig.color}`}>
			<StatusIcon className={`${currentSize.icon} ${statusConfig.iconColor}`} />
			{showLabel && <span>{statusConfig.label}</span>}
		</div>
	);
}
