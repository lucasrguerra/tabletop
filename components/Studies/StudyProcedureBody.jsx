"use client";

import { FaExclamationTriangle, FaCheckCircle, FaTerminal, FaArrowCircleUp } from 'react-icons/fa';

const CATEGORY_GRADIENTS = {
    GOV_LEGAL: 'from-purple-500 to-pink-600',
    NET_ROUT:  'from-blue-500 to-cyan-600',
    NET_VOL:   'from-red-500 to-orange-600',
    PHY_L2:    'from-green-500 to-teal-600',
    SCI_DATA:  'from-indigo-500 to-purple-600',
    SEC_SYS:   'from-rose-500 to-red-600'
};

function StepCommands({ commands }) {
    if (!commands?.length) return null;

    return (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-4 py-1.5 flex items-center gap-2">
                <FaTerminal className="text-xs text-slate-400" />
                <span className="text-xs text-slate-400 font-mono">Comandos</span>
            </div>
            <pre className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 overflow-x-auto leading-relaxed whitespace-pre">
                {commands.join('\n\n')}
            </pre>
        </div>
    );
}

/**
 * StudyProcedureBody — renders PROCEDIMENTO article content
 * Numbered steps with gradient circles, commands, expected results and warnings
 */
export default function StudyProcedureBody({ content, categoryId }) {
    const steps = content?.steps || [];
    const gradient = CATEGORY_GRADIENTS[categoryId] || 'from-blue-500 to-indigo-600';

    return (
        <div className="space-y-4">
            {/* Context */}
            {content?.context && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Contexto de uso</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{content.context}</p>
                </div>
            )}

            {/* Steps */}
            {steps.map((step, i) => (
                <div key={step.id || i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Step header */}
                    <div className="flex items-start gap-4 p-5">
                        <div className={`shrink-0 w-9 h-9 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                            <span className="text-white text-sm font-bold">{step.id || i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h3>
                            {step.description && (
                                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Commands */}
                    {step.commands?.length > 0 && (
                        <div className="px-5 pb-4">
                            <StepCommands commands={step.commands} />
                        </div>
                    )}

                    {/* Expected result + warnings */}
                    {(step.expectedResult || step.warnings?.length > 0 || step.rollbackAction) && (
                        <div className="px-5 pb-5 space-y-3">
                            {step.expectedResult && (
                                <div className="flex gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <FaCheckCircle className="shrink-0 mt-0.5 text-emerald-500 text-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-emerald-700 mb-0.5">Resultado esperado</p>
                                        <p className="text-xs text-emerald-800 leading-relaxed">{step.expectedResult}</p>
                                    </div>
                                </div>
                            )}

                            {step.warnings?.map((w, wi) => (
                                <div key={wi} className="flex gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <FaExclamationTriangle className="shrink-0 mt-0.5 text-amber-500 text-sm" />
                                    <p className="text-xs text-amber-800 leading-relaxed">{w}</p>
                                </div>
                            ))}

                            {step.rollbackAction && (
                                <div className="flex gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <FaArrowCircleUp className="shrink-0 mt-0.5 text-slate-400 text-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-600 mb-0.5">Rollback</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{step.rollbackAction}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Post conditions */}
            {content?.postConditions?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="text-sm font-bold text-slate-700 mb-3">Pós-condições (critérios de conclusão)</p>
                    <ul className="space-y-2">
                        {content.postConditions.map((pc, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <FaCheckCircle className="shrink-0 mt-0.5 text-emerald-400 text-xs" />
                                <span>{pc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Escalation criteria */}
            {content?.escalationCriteria?.length > 0 && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                    <p className="text-sm font-bold text-red-700 mb-3">Critérios de escalada</p>
                    <ul className="space-y-2">
                        {content.escalationCriteria.map((ec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                <FaExclamationTriangle className="shrink-0 mt-0.5 text-red-400 text-xs" />
                                <span>{ec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
