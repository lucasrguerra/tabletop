import Link from 'next/link';
import { FaArrowLeft, FaUserShield, FaUser, FaEye, FaBook } from 'react-icons/fa';

// Role configuration
const ROLE_CONFIG = {
	facilitator: {
		label: 'Facilitador',
		color: 'bg-violet-100 text-violet-700 border-violet-200',
		icon: FaUserShield,
		gradient: 'from-violet-500 to-purple-600'
	},
	participant: {
		label: 'Participante',
		color: 'bg-blue-100 text-blue-700 border-blue-200',
		icon: FaUser,
		gradient: 'from-blue-500 to-indigo-600'
	},
	observer: {
		label: 'Observador',
		color: 'bg-slate-100 text-slate-700 border-slate-200',
		icon: FaEye,
		gradient: 'from-slate-500 to-slate-600'
	}
};

export default function TrainingHeader({ training, userRole }) {
	const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.participant;
	const RoleIcon = roleConfig.icon;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
			{/* Header Section */}
			<div className="relative p-6 lg:p-8 border-b border-slate-100">
				<div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				
				<div className="relative">
					{/* Breadcrumb */}
					<div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
						<Link 
							href="/dashboard/trainings" 
							className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
						>
							<FaBook className="text-xs" />
							Treinamentos
						</Link>
						<span>/</span>
						<span className="text-slate-700 font-medium">{training.name}</span>
					</div>

					{/* Title and Role Badge */}
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
								{training.name}
							</h1>
							{training.description && (
								<p className="text-slate-600 text-base lg:text-lg">
									{training.description}
								</p>
							)}
						</div>

						{/* Role Badge */}
						<div className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 ${roleConfig.color} flex items-center gap-2`}>
							<RoleIcon className="text-base" />
							<span>{roleConfig.label}</span>
						</div>
					</div>

					{/* Creator Info */}
					<div className="flex items-center gap-2 text-sm text-slate-600">
						<span>Criado por</span>
						<span className="font-semibold text-slate-900">
							{training.created_by.nickname || training.created_by.name}
						</span>
					</div>
				</div>
			</div>

			{/* Back Button */}
			<div className="p-4 lg:p-6 bg-slate-50/50">
				<Link
					href="/dashboard/trainings"
					className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-sm"
				>
					<FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
					Voltar para Lista
				</Link>
			</div>
		</div>
	);
}
