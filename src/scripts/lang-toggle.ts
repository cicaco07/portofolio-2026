const LANGS = ['id', 'en'] as const;
type Lang = (typeof LANGS)[number];

const STORAGE_KEY = 'lang';

function isLang(value: string | null | undefined): value is Lang {
	return value === 'id' || value === 'en';
}

function getStoredLang(): Lang | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return isLang(stored) ? stored : null;
	} catch {
		return null;
	}
}

function getPreferredLang(): Lang {
	if (typeof navigator === 'undefined') return 'id';
	const list = navigator.languages?.length ? navigator.languages : [navigator.language ?? 'id'];
	for (const code of list) {
		const lower = code.toLowerCase();
		if (lower.startsWith('en')) return 'en';
		if (lower.startsWith('id')) return 'id';
	}
	return 'id';
}

const ATTR_BINDINGS = [
	{ attr: 'placeholder', selector: '[data-i18n-id-placeholder], [data-i18n-en-placeholder]', idKey: 'i18nIdPlaceholder', enKey: 'i18nEnPlaceholder' },
	{ attr: 'aria-label',  selector: '[data-i18n-id-aria-label], [data-i18n-en-aria-label]',   idKey: 'i18nIdAriaLabel',   enKey: 'i18nEnAriaLabel'   },
	{ attr: 'title',       selector: '[data-i18n-id-title], [data-i18n-en-title]',             idKey: 'i18nIdTitle',       enKey: 'i18nEnTitle'       },
] as const;

function applyAttributeTranslations(lang: Lang): void {
	for (const { attr, selector, idKey, enKey } of ATTR_BINDINGS) {
		document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
			const value = el.dataset[lang === 'id' ? idKey : enKey];
			if (value !== undefined) el.setAttribute(attr, value);
		});
	}
}

export function applyLang(lang: Lang): void {
	document.documentElement.setAttribute('data-lang', lang);
	document.documentElement.setAttribute('lang', lang);
	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch {
		void 0;
	}
	applyAttributeTranslations(lang);
}

export function initLangToggle(buttonId = 'lang-toggle'): void {
	const current = (document.documentElement.getAttribute('data-lang') as Lang | null) ?? getStoredLang() ?? getPreferredLang();
	applyLang(current);

	const btn = document.getElementById(buttonId);
	if (!btn) return;

	btn.addEventListener('click', () => {
		const cur = (document.documentElement.getAttribute('data-lang') as Lang | null) ?? 'id';
		const next: Lang = cur === 'id' ? 'en' : 'id';
		applyLang(next);
		btn.classList.remove('animate-lang-switch');
		void (btn as HTMLElement).offsetWidth;
		btn.classList.add('animate-lang-switch');
	});
}
