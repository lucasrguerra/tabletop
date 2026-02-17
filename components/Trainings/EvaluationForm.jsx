'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaPaperPlane, FaCheckCircle, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const DIFFICULTY_LABELS = ['', 'Muito Fácil', 'Fácil', 'Moderado', 'Difícil', 'Muito Difícil'];

function StarRating({ value, onChange, disabled }) {
	const [hover, setHover] = useState(0);

	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map(star => {
				const active = star <= (hover || value);
				return (
					<button
						key={star}
						type="button"
						disabled={disabled}
						onClick={() => onChange(star)}
						onMouseEnter={() => !disabled && setHover(star)}
						onMouseLeave={() => setHover(0)}
						className={`text-2xl transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'} ${active ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
						aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
					>
						{active ? <FaStar /> : <FaRegStar />}
					</button>
				);
			})}
		</div>
	);
}

/**
 * EvaluationForm - Post-training evaluation form for participants.
 * Shows a submitted state if the user has already evaluated.
 *
 * @param {string} trainingId - Training ID
 * @param {Object|null} existingEvaluation - Existing evaluation if already submitted
 * @param {Function} onSubmitted - Callback after successful submission
 */
export default function EvaluationForm({ trainingId, existingEvaluation, onSubmitted }) {
	const [overallRating, setOverallRating] = useState(0);
	const [scenarioRating, setScenarioRating] = useState(0);
	const [difficultyRating, setDifficultyRating] = useState(0);
	const [wouldRecommend, setWouldRecommend] = useState(null);
	const [comment, setComment] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [submitted, setSubmitted] = useState(!!existingEvaluation);
	const [csrfToken, setCsrfToken] = useState(null);

	// Fetch CSRF token on mount
	useEffect(() => {
		if (existingEvaluation) return;
		const fetchToken = async () => {
			try {
				const res = await fetch('/api/csrf');
				const data = await res.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Error fetching CSRF token:', err);
			}
		};
		fetchToken();
	}, [existingEvaluation]);

	// Already submitted view
	if (submitted || existingEvaluation) {
		const eval_ = existingEvaluation || {};
		return (
			<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-2.5 rounded-xl bg-emerald-100">
						<FaCheckCircle className="text-xl text-emerald-600" />
					</div>
					<div>
						<h4 className="text-lg font-bold text-slate-900">Avaliação Enviada</h4>
						<p className="text-sm text-slate-500">Obrigado pelo seu feedback!</p>
					</div>
				</div>

				{eval_.overall_rating && (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
						<div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
							<p className="text-xs font-semibold text-amber-700 uppercase mb-1">Geral</p>
							<div className="flex justify-center gap-0.5">
								{[1, 2, 3, 4, 5].map(s => (
									<FaStar key={s} className={`text-sm ${s <= eval_.overall_rating ? 'text-amber-400' : 'text-slate-200'}`} />
								))}
							</div>
						</div>
						<div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
							<p className="text-xs font-semibold text-blue-700 uppercase mb-1">Cenário</p>
							<div className="flex justify-center gap-0.5">
								{[1, 2, 3, 4, 5].map(s => (
									<FaStar key={s} className={`text-sm ${s <= eval_.scenario_rating ? 'text-amber-400' : 'text-slate-200'}`} />
								))}
							</div>
						</div>
						<div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
							<p className="text-xs font-semibold text-purple-700 uppercase mb-1">Dificuldade</p>
							<p className="text-sm font-medium text-slate-700">{DIFFICULTY_LABELS[eval_.difficulty_rating] || '—'}</p>
						</div>
					</div>
				)}
			</div>
		);
	}

	const canSubmit = overallRating > 0 && scenarioRating > 0 && difficultyRating > 0 && wouldRecommend !== null && !submitting && !!csrfToken;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!canSubmit) return;

		setSubmitting(true);
		setError(null);

		try {
			const response = await fetch(`/api/trainings/${trainingId}/evaluations`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify({
					overall_rating: overallRating,
					scenario_rating: scenarioRating,
					difficulty_rating: difficultyRating,
					would_recommend: wouldRecommend,
					comment: comment.trim(),
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Erro ao enviar avaliação');
			}

			setSubmitted(true);
			onSubmitted?.(data.evaluation);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6">
			<div className="flex items-center gap-3 mb-5">
				<div className="p-2.5 rounded-xl bg-amber-100">
					<FaStar className="text-xl text-amber-600" />
				</div>
				<div>
					<h4 className="text-lg font-bold text-slate-900">Avaliar Treinamento</h4>
					<p className="text-sm text-slate-500">Sua avaliação é opcional, mas nos ajuda a melhorar!</p>
				</div>
			</div>

			<div className="space-y-5">
				{/* Overall Rating */}
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-2">
						Avaliação Geral <span className="text-red-400">*</span>
					</label>
					<StarRating value={overallRating} onChange={setOverallRating} disabled={submitting} />
				</div>

				{/* Scenario Rating */}
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-2">
						Qualidade do Cenário <span className="text-red-400">*</span>
					</label>
					<StarRating value={scenarioRating} onChange={setScenarioRating} disabled={submitting} />
				</div>

				{/* Difficulty Rating */}
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-2">
						Nível de Dificuldade <span className="text-red-400">*</span>
					</label>
					<div className="flex flex-wrap gap-2">
						{[1, 2, 3, 4, 5].map(level => (
							<button
								key={level}
								type="button"
								disabled={submitting}
								onClick={() => setDifficultyRating(level)}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
									difficultyRating === level
										? 'bg-purple-100 border-purple-300 text-purple-700'
										: 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50'
								} ${submitting ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
							>
								{DIFFICULTY_LABELS[level]}
							</button>
						))}
					</div>
				</div>

				{/* Would Recommend */}
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-2">
						Recomendaria este treinamento? <span className="text-red-400">*</span>
					</label>
					<div className="flex gap-3">
						<button
							type="button"
							disabled={submitting}
							onClick={() => setWouldRecommend(true)}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
								wouldRecommend === true
									? 'bg-emerald-100 border-emerald-300 text-emerald-700'
									: 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
							} ${submitting ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
						>
							<FaThumbsUp className="text-xs" />
							Sim
						</button>
						<button
							type="button"
							disabled={submitting}
							onClick={() => setWouldRecommend(false)}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
								wouldRecommend === false
									? 'bg-red-100 border-red-300 text-red-700'
									: 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50'
							} ${submitting ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
						>
							<FaThumbsDown className="text-xs" />
							Não
						</button>
					</div>
				</div>

				{/* Comment */}
				<div>
					<label htmlFor="eval-comment" className="block text-sm font-semibold text-slate-700 mb-2">
						Comentário <span className="text-slate-400 font-normal">(opcional)</span>
					</label>
					<textarea
						id="eval-comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						disabled={submitting}
						maxLength={1000}
						rows={3}
						placeholder="Compartilhe sua experiência, sugestões de melhoria..."
						className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none disabled:opacity-50"
					/>
					<p className="text-xs text-slate-400 mt-1 text-right">{comment.length}/1000</p>
				</div>

				{error && (
					<div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
						{error}
					</div>
				)}

				{/* Submit */}
				<button
					type="submit"
					disabled={!canSubmit}
					className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
				>
					<FaPaperPlane className="text-xs" />
					{submitting ? 'Enviando...' : 'Enviar Avaliação'}
				</button>
			</div>
		</form>
	);
}
