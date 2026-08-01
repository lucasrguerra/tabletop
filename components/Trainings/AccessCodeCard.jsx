import { useState } from 'react';
import { FaKey, FaEye, FaEyeSlash, FaCopy, FaCheckCircle } from 'react-icons/fa';

export default function AccessCodeCard({ accessCode, accessType }) {
	const [isVisible, setIsVisible] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(accessCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	// If training is open access, show different message
	if (accessType === 'open') {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 p-6 lg:p-8">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl">
						<FaKey className="text-xl text-emerald-600 dark:text-emerald-400" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
							Acesso ao Treinamento
						</h3>
					</div>
				</div>

				<div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
					<p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
						Este treinamento está configurado como <span className="font-bold">acesso aberto</span>.
					</p>
					<p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
						Qualquer usuário pode ingressar sem necessidade de código.
					</p>
				</div>
			</div>
		);
	}

	// Training requires access code
	return (
		<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 p-6 lg:p-8">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2.5 bg-violet-100 dark:bg-violet-950/60 rounded-xl">
					<FaKey className="text-xl text-violet-600 dark:text-violet-400" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
						Código de Acesso
					</h3>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						Compartilhe com os participantes
					</p>
				</div>
			</div>

			{/* Access Code Display */}
			<div className="relative">
			<div className="flex items-center gap-2 p-4 bg-linear-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border-2 border-violet-200 dark:border-violet-800/60 rounded-xl">
					<div className="flex-1">
						<p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Código</p>
						<p className={`font-mono text-xl font-bold ${isVisible ? 'text-slate-900 dark:text-white' : 'text-transparent bg-slate-300 dark:bg-slate-700 rounded select-none'}`}>
							{isVisible ? accessCode : '••••••••••'}
						</p>
					</div>

					{/* Show/Hide Button */}
					<button
						onClick={() => setIsVisible(!isVisible)}
						className="p-3 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-xl border border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
						title={isVisible ? 'Ocultar código' : 'Mostrar código'}
					>
						{isVisible ? (
							<FaEyeSlash className="text-violet-600 dark:text-violet-400" />
						) : (
							<FaEye className="text-violet-600 dark:text-violet-400" />
						)}
					</button>

					{/* Copy Button */}
					<button
						onClick={handleCopy}
						disabled={copied}
						className={`p-3 rounded-xl border transition-all ${
							copied
								? 'bg-emerald-500 border-emerald-600 text-white'
								: 'bg-violet-500 hover:bg-violet-600 border-violet-600 text-white'
						}`}
						title={copied ? 'Copiado!' : 'Copiar código'}
					>
						{copied ? (
							<FaCheckCircle />
						) : (
							<FaCopy />
						)}
					</button>
				</div>
			</div>

			{/* Warning Note */}
			<div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-2">
				<div className="shrink-0 mt-0.5">
					<svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
					</svg>
				</div>
				<div>
					<p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
						Mantenha este código seguro
					</p>
					<p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
						Compartilhe apenas com participantes autorizados. Não publique em locais públicos.
					</p>
				</div>
			</div>
		</div>
	);
}
