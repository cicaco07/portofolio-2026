const THEMES = ['sunset', 'acid'] as const;
type Theme = (typeof THEMES)[number];

function getStoredTheme(): Theme | null {
	try {
		const stored = localStorage.getItem('theme');
		if (stored === 'acid' || stored === 'sunset') return stored;
		return null;
	} catch {
		return null;
	}
}

function getPreferredTheme(): Theme {
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'acid' : 'sunset';
}

export function applyTheme(theme: Theme): void {
	document.documentElement.setAttribute('data-theme', theme);
	try {
		localStorage.setItem('theme', theme);
	} catch {
		// storage unavailable
	}
}

export function initTheme(): void {
	const theme = getStoredTheme() ?? getPreferredTheme();
	applyTheme(theme);
}

export function initThemeToggle(buttonId = 'theme-toggle'): void {
	const btn = document.getElementById(buttonId);
	if (!btn) return;

	btn.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') as Theme;
		const next: Theme = current === 'sunset' ? 'acid' : 'sunset';
		applyTheme(next);
		btn.classList.remove('animate-theme-switch');
		void (btn as HTMLElement).offsetWidth;
		btn.classList.add('animate-theme-switch');
	});
}
