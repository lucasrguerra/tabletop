'use client';

import { FaCheck } from 'react-icons/fa';

/**
 * MyRoundProgress
 *
 * A participant's own progress through the round they are reading. The old view
 * gave no way to tell whether you were done, so people re-read questions they
 * had already answered. One pip per question: filled means answered.
 */
export default function MyRoundProgress({ questions = [], roundIndex, responses = [] }) {
	if (questions.length === 0) {
		return (
			<p className="text-sm text-slate-500 dark:text-slate-400">
				Rodada de contextualização — leia o cenário, não há questões aqui.
			</p>
		);
	}

	const answeredIds = new Set(
		responses.filter(r => r.round_id === roundIndex).map(r => r.question_id)
	);
	const answered = questions.filter(q => answeredIds.has(q.id)).length;
	const done = answered === questions.length;

	return (
		<div>
			<div className="flex items-baseline justify-between gap-3 mb-2">
				<p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 font-semibold">
					Suas respostas nesta rodada
				</p>
				<p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
					<span className={done ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-slate-100 font-semibold'}>
						{answered}
					</span>
					/{questions.length}
				</p>
			</div>

			<div className="flex flex-wrap gap-1.5">
				{questions.map((q, i) => {
					const isAnswered = answeredIds.has(q.id);
					return (
						<span
							key={q.id}
							title={`Questão ${i + 1}${isAnswered ? ' — respondida' : ' — pendente'}`}
							className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-mono tabular-nums font-semibold transition-colors ${
								isAnswered
									? 'bg-emerald-500 text-white'
									: 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
							}`}
						>
							{isAnswered ? <FaCheck className="text-[9px]" /> : i + 1}
						</span>
					);
				})}
			</div>

			{done && (
				<p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
					Rodada concluída. Aguarde o facilitador abrir a próxima.
				</p>
			)}
		</div>
	);
}
