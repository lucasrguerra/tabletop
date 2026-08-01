"use client";

import { FaShieldAlt, FaNetworkWired, FaChartLine, FaServer, FaGraduationCap, FaLock, FaThLarge } from 'react-icons/fa';

const CATEGORIES = [
    {
        id: 'GOV_LEGAL',
        title: 'Governança e Legal',
        icon: FaShieldAlt,
        activeClass: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500 font-bold shadow-xs',
        iconColor: 'text-purple-600 dark:text-purple-400',
        badgeActive: 'bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
    },
    {
        id: 'NET_ROUT',
        title: 'Roteamento',
        icon: FaNetworkWired,
        activeClass: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500 font-bold shadow-xs',
        iconColor: 'text-blue-600 dark:text-blue-400',
        badgeActive: 'bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
    },
    {
        id: 'NET_VOL',
        title: 'Ataques Volumétricos',
        icon: FaChartLine,
        activeClass: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-2 border-red-500 font-bold shadow-xs',
        iconColor: 'text-red-600 dark:text-red-400',
        badgeActive: 'bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300'
    },
    {
        id: 'PHY_L2',
        title: 'Física e Camada 2',
        icon: FaServer,
        activeClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500 font-bold shadow-xs',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badgeActive: 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
    },
    {
        id: 'SCI_DATA',
        title: 'Dados Científicos',
        icon: FaGraduationCap,
        activeClass: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500 font-bold shadow-xs',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        badgeActive: 'bg-indigo-200 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300'
    },
    {
        id: 'SEC_SYS',
        title: 'Segurança de Sistemas',
        icon: FaLock,
        activeClass: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-2 border-rose-500 font-bold shadow-xs',
        iconColor: 'text-rose-600 dark:text-rose-400',
        badgeActive: 'bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
    }
];

/**
 * StudyCategoryPanel — pill tabs for category selection (flex-wrap)
 * @param {string|null} activeCategory - Currently selected category ID or null for all
 * @param {Function} onChange - Called with category ID or null
 * @param {Object} counts - { [categoryId]: number } article counts per category
 */
export default function StudyCategoryPanel({ activeCategory, onChange, counts = {} }) {
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {/* "Todas" button */}
            <button
                onClick={() => onChange(null)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 ${
                    !activeCategory
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-2 border-blue-500 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                }`}
            >
                <FaThLarge className={`text-[11px] ${!activeCategory ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>Todas</span>
            </button>

            {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = counts[cat.id] || 0;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 ${
                            isActive
                                ? cat.activeClass
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                        }`}
                    >
                        <Icon className={`text-[11px] ${isActive ? cat.iconColor : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{cat.title}</span>
                        {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ml-0.5 ${
                                isActive
                                    ? cat.badgeActive
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

