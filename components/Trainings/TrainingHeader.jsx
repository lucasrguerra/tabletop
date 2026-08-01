import Link from 'next/link';
import { FaArrowLeft, FaUserShield, FaUser, FaEye, FaBook } from 'react-icons/fa';

// Role configuration
const ROLE_CONFIG = {
	facilitator: {
		label: 'Facilitador',
		color: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900/50',
		icon: FaUserShield,
		gradient: 'from-violet-500 to-purple-600'
	},
	participant: {
		label: 'Participante',
		color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
		icon: FaUser,
		gradient: 'from-blue-500 to-indigo-600'
	},
	observer: {
		label: 'Observador',
		color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
		icon: FaEye,
		gradient: 'from-slate-500 to-slate-600'
	}
};

export default function TrainingHeader({ training, userRole }) {
	const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.participant;
	const RoleIcon = roleConfig.icon;

	return (
		<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 overflow-hidden">
			{/* Header Section */}
			<div className="relative p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800">
				<div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				
				<div className="relative">
					{/* Breadcrumb */}
					<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
						<Link 
							href="/dashboard/trainings" 
							className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
						>
							<FaBook className="text-xs" />
							Treinamentos
						</Link>
						<span>/</span>
						<span className="text-slate-700 dark:text-slate-200 font-medium">{training.name}</span>
					</div>

					{/* Title and Role Badge */}
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
								{training.name}
							</h1>
							{training.description && (
								<p className="text-slate-600 dark:text-slate-300 text-base lg:text-lg">
									{training.description}
								</p>
							)}
						</div>

						{/* Role Badge */}
						<div className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 ${roleConfig.color} dark:bg-slate-800 dark:border-slate-700 flex items-center gap-2`}>
							<RoleIcon className="text-base" />
							<span>{roleConfig.label}</span>
						</div>
					</div>

					{/* Creator Info */}
					<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
						<span>Criado por</span>
						<span className="font-semibold text-slate-900 dark:text-white">
							{training.created_by.nickname || training.created_by.name}
						</span>
					</div>
				</div>
			</div>

			{/* Back Button */}
			<div className="p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-900/50">
				<Link
					href="/dashboard/trainings"
					className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm"
				>
					<FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
					Voltar para Lista
				</Link>
			</div>
		</div>
	);
}
}
