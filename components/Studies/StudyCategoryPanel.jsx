"use client";

import { FaShieldAlt, FaNetworkWired, FaChartLine, FaServer, FaGraduationCap, FaLock, FaThLarge } from 'react-icons/fa';

const CATEGORIES = [
    {
        id: 'GOV_LEGAL',
        title: 'Governança e Legal',
        icon: FaShieldAlt,
        activeClass: 'bg-purple-50 text-purple-700 border-2 border-purple-500 font-bold shadow-xs',
        iconColor: 'text-purple-600',
        badgeActive: 'bg-purple-200 text-purple-800'
    },
    {
        id: 'NET_ROUT',
        title: 'Roteamento',
        icon: FaNetworkWired,
        activeClass: 'bg-blue-50 text-blue-700 border-2 border-blue-500 font-bold shadow-xs',
        iconColor: 'text-blue-600',
        badgeActive: 'bg-blue-200 text-blue-800'
    },
    {
        id: 'NET_VOL',
        title: 'Ataques Volumétricos',
        icon: FaChartLine,
        activeClass: 'bg-red-50 text-red-700 border-2 border-red-500 font-bold shadow-xs',
        iconColor: 'text-red-600',
        badgeActive: 'bg-red-200 text-red-800'
    },
    {
        id: 'PHY_L2',
        title: 'Física e Camada 2',
        icon: FaServer,
        activeClass: 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500 font-bold shadow-xs',
        iconColor: 'text-emerald-600',
        badgeActive: 'bg-emerald-200 text-emerald-800'
    },
    {
        id: 'SCI_DATA',
        title: 'Dados Científicos',
        icon: FaGraduationCap,
        activeClass: 'bg-indigo-50 text-indigo-700 border-2 border-indigo-500 font-bold shadow-xs',
        iconColor: 'text-indigo-600',
        badgeActive: 'bg-indigo-200 text-indigo-800'
    },
    {
        id: 'SEC_SYS',
        title: 'Segurança de Sistemas',
        icon: FaLock,
        activeClass: 'bg-rose-50 text-rose-700 border-2 border-rose-500 font-bold shadow-xs',
        iconColor: 'text-rose-600',
        badgeActive: 'bg-rose-200 text-rose-800'
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    !activeCategory
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 font-bold shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
                }`}
            >
                <FaThLarge className={`text-[11px] ${!activeCategory ? 'text-blue-600' : 'text-slate-400'}`} />
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                            isActive
                                ? cat.activeClass
                                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
                        }`}
                    >
                        <Icon className={`text-[11px] ${isActive ? cat.iconColor : 'text-slate-400'}`} />
                        <span>{cat.title}</span>
                        {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ml-0.5 ${
                                isActive
                                    ? cat.badgeActive
                                    : 'bg-slate-100 text-slate-500'
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

