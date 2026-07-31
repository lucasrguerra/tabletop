'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	FaArrowLeft, FaCircle, FaExclamationTriangle, FaUserShield, FaUser, FaEye,
} from 'react-icons/fa';

/**
 * TrainingConsole
 *
 * The instrument panel for a live exercise: phase, round position, clocks and
 * answer progress, in one place at the top of every role's view.
 *
 * Everything numeric is set in tabular figures so digits do not jitter as the
 * clock runs — the one typographic liberty taken here, and a functional one.
 */

const PHASE_LOOK = {
	not_started: { label: 'Preparação', text: 'text-slate-600',  dot: 'text-slate-400',   rail: 'bg-slate-300' },
	active:      { label: 'Ao vivo',    text: 'text-emerald-700', dot: 'text-emerald-500', rail: 'bg-emerald-500' },
	paused:      { label: 'Pausado',    text: 'text-amber-700',  dot: 'text-amber-500',   rail: 'bg-amber-500' },
	completed:   { label: 'Encerrado',  text: 'text-blue-700',   dot: 'text-blue-500',    rail: 'bg-blue-500' },
};

const ROLE_LOOK = {
	facilitator: { label: 'Facilitador', icon: FaUserShield },
	participant: { label: 'Participante', icon: FaUser },
	observer:    { label: 'Observador',  icon: FaEye },
};

/** Formats milliseconds as H:MM:SS (or M:SS under an hour). */
function formatClock(ms) {
	if (!ms || ms < 0) { ms = 0; }
	const total = Math.floor(ms / 1000);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n) => String(n).padStart(2, '0');
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Live elapsed time for a timer that may be running or paused. */
function useElapsed(timer, isRunning) {
	const base = timer?.elapsed_time || 0;
	const startedAt = timer?.started_at ? new Date(timer.started_at).getTime() : null;
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!isRunning || !startedAt) { return; }
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [isRunning, startedAt]);

	if (!isRunning || !startedAt) { return base; }
	return base + Math.max(0, now - startedAt);
}

function Readout({ label, value, sub, emphasis = false }) {
	return (
		<div className="min-w-0">
			<p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">
				{label}
			</p>
			<p className={`font-mono tabular-nums leading-none truncate ${
				emphasis ? 'text-2xl lg:text-3xl font-semibold text-slate-900' : 'text-lg lg:text-xl text-slate-700'
			}`}>
				{value}
			</p>
			{sub && <p className="text-[11px] text-slate-500 mt-1 truncate">{sub}</p>}
		</div>
	);
}

export default function TrainingConsole({
	training,
	userRole,
	rounds = [],
	isConnected = true,
	children,
}) {
	const status = training?.status || 'not_started';
	const look = PHASE_LOOK[status] || PHASE_LOOK.not_started;
	const role = ROLE_LOOK[userRole] || ROLE_LOOK.participant;
	const RoleIcon = role.icon;

	const isLive = status === 'active';
	const currentRound = training?.current_round ?? 0;
	const totalRounds = rounds.length;

	const trainingElapsed = useElapsed(
		training?.training_timer,
		isLive && training?.training_timer?.is_paused === false
	);
	const roundElapsed = useElapsed(
		training?.round_timer,
		isLive && training?.round_timer?.is_paused === false
	);

	const roundTitle = rounds[currentRound]?.title;

	return (
		<section className="relative bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50 overflow-hidden">
			{/* Phase reads as a colour rail down the edge — the one place status is
			    encoded as pure colour, so it is legible from across a room. */}
			<div className={`absolute left-0 top-0 bottom-0 w-1 ${look.rail}`} aria-hidden="true" />

			{/* Identification */}
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-6 pr-5 py-3 border-b border-slate-100">
				<Link
					href="/dashboard/trainings"
					className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
				>
					<FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-0.5" />
					Treinamentos
				</Link>

				<h1 className="text-sm font-semibold text-slate-900 truncate min-w-0 flex-1">
					{training?.name}
				</h1>

				<span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
					<RoleIcon className="text-slate-400" />
					{role.label}
				</span>

				{!isConnected && (
					<span
						className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium"
						role="status"
					>
						<FaExclamationTriangle className="text-[10px]" />
						Reconectando — os dados podem estar desatualizados
					</span>
				)}
			</div>

			{/* Instruments */}
			<div className="pl-6 pr-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 items-start">
				<div className="min-w-0">
					<p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-1">
						Estado
					</p>
					<p className={`inline-flex items-center gap-2 text-lg lg:text-xl font-semibold leading-none ${look.text}`}>
						<FaCircle className={`text-[7px] ${look.dot} ${isLive ? 'animate-pulse' : ''}`} />
						{look.label}
					</p>
				</div>

				<Readout
					label="Rodada"
					value={totalRounds > 0 ? `${currentRound + 1}/${totalRounds}` : '—'}
					sub={roundTitle}
					emphasis
				/>

				<Readout label="Tempo total" value={formatClock(trainingElapsed)} />
				<Readout label="Nesta rodada" value={formatClock(roundElapsed)} />
			</div>

			{/* Role-specific instruments: meter, controls */}
			{children && (
				<div className="pl-6 pr-5 py-4 border-t border-slate-100 bg-slate-50/60">
					{children}
				</div>
			)}
		</section>
	);
}
