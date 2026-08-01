"use client";

import { FaBookOpen, FaListOl, FaTools, FaBook, FaThLarge } from 'react-icons/fa';

const TYPES = [
    { id: null,          label: 'Todos os tipos', icon: FaThLarge },
    { id: 'CONCEITO',    label: 'Conceito',       icon: FaBookOpen },
    { id: 'PROCEDIMENTO',label: 'Procedimento',   icon: FaListOl },
    { id: 'FERRAMENTA',  label: 'Ferramenta',     icon: FaTools },
    { id: 'GLOSSARIO',   label: 'Glossário',      icon: FaBook }
];

/**
 * StudyTypeFilter — pill tabs for content type selection
 * @param {string|null} activeType - Currently selected content type or null for all
 * @param {Function} onChange - Called with content type ID or null
 */
export default function StudyTypeFilter({ activeType, onChange }) {
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {TYPES.map(type => {
                const Icon = type.icon;
                const isActive = activeType === type.id;

                return (
                    <button
                        key={type.id ?? 'all'}
                        onClick={() => onChange(type.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800 ${
                            isActive
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-2 border-blue-500 font-bold shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                        }`}
                    >
                        <Icon className={`text-[11px] ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{type.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
