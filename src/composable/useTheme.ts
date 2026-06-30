"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
	// Keep first render deterministic for SSR hydration.
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const saved = localStorage.getItem("theme");
		const nextTheme: Theme =
			saved === "light" || saved === "dark"
				? saved
				: window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light";

		queueMicrotask(() => {
			setTheme(nextTheme);
		});
	}, []);

	useEffect(() => {
		const root = window.document.documentElement;

		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}

		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return { theme, toggleTheme, setTheme };
}
