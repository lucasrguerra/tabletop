"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { FaSun, FaMoon, FaDesktop, FaChevronDown, FaCheck } from "react-icons/fa";

const THEME_OPTIONS = [
	{ id: "light", label: "Claro", icon: FaSun, color: "text-amber-500" },
	{ id: "dark", label: "Escuro", icon: FaMoon, color: "text-indigo-400" },
	{ id: "system", label: "Sistema", icon: FaDesktop, color: "text-blue-500" },
];

export default function ThemeToggle({ className = "", compact = false }) {
	const { theme, setTheme, mounted } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!mounted) {
		return (
			<div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 opacity-50 ${className}`} />
		);
	}

	const currentOption = THEME_OPTIONS.find((opt) => opt.id === theme) || THEME_OPTIONS[2];
	const CurrentIcon = currentOption.icon;

	return (
		<div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
			<button
				onClick={() => setIsOpen((prev) => !prev)}
				type="button"
				className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
					isOpen
						? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 shadow-xs"
						: "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
				}`}
				aria-expanded={isOpen}
				aria-haspopup="true"
				aria-label="Alternar tema de cor"
			>
				<CurrentIcon className={`text-sm shrink-0 ${currentOption.color}`} />
				{!compact && (
					<span className="hidden sm:inline font-semibold">{currentOption.label}</span>
				)}
				<FaChevronDown
					className={`text-[10px] text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				<div
					className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/60 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
					role="menu"
				>
					<div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
						Aparência
					</div>

					{THEME_OPTIONS.map((opt) => {
						const OptionIcon = opt.icon;
						const isSelected = theme === opt.id;

						return (
							<button
								key={opt.id}
								onClick={() => {
									setTheme(opt.id);
									setIsOpen(false);
								}}
								className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
									isSelected
										? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
										: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
								}`}
								role="menuitem"
							>
								<div className="flex items-center gap-2.5">
									<OptionIcon className={`text-sm ${opt.color}`} />
									<span>{opt.label}</span>
								</div>
								{isSelected && <FaCheck className="text-xs text-blue-600 dark:text-blue-400" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
