import { FaUsers, FaUserShield, FaUser, FaEye, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Role configuration
const ROLE_CONFIG = {
	facilitator: {
		label: 'Facilitador',
		color: 'bg-violet-100 text-violet-700',
		icon: FaUserShield
	},
	participant: {
		label: 'Participante',
		color: 'bg-blue-100 text-blue-700',
		icon: FaUser
	},
	observer: {
		label: 'Observador',
		color: 'bg-slate-100 text-slate-700',
		icon: FaEye
	}
};

// Status configuration
const STATUS_CONFIG = {
	accepted: {
		label: 'Aceito',
		color: 'bg-emerald-100 text-emerald-700',
		icon: FaCheckCircle
	},
	pending: {
		label: 'Pendente',
		color: 'bg-amber-100 text-amber-700',
		icon: FaClock
	},
	declined: {
		label: 'Recusado',
		color: 'bg-red-100 text-red-700',
		icon: FaTimesCircle
	}
};

export default function ParticipantsList({ participants, userRole, showManagement = false, onManageParticipant }) {
	const isFacilitator = userRole === 'facilitator';

	// Get initials for avatar
	const getInitials = (name) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	};

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2.5 bg-blue-100 rounded-xl">
					<FaUsers className="text-xl text-blue-600" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Participantes
					</h3>
					<p className="text-sm text-slate-500">
						{participants.length} {participants.length === 1 ? 'pessoa' : 'pessoas'}
					</p>
				</div>
			</div>

			{/* Participants List */}
			{participants.length === 0 ? (
				<div className="text-center py-8 text-slate-500">
					<p>Nenhum participante ainda</p>
				</div>
			) : (
				<div className="space-y-3">
					{participants.map((participant) => {
						const roleConfig = ROLE_CONFIG[participant.role] || ROLE_CONFIG.participant;
						const statusConfig = STATUS_CONFIG[participant.status] || STATUS_CONFIG.accepted;
						const RoleIcon = roleConfig.icon;
						const StatusIcon = statusConfig.icon;
						const isPending = participant.status === 'pending';

						return (
							<div
								key={participant.user?.nickname || participant.nickname}
								className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
							>
								{/* Avatar and User Info Container */}
								<div className="flex items-center gap-3 flex-1 min-w-0">
									{/* Avatar */}
									<div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${roleConfig.color.includes('violet') ? 'from-violet-400 to-purple-500' : roleConfig.color.includes('blue') ? 'from-blue-400 to-indigo-500' : 'from-slate-400 to-slate-500'} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shrink-0`}>
										{isPending ? '?' : getInitials(participant.user.name)}
									</div>

									{/* User Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
												{isPending ? `@${participant.user?.nickname || participant.nickname}` : participant.user.name}
											</p>
											{/* Role Badge */}
											<div className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleConfig.color} flex items-center gap-1 shrink-0`}>
												<RoleIcon className="text-xs" />
												<span className="hidden xs:inline">{roleConfig.label}</span>
											</div>
										</div>
										
										<div className="flex flex-col xs:flex-row xs:flex-wrap xs:items-center gap-1 xs:gap-2 text-xs text-slate-500">
											{!isPending && (
												<span className="flex items-center gap-1">
													<FaUser className="text-xs shrink-0" />
													<span className="truncate">@{participant.user.nickname}</span>
												</span>
											)}
											
											{/* Show email only for facilitators and accepted participants */}
											{!isPending && isFacilitator && participant.user.email && (
												<span className="flex items-center gap-1 min-w-0">
													<FaEnvelope className="text-xs shrink-0" />
													<span className="truncate max-w-50 xs:max-w-[150px] sm:max-w-50" title={participant.user.email}>
														{participant.user.email}
													</span>
												</span>
											)}
											
											{isPending && (
												<span className="text-amber-600 font-medium">
													Aguardando resposta do convite
												</span>
											)}
											
											{!isPending && participant.joined_at && (
												<span className="flex items-center gap-1 shrink-0">
													<FaClock className="text-xs" />
													<span className="whitespace-nowrap">{formatDate(participant.joined_at)}</span>
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Right Side: Status Badge */}
								<div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap sm:shrink-0">
									{/* Status Badge (for facilitators) */}
									{isFacilitator && participant.status && (
										<div className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium ${statusConfig.color} flex items-center gap-1.5`}>
											<StatusIcon className="text-xs" />
											<span className="hidden xs:inline">{statusConfig.label}</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
