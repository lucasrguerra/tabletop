'use client';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Builds a compact page list with ellipses: 1 … 4 5 [6] 7 8 … 20
 * Keeps the control a fixed width no matter how large the library grows.
 */
function pageWindow(current, total, span = 1) {
	const pages = new Set([1, total, current]);
	for (let i = 1; i <= span; i++) {
		if (current - i >= 1) { pages.add(current - i); }
		if (current + i <= total) { pages.add(current + i); }
	}

	const sorted = [...pages].sort((a, b) => a - b);
	const out = [];
	let previous = 0;

	for (const p of sorted) {
		if (previous && p - previous > 1) { out.push('gap'); }
		out.push(p);
		previous = p;
	}
	return out;
}

export default function StudyPagination({ pagination, onPageChange }) {
	if (!pagination || pagination.total_pages <= 1) { return null; }

	const { page, total_pages, total, limit, has_prev, has_next } = pagination;
	const first = (page - 1) * limit + 1;
	const last = Math.min(page * limit, total);

	return (
		<nav
			className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-200"
			aria-label="Paginação dos artigos"
		>
			<p className="text-sm text-slate-500 order-2 sm:order-1">
				Mostrando <span className="font-medium text-slate-700 tabular-nums">{first}–{last}</span>
				{' '}de <span className="font-medium text-slate-700 tabular-nums">{total}</span>
			</p>

			<div className="flex items-center gap-1 order-1 sm:order-2">
				<button
					onClick={() => onPageChange(page - 1)}
					disabled={!has_prev}
					aria-label="Página anterior"
					className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
				>
					<FaChevronLeft className="text-sm" />
				</button>

				{pageWindow(page, total_pages).map((entry, i) =>
					entry === 'gap' ? (
						<span key={`gap-${i}`} className="px-1.5 text-slate-400 select-none" aria-hidden="true">
							…
						</span>
					) : (
						<button
							key={entry}
							onClick={() => onPageChange(entry)}
							aria-current={entry === page ? 'page' : undefined}
							aria-label={`Página ${entry}`}
							className={`min-w-9 h-9 px-2 rounded-xl text-sm font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
								entry === page
									? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
									: 'border border-slate-200 text-slate-600 hover:bg-slate-50'
							}`}
						>
							{entry}
						</button>
					)
				)}

				<button
					onClick={() => onPageChange(page + 1)}
					disabled={!has_next}
					aria-label="Próxima página"
					className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
				>
					<FaChevronRight className="text-sm" />
				</button>
			</div>
		</nav>
	);
}
