"use client";

/**
 * StudyProgressBar — per-category progress indicator
 * Shows completed / total articles for a category
 */
export default function StudyProgressBar({ label, completed, total, colorClass = 'bg-blue-500' }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium truncate">{label}</span>
                <span className="text-slate-400 shrink-0 ml-2">{completed}/{total}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
