"use client";

import { FaBookOpen, FaListOl, FaTools, FaBook, FaThLarge } from 'react-icons/fa';

const TYPES = [
    { id: null,          label: 'Todos',         icon: FaThLarge },
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
        <div className="flex items-center gap-2 flex-wrap">
            {TYPES.map(type => {
                const Icon = type.icon;
                const isActive = activeType === type.id;

                return (
                    <button
                        key={type.id ?? 'all'}
                        onClick={() => onChange(type.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
                            ${isActive
                                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                    >
                        <Icon className="text-xs" />
                        {type.label}
                    </button>
                );
            })}
        </div>
    );
}
