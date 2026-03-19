"use client";

import { useState } from 'react';
import { FaTerminal, FaChevronDown, FaChevronUp, FaExclamationTriangle } from 'react-icons/fa';

function FlagTable({ flags }) {
    if (!flags?.length) return null;

    return (
        <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 border border-slate-200 font-mono">Flag</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-600 border border-slate-200">Significado</th>
                    </tr>
                </thead>
                <tbody>
                    {flags.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 border border-slate-200 font-mono text-blue-700 whitespace-nowrap">{f.flag}</td>
                            <td className="px-3 py-1.5 border border-slate-200 text-slate-600">{f.meaning}</td>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                    <p className="text-sm text-slate-700 leading-relaxed">{cmd.description}</p>
                )}

                {/* Flags table */}
                {cmd.flags?.length > 0 && <FlagTable flags={cmd.flags} />}

                {/* Example output toggle */}
                {cmd.exampleOutput && (
                    <div>
                        <button
                            onClick={() => setShowOutput(v => !v)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
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
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-700 mb-1">Como interpretar</p>
                        <p className="text-xs text-blue-800 leading-relaxed">{cmd.interpretation}</p>
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
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    {content.toolName && (
                        <p className="text-lg font-bold text-slate-900 font-mono">{content.toolName}</p>
                    )}
                    {content.toolVersion && (
                        <p className="text-xs text-slate-400 mb-2">Versão: {content.toolVersion}</p>
                    )}
                    {content.purpose && (
                        <p className="text-sm text-slate-600 leading-relaxed mt-1">{content.purpose}</p>
                    )}
                    {content.installHint && (
                        <div className="mt-3 flex items-start gap-2">
                            <FaTerminal className="shrink-0 mt-0.5 text-slate-400 text-xs" />
                            <p className="text-xs text-slate-500 font-mono">{content.installHint}</p>
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-bold text-slate-700 mb-3">Referência de campos de saída</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="text-left px-3 py-2 font-semibold text-slate-600 border border-slate-200">Campo</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-600 border border-slate-200">Significado</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-600 border border-slate-200">Faixa normal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content.outputFields.map((f, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-3 py-1.5 border border-slate-200 font-mono text-blue-700 whitespace-nowrap">{f.field}</td>
                                        <td className="px-3 py-1.5 border border-slate-200 text-slate-600">{f.meaning}</td>
                                        <td className="px-3 py-1.5 border border-slate-200 text-slate-500">{f.normalRange}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Common pitfalls */}
            {content?.commonPitfalls?.length > 0 && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                    <p className="text-sm font-bold text-amber-800 mb-3">Erros comuns a evitar</p>
                    <ul className="space-y-2">
                        {content.commonPitfalls.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                                <FaExclamationTriangle className="shrink-0 mt-0.5 text-amber-500 text-xs" />
                                <span className="leading-relaxed">{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
