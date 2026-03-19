"use client";

const DIFFICULTY_STYLES = {
    Basico: {
        badge: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700',
        label: 'Básico'
    },
    Intermediario: {
        badge: 'from-amber-50 to-orange-50 border-amber-200 text-amber-700',
        label: 'Intermediário'
    },
    Avancado: {
        badge: 'from-red-50 to-rose-50 border-red-200 text-red-700',
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
