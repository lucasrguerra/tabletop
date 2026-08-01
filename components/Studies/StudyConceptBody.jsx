"use client";

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaExclamationTriangle, FaLightbulb, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const CALLOUT_STYLES = {
    info:    { bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',    icon: FaInfoCircle,         iconColor: 'text-blue-500 dark:text-blue-400',   textColor: 'text-blue-800 dark:text-blue-200' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',  icon: FaExclamationTriangle,iconColor: 'text-amber-500 dark:text-amber-400',  textColor: 'text-amber-800 dark:text-amber-200' },
    tip:     { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50', icon: FaLightbulb,       iconColor: 'text-emerald-500 dark:text-emerald-400',textColor: 'text-emerald-800 dark:text-emerald-200' },
    danger:  { bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',      icon: FaTimesCircle,        iconColor: 'text-red-500 dark:text-red-400',    textColor: 'text-red-800 dark:text-red-200' }
};

function Callout({ callout }) {
    if (!callout?.text) return null;
    const style = CALLOUT_STYLES[callout.type] || CALLOUT_STYLES.info;
    const Icon = style.icon;

    return (
        <div className={`flex gap-3 p-4 rounded-xl border ${style.bg} my-4`}>
            <Icon className={`shrink-0 mt-0.5 text-lg ${style.iconColor}`} />
            <p className={`text-sm leading-relaxed ${style.textColor}`}>{callout.text}</p>
        </div>
    );
}

function CodeBlock({ codeBlock }) {
    if (!codeBlock?.code) return null;

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-slate-700">
            {codeBlock.language && (
                <div className="bg-slate-800 px-4 py-1.5 text-xs text-slate-400 font-mono border-b border-slate-700">
                    {codeBlock.language}
                </div>
            )}
            <pre className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 overflow-x-auto leading-relaxed whitespace-pre">
                {codeBlock.code}
            </pre>
        </div>
    );
}

function KeyPoints({ keyPoints }) {
    if (!keyPoints?.length) return null;

    return (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Pontos-chave</p>
            <ul className="space-y-1.5">
                {keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <FaCheckCircle className="shrink-0 mt-0.5 text-blue-400 text-xs" />
                        <span className="leading-relaxed">{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * StudyConceptBody — renders CONCEITO article content
 * Sections are displayed as expandable accordion panels
 */
export default function StudyConceptBody({ content }) {
    const sections = content?.sections || [];
    const [expanded, setExpanded] = useState(
        sections.reduce((acc, s, i) => ({ ...acc, [s.id || i]: i === 0 }), {})
    );

    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    if (!sections.length) return <p className="text-slate-500 dark:text-slate-400 text-sm">Conteúdo não disponível.</p>;

    return (
        <div className="space-y-3">
            {sections.map((section, i) => {
                const key = section.id || i;
                const isOpen = expanded[key];

                return (
                    <div key={key} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-slate-950/50">
                        <button
                            onClick={() => toggle(key)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug pr-4">
                                {section.title}
                            </h3>
                            <span className={`shrink-0 p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                {isOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                            </span>
                        </button>

                        {isOpen && (
                            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
                                {section.body && (
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-4">
                                        {section.body}
                                    </p>
                                )}
                                {section.callout && <Callout callout={section.callout} />}
                                {section.codeBlock && <CodeBlock codeBlock={section.codeBlock} />}
                                {section.keyPoints && <KeyPoints keyPoints={section.keyPoints} />}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
