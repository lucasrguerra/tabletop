'use client';

import { useState } from 'react';
import { FaBookOpen, FaChevronDown, FaChevronUp, FaExclamationCircle, FaTools, FaCommentDots, FaBullseye, FaClipboardCheck } from 'react-icons/fa';

/**
 * BaseScenarioDisplay
 * Shows the full scenario context: objectives, scope, base scenario (context,
 * initial situation, initial complaints, available resources).
 *
 * @param {Object} scenario - Full scenario object (with baseScenario, objectives, scope, metadata)
 */
export default function BaseScenarioDisplay({ scenario }) {
	const [expandedSections, setExpandedSections] = useState({
		objectives: false,
		scope: false,
		context: true,
		situation: true,
		complaints: false,
		resources: false,
	});

	if (!scenario) return null;

	const toggle = (section) => {
		setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
	};

	const base = scenario.baseScenario;

	const sections = [
		{
			id: 'objectives',
			title: 'Objetivos',
			icon: FaBullseye,
			color: 'text-blue-600 bg-blue-100',
			content: scenario.objectives && (
				<ul className="space-y-1.5">
					{scenario.objectives.map((obj, i) => (
						<li key={i} className="flex items-start gap-2 text-sm text-slate-700">
							<span className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
								{i + 1}
							</span>
							<span className="leading-relaxed">{obj}</span>
						</li>
					))}
				</ul>
			),
		},
		{
			id: 'scope',
			title: 'Escopo e Limitações',
			icon: FaClipboardCheck,
			color: 'text-slate-600 bg-slate-100',
			content: scenario.scope && (
				<ul className="space-y-1.5">
					{scenario.scope.map((item, i) => (
						<li key={i} className="flex items-start gap-2 text-sm text-slate-700">
							<span className="text-slate-400 mt-0.5">•</span>
							<span className="leading-relaxed">{item}</span>
						</li>
					))}
				</ul>
			),
		},
		{
			id: 'context',
			title: 'Contexto do Cenário',
			icon: FaBookOpen,
			color: 'text-indigo-600 bg-indigo-100',
			content: base?.context && (
				<p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{base.context}</p>
			),
		},
		{
			id: 'situation',
			title: 'Situação Inicial',
			icon: FaExclamationCircle,
			color: 'text-red-600 bg-red-100',
			content: base?.initialSituation && (
				<div className="space-y-1">
					{Object.entries(base.initialSituation).map(([key, value]) => {
						const label = key
							.replace(/([A-Z])/g, ' $1')
							.replace(/_/g, ' ')
							.replace(/^\w/, c => c.toUpperCase())
							.trim();
						return (
							<div key={key} className="flex justify-between items-start py-1.5 border-b border-slate-100 last:border-0">
								<span className="text-xs text-slate-500 shrink-0 mr-4">{label}</span>
								<span className="text-xs font-mono font-medium text-slate-800 text-right">{String(value)}</span>
							</div>
						);
					})}
				</div>
			),
		},
		{
			id: 'complaints',
			title: 'Reclamações Iniciais',
			icon: FaCommentDots,
			color: 'text-amber-600 bg-amber-100',
			content: base?.initialComplaints && (
				<ul className="space-y-1.5">
					{base.initialComplaints.map((c, i) => (
						<li key={i} className="flex items-start gap-2 text-sm text-slate-700">
							<span className="text-amber-400 mt-0.5">•</span>
							<span className="leading-relaxed">{c}</span>
						</li>
					))}
				</ul>
			),
		},
		{
			id: 'resources',
			title: 'Recursos Disponíveis',
			icon: FaTools,
			color: 'text-emerald-600 bg-emerald-100',
			content: base?.availableResources && (
				<ul className="space-y-1.5">
					{base.availableResources.map((r, i) => (
						<li key={i} className="flex items-start gap-2 text-sm text-slate-700">
							<span className="text-emerald-400 mt-0.5">✓</span>
							<span className="leading-relaxed">{r}</span>
						</li>
					))}
				</ul>
			),
		},
	];

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-2">
				<div className="p-2.5 bg-indigo-100 rounded-xl">
					<FaBookOpen className="text-xl text-indigo-600" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						{scenario.title}
					</h3>
					<p className="text-xs text-slate-500">
						{scenario.description}
					</p>
				</div>
			</div>

			{/* Metadata pills */}
			{scenario.metadata && (
				<div className="flex flex-wrap gap-2 mb-6 mt-3">
					{scenario.metadata.difficulty && (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
							{scenario.metadata.difficulty}
						</span>
					)}
					{scenario.metadata.estimatedDuration && (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
							⏱ {scenario.metadata.estimatedDuration}
						</span>
					)}
					{scenario.metadata.targetAudience && (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 max-w-xs truncate">
							🎯 {scenario.metadata.targetAudience}
						</span>
					)}
				</div>
			)}

			{/* Collapsible sections */}
			<div className="space-y-2">
				{sections.map(({ id, title, icon: Icon, color, content }) => {
					if (!content) return null;
					const isOpen = expandedSections[id];
					return (
						<div key={id} className="rounded-xl border border-slate-100 overflow-hidden">
							<button
								onClick={() => toggle(id)}
								className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
							>
								<div className={`p-1.5 rounded-lg ${color}`}>
									<Icon className="text-xs" />
								</div>
								<span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
								{isOpen
									? <FaChevronUp className="text-slate-400 text-xs" />
									: <FaChevronDown className="text-slate-400 text-xs" />
								}
							</button>
							{isOpen && (
								<div className="px-4 pb-4 pt-1">
									{content}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
