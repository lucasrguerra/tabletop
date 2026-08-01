"use client";

const DIFFICULTY_STYLES = {
    Basico: {
        badge: 'from-emerald-50 dark:from-emerald-950/40 to-teal-50 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300',
        label: 'Básico'
    },
    Intermediario: {
        badge: 'from-amber-50 dark:from-amber-950/40 to-orange-50 dark:to-orange-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300',
        label: 'Intermediário'
    },
    Avancado: {
        badge: 'from-red-50 dark:from-red-950/40 to-rose-50 dark:to-rose-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300',
        label: 'Avançado'
    }
};

export default function StudyDifficultyBadge({ difficulty, size = 'sm' }) {
    const style = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES['Intermediario'];
    const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-xs';

    return (
        <span className={`inline-flex items-center ${sizeClass} font-bold rounded-full border bg-linear-to-r ${style.badge}`}>
            {style.label}
        </span>
    );
}
