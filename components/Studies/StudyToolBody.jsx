"use client";

import { useState } from 'react';
import { FaTerminal, FaChevronDown, FaChevronUp, FaExclamationTriangle } from 'react-icons/fa';

function FlagTable({ flags }) {
    if (!flags?.length) return null;

    return (
        <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">Flag</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Significado</th>
                    </tr>
                </thead>
                <tbody>
                    {flags.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 font-mono text-blue-700 dark:text-blue-400 whitespace-nowrap">{f.flag}</td>
                            <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{f.meaning}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CommandCard({ cmd, index }) {
    const [showOutput, setShowOutput] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/50 overflow-hidden">
            {/* Command header */}
            <div className="bg-slate-900 px-4 py-3 flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-bold mt-0.5">
                    {index + 1}
                </span>
                <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                    {cmd.command}
                </pre>
            </div>

            <div className="p-4 space-y-3">
                {/* Description */}
                {cmd.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{cmd.description}</p>
                )}

                {/* Flags table */}
                {cmd.flags?.length > 0 && <FlagTable flags={cmd.flags} />}

                {/* Example output toggle */}
                {cmd.exampleOutput && (
                    <div>
                        <button
                            onClick={() => setShowOutput(v => !v)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                            {showOutput ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                            {showOutput ? 'Ocultar saída de exemplo' : 'Ver saída de exemplo'}
                        </button>
                        {showOutput && (
                            <pre className="mt-2 bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-xl overflow-x-auto whitespace-pre leading-relaxed">
                                {cmd.exampleOutput}
                            </pre>
                        )}
                    </div>
                )}

                {/* Interpretation */}
                {cmd.interpretation && (
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Como interpretar</p>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">{cmd.interpretation}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * StudyToolBody — renders FERRAMENTA article content
 * Commands as cards with flags table, collapsible output and interpretation
 */
export default function StudyToolBody({ content }) {
    const commands = content?.commands || [];

    return (
        <div className="space-y-4">
            {/* Tool header */}
            {(content?.toolName || content?.purpose) && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
                    {content.toolName && (
                        <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{content.toolName}</p>
                    )}
                    {content.toolVersion && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Versão: {content.toolVersion}</p>
                    )}
                    {content.purpose && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{content.purpose}</p>
                    )}
                    {content.installHint && (
                        <div className="mt-3 flex items-start gap-2">
                            <FaTerminal className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500 text-xs" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{content.installHint}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Commands */}
            {commands.map((cmd, i) => (
                <CommandCard key={i} cmd={cmd} index={i} />
            ))}

            {/* Output fields reference table */}
            {content?.outputFields?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/50 p-5">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Referência de campos de saída</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800">
                                    <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Campo</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Significado</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Faixa normal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content.outputFields.map((f, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 font-mono text-blue-700 dark:text-blue-400 whitespace-nowrap">{f.field}</td>
                                        <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{f.meaning}</td>
                                        <td className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">{f.normalRange}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Common pitfalls */}
            {content?.commonPitfalls?.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-5">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3">Erros comuns a evitar</p>
                    <ul className="space-y-2">
                        {content.commonPitfalls.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                <FaExclamationTriangle className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400 text-xs" />
                                <span className="leading-relaxed">{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
