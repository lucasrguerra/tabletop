'use client';

import { useState } from 'react';
import {
	FaQuestionCircle, FaCheckCircle, FaListOl, FaExchangeAlt, FaSortNumericDown,
	FaChevronDown, FaCheck, FaTimes, FaUsers, FaUserCheck, FaHashtag, FaClock
} from 'react-icons/fa';

const TYPE_CONFIG = {
	'multiple-choice': { label: 'Múltipla Escolha', icon: FaCheckCircle, color: 'bg-blue-100 text-blue-700' },
	'true-false': { label: 'Verdadeiro ou Falso', icon: FaQuestionCircle, color: 'bg-teal-100 text-teal-700' },
	'numeric': { label: 'Numérica', icon: FaSortNumericDown, color: 'bg-orange-100 text-orange-700' },
	'matching': { label: 'Correspondência', icon: FaExchangeAlt, color: 'bg-purple-100 text-purple-700' },
	'ordering': { label: 'Ordenação', icon: FaListOl, color: 'bg-indigo-100 text-indigo-700' },
};

function QuestionTypeBadge({ type }) {
	const config = TYPE_CONFIG[type] || TYPE_CONFIG['multiple-choice'];
	const Icon = config.icon;
	return (
		<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
			<Icon className="text-xs" />
			{config.label}
		</span>
	);
}

/**
 * Formats the correct answer for display based on question type.
 */
function CorrectAnswerDisplay({ question }) {
	const type = question.type || 'multiple-choice';

	if (type === 'multiple-choice' && question.options) {
		const idx = question.correctAnswer;
		return (
			<div className="space-y-1.5">
				{question.options.map((opt, i) => (
					<div
						key={i}
						className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm ${
							i === idx
								? 'bg-emerald-50 border border-emerald-200 font-medium text-emerald-800'
								: 'text-slate-500'
						}`}
					>
						<span className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
							i === idx ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
						}`}>
							{String.fromCharCode(65 + i)}
						</span>
						<span className="pt-0.5">{opt}</span>
						{i === idx && <FaCheck className="text-emerald-600 shrink-0 mt-1 ml-auto" />}
					</div>
				))}
			</div>
		);
	}

	if (type === 'true-false') {
		return (
			<div className="flex items-center gap-2">
				<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
					question.correctAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
				}`}>
					{question.correctAnswer ? <FaCheck /> : <FaTimes />}
					{question.correctAnswer ? 'Verdadeiro' : 'Falso'}
				</span>
			</div>
		);
	}

	if (type === 'numeric') {
		return (
			<div className="flex items-center gap-2">
				<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-orange-100 text-orange-700">
					<FaHashtag className="text-xs" />
					{question.correctAnswer}
					{question.unit && <span className="text-orange-500 font-normal ml-0.5">{question.unit}</span>}
				</span>
				{question.tolerance > 0 && (
					<span className="text-xs text-slate-500">(±{question.tolerance})</span>
				)}
			</div>
		);
	}

	if (type === 'matching' && question.correctMatches) {
		const leftItems = question.leftColumn?.items || question.leftColumn || [];
		const rightItems = question.rightColumn?.items || question.rightColumn || [];
		const rightMap = {};
		for (const item of rightItems) {
			rightMap[item.id] = item.content || item.label;
		}
		return (
			<div className="space-y-1.5">
				{question.correctMatches.map((match, i) => {
					const leftItem = leftItems.find(l => l.id === match.left);
					return (
						<div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100 text-sm">
							<span className="font-medium text-purple-700">{leftItem?.content || leftItem?.label || match.left}</span>
							<span className="text-purple-400">→</span>
							<span className="text-purple-600">{rightMap[match.right] || match.right}</span>
						</div>
					);
				})}
			</div>
		);
	}

	if (type === 'ordering' && question.correctOrder) {
		const itemMap = {};
		for (const item of (question.items || [])) {
			itemMap[item.id] = item.content || item.label;
		}
		return (
			<div className="space-y-1.5">
				{question.correctOrder.map((itemId, i) => (
					<div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-sm">
						<span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold">
							{i + 1}
						</span>
						<span className="text-indigo-700">{itemMap[itemId] || itemId}</span>
					</div>
				))}
			</div>
		);
	}

	return <span className="text-sm text-slate-500">—</span>;
}

/**
 * Formats a participant's answer for inline display.
 */
function ParticipantAnswerText({ answer, question }) {
	const type = question.type || 'multiple-choice';

	if (type === 'multiple-choice' && question.options && typeof answer === 'number') {
		return <span>{String.fromCharCode(65 + answer)} — {question.options[answer]}</span>;
	}
	if (type === 'true-false' && typeof answer === 'boolean') {
		return <span>{answer ? 'Verdadeiro' : 'Falso'}</span>;
	}
	if (type === 'numeric') {
		return <span>{answer}{question.unit ? ` ${question.unit}` : ''}</span>;
	}
	if (type === 'matching' && Array.isArray(answer)) {
		return <span>{answer.length} correspondências</span>;
	}
	if (type === 'ordering' && Array.isArray(answer)) {
		return <span>{answer.length} itens ordenados</span>;
	}
	return <span>{JSON.stringify(answer)}</span>;
}

/**
 * Shows all participant responses for a single question.
 */
function QuestionResponses({ question, roundIndex, responses, totalParticipants }) {
	const qResponses = responses.filter(
		r => r.round_id === roundIndex && r.question_id === question.id
	);
	const answeredCount = qResponses.length;
	const correctCount = qResponses.filter(r => r.is_correct).length;

	return (
		<div className="mt-4">
			<div className="flex items-center gap-2 mb-3">
				<FaUsers className="text-slate-400 text-sm" />
				<span className="text-sm font-semibold text-slate-700">
					Respostas dos Participantes
				</span>
				<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
					answeredCount === totalParticipants && totalParticipants > 0
						? 'bg-emerald-100 text-emerald-700'
						: 'bg-slate-100 text-slate-600'
				}`}>
					{answeredCount}/{totalParticipants}
				</span>
				{answeredCount > 0 && (
					<span className="text-xs text-slate-500 ml-auto">
						{correctCount}/{answeredCount} corretas ({answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%)
					</span>
				)}
			</div>

			{answeredCount === 0 ? (
				<p className="text-sm text-slate-400 italic pl-6">
					Nenhum participante respondeu ainda
				</p>
			) : (
				<div className="space-y-1.5 max-h-48 overflow-y-auto">
					{qResponses.map((r) => (
						<div
							key={r.id}
							className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border ${
								r.is_correct
									? 'bg-emerald-50/50 border-emerald-100'
									: 'bg-red-50/50 border-red-100'
							}`}
						>
							<div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
								r.is_correct ? 'bg-emerald-500' : 'bg-red-500'
							}`}>
								{r.is_correct
									? <FaCheck className="text-white text-[10px]" />
									: <FaTimes className="text-white text-[10px]" />
								}
							</div>
							<span className="font-medium text-slate-700 min-w-0 truncate">
								{r.user?.nickname || r.user?.name || 'Participante'}
							</span>
							<span className="text-slate-400 mx-1">—</span>
							<span className={`min-w-0 truncate ${r.is_correct ? 'text-emerald-700' : 'text-red-700'}`}>
								<ParticipantAnswerText answer={r.answer} question={question} />
							</span>
							<span className="text-xs text-slate-400 ml-auto shrink-0">
								{r.points_earned}/{r.points_possible} pts
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * A single question card with correct answer, justification, and participant responses.
 */
function QuestionCard({ question, questionIndex, roundIndex, responses, totalParticipants }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="rounded-xl border border-slate-200 overflow-hidden">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
			>
				<span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600">
					{questionIndex + 1}
				</span>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-slate-900 line-clamp-2">{question.text}</p>
				</div>
				<QuestionTypeBadge type={question.type || 'multiple-choice'} />
				<span className="text-xs font-semibold text-slate-400 shrink-0">{question.points} pts</span>
				<FaChevronDown className={`text-slate-400 text-xs shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{isOpen && (
				<div className="px-4 pb-4 space-y-4 border-t border-slate-100">
					{/* Correct answer */}
					<div className="pt-4">
						<p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
							<FaCheckCircle className="text-xs" />
							Resposta Correta
						</p>
						<CorrectAnswerDisplay question={question} />
					</div>

					{/* Justification */}
					{question.justification && (
						<div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
							<p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Justificativa</p>
							<p className="text-sm text-blue-900 leading-relaxed">{question.justification}</p>
						</div>
					)}

					{/* Participant responses */}
					<QuestionResponses
						question={question}
						roundIndex={roundIndex}
						responses={responses}
						totalParticipants={totalParticipants}
					/>
				</div>
			)}
		</div>
	);
}

/**
 * FacilitatorQuestionsView
 * Shows all questions across rounds with correct answers, justifications,
 * and real-time participant response tracking.
 *
 * @param {Array} rounds - Full scenario rounds (with correct answers)
 * @param {number} currentRound - Current round index (0-based)
 * @param {Array} responses - All participant responses (from facilitator GET responses endpoint)
 * @param {number} totalParticipants - Count of accepted participants
 * @param {Object} summary - Response summary statistics
 */
export default function FacilitatorQuestionsView({ rounds, currentRound, responses = [], totalParticipants = 0, summary = null }) {
	const [selectedRound, setSelectedRound] = useState(null);

	if (!rounds || rounds.length === 0) return null;

	// Filter rounds that have questions, show up to current round
	const roundsWithQuestions = rounds
		.map((round, index) => ({ round, index }))
		.filter(({ round, index }) => index <= currentRound && round.questions && round.questions.length > 0);

	if (roundsWithQuestions.length === 0) return null;

	// If no selection, default to current round (or latest with questions)
	const activeRoundIndex = selectedRound !== null ? selectedRound : (
		roundsWithQuestions.find(r => r.index === currentRound)?.index ??
		roundsWithQuestions[roundsWithQuestions.length - 1]?.index
	);

	const activeRound = rounds[activeRoundIndex];
	const activeQuestions = activeRound?.questions || [];

	// Calculate stats for the active round
	const roundResponses = responses.filter(r => r.round_id === activeRoundIndex);
	const totalQuestions = activeQuestions.length;
	const totalPossibleAnswers = totalQuestions * totalParticipants;
	const answeredInRound = roundResponses.length;
	const correctInRound = roundResponses.filter(r => r.is_correct).length;

	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-3 bg-blue-100 rounded-xl">
					<FaQuestionCircle className="text-2xl text-blue-600" />
				</div>
				<div className="flex-1">
					<h3 className="text-xl font-bold text-slate-900">
						Questões e Respostas
					</h3>
					<p className="text-sm text-slate-500 mt-0.5">
						Visão do facilitador — respostas corretas e feedback em tempo real
					</p>
				</div>
			</div>

			{/* Global summary */}
			{summary && summary.total_responses > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
					<div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
						<p className="text-2xl font-bold text-slate-900">{summary.total_responses}</p>
						<p className="text-xs text-slate-500 mt-0.5">Respostas Totais</p>
					</div>
					<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
						<p className="text-2xl font-bold text-emerald-700">{summary.correct_count}</p>
						<p className="text-xs text-emerald-600 mt-0.5">Corretas</p>
					</div>
					<div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
						<p className="text-2xl font-bold text-red-700">{summary.incorrect_count}</p>
						<p className="text-xs text-red-600 mt-0.5">Incorretas</p>
					</div>
					<div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
						<p className="text-2xl font-bold text-blue-700">{summary.percentage}%</p>
						<p className="text-xs text-blue-600 mt-0.5">Aproveitamento</p>
					</div>
				</div>
			)}

			{/* Participant breakdown */}
			{summary?.participants && summary.participants.length > 0 && (
				<div className="mb-6">
					<p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
						<FaUserCheck className="text-slate-400" />
						Desempenho por Participante
					</p>
					<div className="space-y-2 max-h-48 overflow-y-auto">
						{summary.participants.map((p) => (
							<div key={p.user.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
								<span className="text-sm font-medium text-slate-700 flex-1 truncate">
									{p.user.nickname || p.user.name}
								</span>
								<span className="text-xs text-slate-500">
									{p.total_responses} resp.
								</span>
								<span className="text-xs font-medium text-emerald-600">
									{p.correct_count} corretas
								</span>
								<span className="text-xs font-semibold text-blue-600">
									{p.points_earned}/{p.points_possible} pts ({p.percentage}%)
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Round tabs */}
			{roundsWithQuestions.length > 1 && (
				<div className="flex flex-wrap gap-2 mb-6">
					{roundsWithQuestions.map(({ round, index }) => (
						<button
							key={index}
							onClick={() => setSelectedRound(index)}
							className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
								index === activeRoundIndex
									? 'bg-blue-600 text-white shadow-sm'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}`}
						>
							Rodada {index + 1}
							{index === currentRound && (
								<span className="ml-1 text-xs opacity-75">(atual)</span>
							)}
						</button>
					))}
				</div>
			)}

			{/* Round stats bar */}
			<div className="flex items-center justify-between mb-4 px-1">
				<span className="text-sm font-semibold text-slate-700">
					Rodada {activeRoundIndex + 1} — {activeRound?.title}
				</span>
				<span className="text-xs text-slate-500">
					{answeredInRound}/{totalPossibleAnswers} respostas · {correctInRound} corretas
				</span>
			</div>

			{/* Questions list */}
			<div className="space-y-3">
				{activeQuestions.map((question, qi) => (
					<QuestionCard
						key={question.id}
						question={question}
						questionIndex={qi}
						roundIndex={activeRoundIndex}
						responses={responses}
						totalParticipants={totalParticipants}
					/>
				))}
			</div>
		</div>
	);
}
