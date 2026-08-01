"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({
	theme: "system",
	resolvedTheme: "light",
	setTheme: () => {},
	toggleTheme: () => {},
});

export const STORAGE_KEY = "tabletop-theme";

export function ThemeProvider({ children }) {
	const [theme, setThemeState] = useState("system");
	const [resolvedTheme, setResolvedTheme] = useState("light");
	const [mounted, setMounted] = useState(false);

	const applyTheme = useCallback((targetTheme) => {
		const root = document.documentElement;
		let effectiveTheme = targetTheme;

		if (targetTheme === "system") {
			effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}

		if (effectiveTheme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}

		setResolvedTheme(effectiveTheme);
	}, []);

	// Initialize theme on client mount
	useEffect(() => {
		const savedTheme = localStorage.getItem(STORAGE_KEY) || "system";
		setThemeState(savedTheme);
		applyTheme(savedTheme);
		setMounted(true);
	}, [applyTheme]);

	// Listen for system theme changes when theme is set to 'system'
	useEffect(() => {
		if (!mounted) return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleSystemChange = () => {
			if (theme === "system") {
				applyTheme("system");
			}
		};

		mediaQuery.addEventListener("change", handleSystemChange);
		return () => mediaQuery.removeEventListener("change", handleSystemChange);
	}, [theme, mounted, applyTheme]);

	const setTheme = useCallback(
		(newTheme) => {
			setThemeState(newTheme);
			localStorage.setItem(STORAGE_KEY, newTheme);
			applyTheme(newTheme);
		},
		[applyTheme]
	);

	const toggleTheme = useCallback(() => {
		const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
		setTheme(nextTheme);
	}, [resolvedTheme, setTheme]);

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, mounted }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
