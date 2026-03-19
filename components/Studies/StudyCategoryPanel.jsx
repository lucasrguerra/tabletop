"use client";

import { FaShieldAlt, FaNetworkWired, FaChartLine, FaServer, FaGraduationCap, FaLock, FaThLarge } from 'react-icons/fa';

const CATEGORIES = [
    {
        id: 'GOV_LEGAL',
        title: 'Governança e Legal',
        icon: FaShieldAlt,
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-50 to-pink-50',
        borderActive: 'border-purple-400',
        iconColor: 'text-purple-600'
    },
    {
        id: 'NET_ROUT',
        title: 'Roteamento',
        icon: FaNetworkWired,
        gradient: 'from-blue-500 to-cyan-600',
        bgGradient: 'from-blue-50 to-cyan-50',
        borderActive: 'border-blue-400',
        iconColor: 'text-blue-600'
    },
    {
        id: 'NET_VOL',
        title: 'Ataques Volumétricos',
        icon: FaChartLine,
        gradient: 'from-red-500 to-orange-600',
        bgGradient: 'from-red-50 to-orange-50',
        borderActive: 'border-red-400',
        iconColor: 'text-red-600'
    },
    {
        id: 'PHY_L2',
        title: 'Física e Camada 2',
        icon: FaServer,
        gradient: 'from-green-500 to-teal-600',
        bgGradient: 'from-green-50 to-teal-50',
        borderActive: 'border-green-400',
        iconColor: 'text-green-600'
    },
    {
        id: 'SCI_DATA',
        title: 'Dados Científicos',
        icon: FaGraduationCap,
        gradient: 'from-indigo-500 to-purple-600',
        bgGradient: 'from-indigo-50 to-purple-50',
        borderActive: 'border-indigo-400',
        iconColor: 'text-indigo-600'
    },
    {
        id: 'SEC_SYS',
        title: 'Segurança de Sistemas',
        icon: FaLock,
        gradient: 'from-rose-500 to-red-600',
        bgGradient: 'from-rose-50 to-red-50',
        borderActive: 'border-rose-400',
        iconColor: 'text-rose-600'
    }
];

/**
 * StudyCategoryPanel — horizontal scrollable category filter
 * @param {string|null} activeCategory - Currently selected category ID or null for all
 * @param {Function} onChange - Called with category ID or null
 * @param {Object} counts - { [categoryId]: number } article counts per category
 */
export default function StudyCategoryPanel({ activeCategory, onChange, counts = {} }) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* "Todas" button */}
            <button
                onClick={() => onChange(null)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                    ${!activeCategory
                        ? 'border-blue-500 bg-linear-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
                    }`}
            >
                <FaThLarge className="text-xs" />
                Todas
            </button>

            {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = counts[cat.id] || 0;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                            ${isActive
                                ? `${cat.borderActive} bg-linear-to-br ${cat.bgGradient} ${cat.iconColor} shadow-sm`
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
                            }`}
                    >
                        <Icon className={`text-xs ${isActive ? cat.iconColor : 'text-slate-400'}`} />
                        <span className="whitespace-nowrap">{cat.title}</span>
                        {count > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                                ${isActive ? `bg-white/60 ${cat.iconColor}` : 'bg-slate-100 text-slate-500'}`}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
