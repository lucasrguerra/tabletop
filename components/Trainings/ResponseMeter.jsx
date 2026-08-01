'use client';

import { questionText } from '@/utils/questions';

/**
 * ResponseMeter
 *
 * Answers the one question a facilitator asks constantly during a live round —
 * "can I move on yet?" — without expanding anything. One column per question,
 * filled proportionally to how many of the team have answered it. A column that
 * is not full is a team member still working.
 */
export default function ResponseMeter({
	questions = [],
	roundIndex,
	responses = [],
	totalParticipants = 0,
}) {
	if (questions.length === 0) {
		return (
			<p className="text-sm text-slate-500 dark:text-slate-400">
				Esta rodada não tem questões — é de contextualização.
			</p>
		);
	}

	const roundResponses = responses.filter(r => r.round_id === roundIndex);

	const perQuestion = questions.map(q => {
		const answered = roundResponses.filter(r => r.question_id === q.id).length;
		return {
			id: q.id,
			text: questionText(q),
			answered,
			ratio: totalParticipants > 0 ? Math.min(1, answered / totalParticipants) : 0,
		};
	});

	const answeredTotal = roundResponses.length;
	const expectedTotal = questions.length * totalParticipants;
	const complete = expectedTotal > 0 && answeredTotal >= expectedTotal;

	return (
		<div>
			<div className="flex items-baseline justify-between gap-3 mb-2">
				<p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 font-semibold">
					Respostas desta rodada
				</p>
				<p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
					<span className={complete ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-slate-100 font-semibold'}>
						{answeredTotal}
					</span>
					/{expectedTotal || '—'}
				</p>
			</div>

			<div className="flex items-end gap-1" role="list">
				{perQuestion.map((q, i) => (
					<div
						key={q.id}
						role="listitem"
						title={`Q${i + 1}: ${q.text} — ${q.answered} de ${totalParticipants}`}
						className="flex-1 min-w-0"
					>
						<div className="h-8 rounded bg-slate-200/70 dark:bg-slate-700/70 overflow-hidden flex items-end">
							<div
								className={`w-full transition-[height] duration-500 ease-out ${
									q.ratio >= 1 ? 'bg-emerald-500' : 'bg-blue-500/70'
								}`}
								style={{ height: `${Math.round(q.ratio * 100)}%` }}
							/>
						</div>
						<p className="mt-1 text-center text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
							{i + 1}
						</p>
					</div>
				))}
			</div>

			{totalParticipants === 0 && (
				<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
					Nenhum participante aceito ainda.
				</p>
			)}
		</div>
	);
}
