"use client";

import { FaCheck } from 'react-icons/fa';

/**
 * StepIndicator Component
 * Modern, colorful stepper with gradient backgrounds and smooth animations
 */
export default function StepIndicator({ steps, current_step }) {
	return (
		<div className="w-full px-2 sm:px-4">
			<div className="flex items-center justify-between relative">
				{steps.map((step, index) => {
					const Icon = step.icon;
					const is_completed = current_step > step.number;
					const is_current = current_step === step.number;

					return (
						<div key={step.number} className="flex items-center flex-1 relative">
							<div className="flex flex-col items-center flex-1 relative z-10">
								{/* Circle with gradient */}
								<div
									className={`
										relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
										transition-all duration-500 transform
										${is_completed
											? 'bg-linear-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/50 scale-110'
											: is_current
												? 'bg-linear-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/50 scale-110'
												: 'bg-gray-200 hover:bg-gray-300'
										}
									`}
								>
									{/* Glow effect for current step */}
									{is_current && (
										<div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 animate-ping opacity-40" />
									)}
									
									<div className="relative z-10">
										{is_completed ? (
											<FaCheck className="text-white text-lg sm:text-2xl" />
										) : (
											<Icon className={`text-xl sm:text-3xl ${is_current ? 'text-white' : 'text-gray-500'}`} />
										)}
									</div>
								</div>
								
								{/* Label */}
								<div className="mt-3 text-center">
									<p
										className={`
											text-xs sm:text-sm font-semibold transition-all duration-300
											${is_current 
												? 'text-blue-600 scale-105' 
												: is_completed
													? 'text-green-600'
													: 'text-gray-500'
											}
										`}
									>
										{step.title}
									</p>
									<p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
										Etapa {step.number}
									</p>
								</div>
							</div>

							{/* Connector line with gradient */}
							{index < steps.length - 1 && (
								<div className="absolute top-6 sm:top-8 left-[calc(50%+24px)] sm:left-[calc(50%+32px)] right-[calc(-50%+24px)] sm:right-[calc(-50%+32px)] -translate-y-1/2 h-1 sm:h-1.5 z-0">
									<div
										className={`
											h-full rounded-full transition-all duration-700
											${is_completed
												? 'bg-linear-to-r from-green-400 to-emerald-500 shadow-md shadow-green-500/30'
												: 'bg-gray-200'
											}
										`}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
