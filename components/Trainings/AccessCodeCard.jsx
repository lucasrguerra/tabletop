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
			<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-2.5 bg-emerald-100 rounded-xl">
						<FaKey className="text-xl text-emerald-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-slate-900">
							Acesso ao Treinamento
						</h3>
					</div>
				</div>

				<div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
					<p className="text-sm text-emerald-700 font-medium">
						Este treinamento está configurado como <span className="font-bold">acesso aberto</span>.
					</p>
					<p className="text-xs text-emerald-600 mt-2">
						Qualquer usuário pode ingressar sem necessidade de código.
					</p>
				</div>
			</div>
		);
	}

	// Training requires access code
	return (
		<div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6 lg:p-8">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2.5 bg-violet-100 rounded-xl">
					<FaKey className="text-xl text-violet-600" />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Código de Acesso
					</h3>
					<p className="text-xs text-slate-500">
						Compartilhe com os participantes
					</p>
				</div>
			</div>

			{/* Access Code Display */}
			<div className="relative">
			<div className="flex items-center gap-2 p-4 bg-linear-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl">
					<div className="flex-1">
						<p className="text-xs text-violet-600 font-medium mb-1">Código</p>
						<p className={`font-mono text-xl font-bold ${isVisible ? 'text-slate-900' : 'text-transparent bg-slate-300 rounded select-none'}`}>
							{isVisible ? accessCode : '••••••••••'}
						</p>
					</div>

					{/* Show/Hide Button */}
					<button
						onClick={() => setIsVisible(!isVisible)}
						className="p-3 bg-white hover:bg-violet-50 rounded-xl border border-violet-200 hover:border-violet-300 transition-all"
						title={isVisible ? 'Ocultar código' : 'Mostrar código'}
					>
						{isVisible ? (
							<FaEyeSlash className="text-violet-600" />
						) : (
							<FaEye className="text-violet-600" />
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
			<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
				<div className="shrink-0 mt-0.5">
					<svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
					</svg>
				</div>
				<div>
					<p className="text-xs text-amber-800 font-medium">
						Mantenha este código seguro
					</p>
					<p className="text-xs text-amber-700 mt-1">
						Compartilhe apenas com participantes autorizados. Não publique em locais públicos.
					</p>
				</div>
			</div>
		</div>
	);
}
