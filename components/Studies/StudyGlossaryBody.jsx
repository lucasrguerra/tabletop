"use client";

import { useMemo, useRef } from 'react';
import Link from 'next/link';

/**
 * StudyGlossaryBody — renders GLOSSARIO article content
 * Alphabetical index bar + terms grouped by first letter
 */
export default function StudyGlossaryBody({ content }) {
    const terms = content?.terms || [];
    const sectionRefs = useRef({});

    const grouped = useMemo(() => {
        const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, 'pt'));
        const groups = {};
        for (const term of sorted) {
            const letter = term.term[0].toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(term);
        }
        return groups;
    }, [terms]);

    const letters = Object.keys(grouped).sort();

    if (!terms.length) {
        return <p className="text-slate-500 text-sm">Nenhum termo encontrado.</p>;
    }

    const scrollTo = (letter) => {
        sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div>
            {/* Alphabetical index */}
            <div className="flex flex-wrap gap-1.5 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {letters.map(letter => (
                    <button
                        key={letter}
                        onClick={() => scrollTo(letter)}
                        className="w-8 h-8 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600
                                   hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150 shadow-sm"
                    >
                        {letter}
                    </button>
                ))}
            </div>

            {/* Term groups */}
            <div className="space-y-6">
                {letters.map(letter => (
                    <div key={letter} ref={el => sectionRefs.current[letter] = el}>
                        {/* Letter divider */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {letter}
                            </span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Terms */}
                        <div className="space-y-2.5">
                            {grouped[letter].map((term, i) => (
                                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-start gap-3 mb-2">
                                        <h3 className="font-bold text-slate-900 text-sm leading-snug">
                                            {term.term}
                                        </h3>
                                        {term.acronym && (
                                            <span className="shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                {term.acronym}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {term.definition}
                                    </p>

                                    {(term.seeAlso?.length > 0 || term.relatedStudyId) && (
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {term.seeAlso?.length > 0 && (
                                                <span className="text-xs text-slate-400">
                                                    Ver também:{' '}
                                                    {term.seeAlso.map((s, si) => (
                                                        <span key={si} className="text-blue-600 italic">
                                                            {s}{si < term.seeAlso.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </span>
                                            )}
                                            {term.relatedStudyId && (
                                                <Link
                                                    href={`/dashboard/studies/${term.relatedStudyId}`}
                                                    className="text-xs text-blue-600 hover:underline font-medium"
                                                >
                                                    → Artigo relacionado
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
