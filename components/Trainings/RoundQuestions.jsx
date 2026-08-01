'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaQuestionCircle, FaCheckCircle, FaListOl, FaExchangeAlt, FaSortNumericDown, FaChevronLeft, FaChevronRight, FaHashtag, FaArrowsAltV, FaArrowUp, FaArrowDown, FaPaperPlane, FaCheck, FaTimes, FaLock, FaEye } from 'react-icons/fa';
import { questionText } from '@/utils/questions';

const TYPE_CONFIG = {
	'multiple-choice': {
		label: 'Múltipla Escolha',
		icon: FaCheckCircle,
		color: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300',
		description: 'Selecione a alternativa correta',
	},
	'true-false': {
		label: 'Verdadeiro ou Falso',
		icon: FaQuestionCircle,
		color: 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300',
		description: 'Avalie se a afirmação é verdadeira ou falsa',
	},
	'numeric': {
		label: 'Numérica',
		icon: FaSortNumericDown,
		color: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300',
		description: 'Forneça um valor numérico como resposta',
	},
	'matching': {
		label: 'Correspondência',
		icon: FaExchangeAlt,
		color: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300',
		description: 'Associe os itens da coluna esquerda com a direita',
	},
	'ordering': {
		label: 'Ordenação',
		icon: FaListOl,
		color: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300',
		description: 'Ordene os itens na sequência correta',
	},
};

function QuestionTypeBadge({ type }) {
	const config = TYPE_CONFIG[type] || TYPE_CONFIG['multiple-choice'];
	const Icon = config.icon;

	return (
		<span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
			<Icon className="text-sm" />
			{config.label}
		</span>
	);
}

/**
 * Shows the result feedback after a question has been answered.
 */
function AnswerResult({ response }) {
	if (!response) return null;

	return (
		<div className={`mt-4 rounded-xl border-2 ${
			response.is_correct
				? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50'
				: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50'
		}`}>
			<div className="flex items-center gap-2 p-4">
				{response.is_correct ? (
					<FaCheck className="text-emerald-600 dark:text-emerald-400" />
				) : (
					<FaTimes className="text-red-600 dark:text-red-400" />
				)}
				<span className={`font-semibold text-sm ${
					response.is_correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
				}`}>
					{response.is_correct ? 'Resposta correta!' : 'Resposta incorreta'}
				</span>
				<span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
					{response.points_earned}/{response.points_possible} {response.points_possible === 1 ? 'ponto' : 'pontos'}
				</span>
			</div>
			{response.justification && (
				<div className={`px-4 pb-4 pt-2 border-t ${
					response.is_correct ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-red-200 dark:border-red-900/50'
				}`}>
					<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Justificativa</p>
					<p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{response.justification}</p>
				</div>
			)}
		</div>
	);
}

/**
 * Renders a single question with interactive answer controls.
 */
function QuestionDisplay({ question, index, total, selectedAnswer, onAnswerChange, disabled }) {
	const type = question.type || 'multiple-choice';
	const config = TYPE_CONFIG[type] || TYPE_CONFIG['multiple-choice'];

	return (
		<div className="space-y-6">
			{/* Question type & points header */}
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<QuestionTypeBadge type={type} />
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
						{question.points} {question.points === 1 ? 'ponto' : 'pontos'}
					</span>
				</div>
			</div>

			{/* Question text */}
			<div className="p-5 bg-linear-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/60 dark:to-blue-950/20 rounded-2xl border border-slate-200 dark:border-slate-800">
				<p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed break-words whitespace-pre-line">
					{questionText(question)}
				</p>
			</div>

			{/* Instruction hint */}
			<p className="text-sm text-slate-500 dark:text-slate-400 italic">
				{config.description}
			</p>

			{/* Type-specific interactive display */}
			{type === 'multiple-choice' && question.options && (
				<div className="space-y-3">
					{question.options.map((opt, i) => {
						const isSelected = selectedAnswer === i;
						return (
							<button
								key={i}
								type="button"
								onClick={() => !disabled && onAnswerChange(i)}
								disabled={disabled}
								className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
									disabled
										? 'cursor-not-allowed opacity-70 bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
										: isSelected
											? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500 shadow-sm shadow-blue-100 dark:shadow-blue-950/50'
											: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer'
								}`}
							>
								<span className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
									isSelected
										? 'bg-blue-600 border-blue-600 text-white'
										: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
								}`}>
									{String.fromCharCode(65 + i)}
								</span>
								<span className="text-base text-slate-700 dark:text-slate-200 leading-relaxed pt-1.5">{opt}</span>
							</button>
						);
					})}
				</div>
			)}

			{type === 'true-false' && (
				<div className="grid grid-cols-2 gap-4">
					<button
						type="button"
						onClick={() => !disabled && onAnswerChange(true)}
						disabled={disabled}
						className={`p-5 rounded-xl border-2 transition-all text-center ${
							disabled
								? 'cursor-not-allowed opacity-70 bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
								: selectedAnswer === true
									? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-500 shadow-sm shadow-emerald-100 dark:shadow-emerald-950/50'
									: 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer'
						}`}
					>
						<div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
							selectedAnswer === true ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-emerald-50 dark:bg-emerald-950/60'
						}`}>
							<FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-lg" />
						</div>
						<span className="text-base font-semibold text-slate-800 dark:text-slate-200">Verdadeiro</span>
					</button>
					<button
						type="button"
						onClick={() => !disabled && onAnswerChange(false)}
						disabled={disabled}
						className={`p-5 rounded-xl border-2 transition-all text-center ${
							disabled
								? 'cursor-not-allowed opacity-70 bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
								: selectedAnswer === false
									? 'bg-red-50 dark:bg-red-950/50 border-red-400 dark:border-red-500 shadow-sm shadow-red-100 dark:shadow-red-950/50'
									: 'bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-700 cursor-pointer'
						}`}
					>
						<div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
							selectedAnswer === false ? 'bg-red-200 dark:bg-red-900' : 'bg-red-50 dark:bg-red-950/60'
						}`}>
							<span className="text-red-500 dark:text-red-400 text-lg font-bold">✕</span>
						</div>
						<span className="text-base font-semibold text-slate-800 dark:text-slate-200">Falso</span>
					</button>
				</div>
			)}

			{type === 'numeric' && (
				<div className="p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-orange-950/40">
					<div className="flex items-center gap-2 mb-3">
						<FaHashtag className="text-orange-400" />
						<span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Resposta Numérica</span>
					</div>
					<div className="flex items-center gap-3">
						<input
							type="number"
							value={selectedAnswer ?? ''}
							onChange={(e) => {
								const val = e.target.value;
								onAnswerChange(val === '' ? null : Number(val));
							}}
							disabled={disabled}
							placeholder="Digite o valor..."
							className="flex-1 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-4 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/40 disabled:opacity-70 disabled:cursor-not-allowed"
						/>
						{question.unit && (
							<span className="text-base font-bold text-slate-600 dark:text-slate-300 bg-orange-50 dark:bg-orange-950/60 px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-900/50">
								{question.unit}
							</span>
						)}
					</div>
				</div>
			)}

			{type === 'matching' && (
				<MatchingInput
					question={question}
					selectedAnswer={selectedAnswer}
					onAnswerChange={onAnswerChange}
					disabled={disabled}
				/>
			)}

			{type === 'ordering' && question.items && (
				<OrderingInput
					question={question}
					selectedAnswer={selectedAnswer}
					onAnswerChange={onAnswerChange}
					disabled={disabled}
				/>
			)}
		</div>
	);
}

/**
 * Interactive matching question: each left item has a dropdown to pick a right item.
 */
function MatchingInput({ question, selectedAnswer, onAnswerChange, disabled }) {
	const leftItems = question.leftColumn?.items || question.leftColumn || [];
	const rightItems = question.rightColumn?.items || question.rightColumn || [];

	// selectedAnswer is an array of { left, right } pairs
	const matches = selectedAnswer || [];

	const handleSelect = (leftId, rightId) => {
		const updated = leftItems.map(item => {
			const existing = matches.find(m => m.left === item.id);
			if (item.id === leftId) {
				return { left: leftId, right: rightId };
			}
			return existing || { left: item.id, right: '' };
		});
		onAnswerChange(updated);
	};

	const getSelectedRight = (leftId) => {
		const match = matches.find(m => m.left === leftId);
		return match?.right || '';
	};

	return (
		<div className="space-y-5">
			{/* Right column reference */}
			<div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50">
				<div className="flex items-center gap-2 mb-4">
					<span className="w-3 h-3 rounded-full bg-indigo-400" />
					<p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
						{question.rightColumn?.title || 'Coluna B'} — Opções
					</p>
				</div>
				<div className="space-y-3">
					{rightItems.map((item, i) => (
						<div key={item.id} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
							<span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900 text-xs font-bold text-indigo-600 dark:text-indigo-300">
								{String.fromCharCode(65 + i)}
							</span>
							<span className="leading-relaxed pt-0.5">{item.content || item.label}</span>
						</div>
					))}
				</div>
			</div>

			{/* Left column with dropdowns */}
			<div className="space-y-3">
				<div className="flex items-center gap-2 mb-1">
					<span className="w-3 h-3 rounded-full bg-purple-400" />
					<p className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
						{question.leftColumn?.title || 'Coluna A'} — Selecione a correspondência
					</p>
				</div>
				{leftItems.map((item, i) => (
					<div key={item.id} className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border-2 border-purple-100 dark:border-purple-900/50 space-y-3">
						<div className="flex items-start gap-3">
							<span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900 text-xs font-bold text-purple-600 dark:text-purple-300">
								{i + 1}
							</span>
							<span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.content || item.label}</span>
						</div>
						<select
							value={getSelectedRight(item.id)}
							onChange={(e) => handleSelect(item.id, e.target.value)}
							disabled={disabled}
							className="w-full px-4 py-2.5 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
						>
							<option value="" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-white">Selecione...</option>
							{rightItems.map((rItem, ri) => (
								<option key={rItem.id} value={rItem.id} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-white">
									{String.fromCharCode(65 + ri)} — {rItem.content || rItem.label}
								</option>
							))}
						</select>
					</div>
				))}
			</div>
			{question.partialCredit && (
				<p className="text-xs text-slate-500 dark:text-slate-400 text-center">
					Crédito parcial: {question.pointsPerMatch} {question.pointsPerMatch === 1 ? 'ponto' : 'pontos'} por correspondência correta
				</p>
			)}
		</div>
	);
}

/**
 * Interactive ordering question: up/down buttons to reorder items.
 */
function OrderingInput({ question, selectedAnswer, onAnswerChange, disabled }) {
	// selectedAnswer is an array of item IDs in the user's order
	const items = question.items || [];
	const order = selectedAnswer || items.map(item => item.id);

	const itemMap = {};
	for (const item of items) {
		itemMap[item.id] = item;
	}

	const moveItem = (index, direction) => {
		const newOrder = [...order];
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= newOrder.length) return;
		[newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
		onAnswerChange(newOrder);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 mb-1">
				<FaArrowsAltV className="text-indigo-400" />
				<p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Use as setas para ordenar os itens:</p>
			</div>
			{order.map((itemId, i) => {
				const item = itemMap[itemId];
				if (!item) return null;
				return (
					<div key={itemId} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/50">
						<span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-sm font-bold text-indigo-600 dark:text-indigo-300">
							{i + 1}
						</span>
						<span className="text-base text-slate-700 dark:text-slate-200 leading-relaxed flex-1">{item.content || item.label}</span>
						<div className="flex flex-col gap-1">
							<button
								type="button"
								onClick={() => moveItem(i, -1)}
								disabled={disabled || i === 0}
								className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								aria-label="Mover para cima"
							>
								<FaArrowUp className="text-xs" />
							</button>
							<button
								type="button"
								onClick={() => moveItem(i, 1)}
								disabled={disabled || i === order.length - 1}
								className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								aria-label="Mover para baixo"
							>
								<FaArrowDown className="text-xs" />
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/**
 * Checks if an answer is valid for submission based on question type.
 */
function isAnswerReady(question, answer) {
	const type = question.type || 'multiple-choice';

	switch (type) {
		case 'multiple-choice':
			return typeof answer === 'number' && answer >= 0;
		case 'true-false':
			return typeof answer === 'boolean';
		case 'numeric':
			return typeof answer === 'number' && isFinite(answer);
		case 'matching': {
			if (!Array.isArray(answer)) return false;
			const leftItems = question.leftColumn?.items || question.leftColumn || [];
			return answer.length === leftItems.length && answer.every(m => m.left && m.right);
		}
		case 'ordering':
			return Array.isArray(answer) && answer.length > 0;
		default:
			return answer !== null && answer !== undefined;
	}
}

/**
 * RoundQuestions
 * Displays questions one at a time with interactive answer controls.
 *
 * @param {Array} questions - Sanitized question array (no answers)
 * @param {number} roundIndex - 0-based round index
 * @param {string} roundTitle - Title of the round
 * @param {Function} onSubmitAnswer - Callback(roundIndex, questionId, answer) => Promise
 * @param {Array} responses - User's existing responses for this round
 * @param {boolean} submitting - Whether a submission is in progress
 * @param {boolean} canAnswer - Whether the user can currently answer (training active + participant role)
 * @param {boolean} readOnly - Whether to show in read-only mode (e.g., for observers). Hides submit controls.
 */
export default function RoundQuestions({ questions, roundIndex, roundTitle, onSubmitAnswer, responses = [], submitting = false, canAnswer = false, readOnly = false }) {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [submitError, setSubmitError] = useState(null);

	// Reset to first question and clear selections when round changes
	useEffect(() => {
		setCurrentQuestion(0);
		setSelectedAnswers({});
		setSubmitError(null);
	}, [roundIndex]);

	// Initialize ordering answers with shuffled item order
	useEffect(() => {
		if (!questions) return;
		const inits = {};
		for (const q of questions) {
			if ((q.type === 'ordering') && q.items && !selectedAnswers[q.id] && !getResponse(q.id)) {
				const ids = q.items.map(item => item.id);
				// Fisher-Yates shuffle to avoid presenting correct order
				for (let i = ids.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[ids[i], ids[j]] = [ids[j], ids[i]];
				}
				inits[q.id] = ids;
			}
		}
		if (Object.keys(inits).length > 0) {
			setSelectedAnswers(prev => ({ ...prev, ...inits }));
		}
	}, [questions, roundIndex]);

	const getResponse = useCallback((questionId) => {
		return responses.find(r => r.question_id === questionId);
	}, [responses]);

	const handleAnswerChange = useCallback((questionId, answer) => {
		setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
		setSubmitError(null);
	}, []);

	const handleSubmit = async (questionId) => {
		if (!onSubmitAnswer) return;
		setSubmitError(null);
		const answer = selectedAnswers[questionId];
		try {
			await onSubmitAnswer(roundIndex, questionId, answer);
		} catch (err) {
			setSubmitError(err.message || 'Erro ao enviar resposta');
		}
	};

	if (!questions || questions.length === 0) return null;

	const question = questions[currentQuestion];
	const canPrevious = currentQuestion > 0;
	const canNext = currentQuestion < questions.length - 1;
	const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
	const answeredCount = questions.filter(q => getResponse(q.id)).length;

	const currentResponse = getResponse(question.id);
	const isAnswered = !!currentResponse;
	const currentAnswer = selectedAnswers[question.id];
	const readyToSubmit = !isAnswered && canAnswer && isAnswerReady(question, currentAnswer);

	return (
		<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-xl">
					<FaQuestionCircle className="text-2xl text-blue-600 dark:text-blue-400" />
				</div>
				<div className="flex-1">
					<h3 className="text-xl font-bold text-slate-900 dark:text-white">
						Questões — Rodada {roundIndex + 1}
					</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
						{roundTitle} &middot; {questions.length} {questions.length === 1 ? 'questão' : 'questões'} &middot; {totalPoints} pontos
						{answeredCount > 0 && (
							<span className="text-emerald-600 dark:text-emerald-400 ml-2">
								({answeredCount}/{questions.length} respondidas)
							</span>
						)}
					</p>
				</div>
			</div>

			{/* Question progress bar */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
						Questão {currentQuestion + 1} de {questions.length}
					</span>
					<span className="text-sm font-medium text-blue-600 dark:text-blue-400">
						{Math.round(((currentQuestion + 1) / questions.length) * 100)}%
					</span>
				</div>
				<div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
					<div
						className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out rounded-full"
						style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
					/>
				</div>
				{/* Dot indicators - green for answered */}
				<div className="flex items-center justify-center gap-1.5 mt-3">
					{questions.map((q, i) => {
						const answered = !!getResponse(q.id);
						return (
							<button
								key={i}
								onClick={() => setCurrentQuestion(i)}
								className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
									i === currentQuestion
										? answered ? 'bg-emerald-600 dark:bg-emerald-400 scale-125' : 'bg-blue-600 dark:bg-blue-400 scale-125'
										: answered
											? 'bg-emerald-400 dark:bg-emerald-600 hover:bg-emerald-500'
											: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
								}`}
								aria-label={`Ir para questão ${i + 1}${answered ? ' (respondida)' : ''}`}
							/>
						);
					})}
				</div>
			</div>

			{/* Current question display */}
			<QuestionDisplay
				question={question}
				index={currentQuestion}
				total={questions.length}
				selectedAnswer={isAnswered ? currentResponse.answer : currentAnswer}
				onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
				disabled={isAnswered || !canAnswer}
			/>

			{/* Answer result feedback */}
			{isAnswered && <AnswerResult response={currentResponse} />}

			{/* Submit button & status */}
			{!readOnly && (
				<div className="mt-6">
					{!canAnswer && !isAnswered && (
						<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
							<FaLock className="text-slate-400 dark:text-slate-500" />
							O treinamento precisa estar ativo para responder
						</div>
					)}

					{canAnswer && !isAnswered && (
						<button
							type="button"
							onClick={() => handleSubmit(question.id)}
							disabled={!readyToSubmit || submitting}
							className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
						>
							{submitting ? (
								<>
									<span className="w-4 h-4 border-2 border-white/30 dark:border-slate-700/30 border-t-white rounded-full animate-spin" />
									Enviando...
								</>
							) : (
								<>
									<FaPaperPlane className="text-xs" />
									Enviar Resposta
								</>
							)}
						</button>
					)}

					{submitError && (
						<p className="mt-2 text-sm text-red-600 dark:text-red-400">{submitError}</p>
					)}
				</div>
			)}

			{readOnly && (
				<div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
					<FaEye className="text-slate-400 dark:text-slate-500" />
					Modo de visualização — observadores não podem responder questões
				</div>
			)}

			{/* Navigation controls */}
			<div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
				<button
					onClick={() => setCurrentQuestion(prev => prev - 1)}
					disabled={!canPrevious}
					className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
				>
					<FaChevronLeft className="text-xs" />
					Anterior
				</button>

				<span className="text-sm font-medium text-slate-500 dark:text-slate-400">
					{currentQuestion + 1} / {questions.length}
				</span>

				<button
					onClick={() => setCurrentQuestion(prev => prev + 1)}
					disabled={!canNext}
					className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 disabled:opacity-30 disabled:cursor-not-allowed"
				>
					Próxima
					<FaChevronRight className="text-xs" />
				</button>
			</div>
		</div>
	);
}
