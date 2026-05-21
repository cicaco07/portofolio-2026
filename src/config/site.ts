import type { Tr } from '../i18n';
import { tr } from '../i18n';
import { UI } from '../i18n';

export const SITE = {
	title: 'Aryo Deva Saputra — Fullstack Web Developer',
	description: tr(
		'Portfolio Aryo Deva Saputra, Fullstack Web Developer dengan 3+ tahun pengalaman di Laravel, Vue.js, Next.js, dan Nest.js.',
		'Portfolio of Aryo Deva Saputra, a Fullstack Web Developer with 3+ years of experience in Laravel, Vue.js, Next.js, and Nest.js.',
	) satisfies Tr,
	author: 'Aryo Deva Saputra',
	email: 'aryodevasaputra243@gmail.com',
	phone: '+62 895-3312-76986',
	location: tr('Batu, Jawa Timur, Indonesia', 'Batu, East Java, Indonesia') satisfies Tr,
	linkedin: 'https://www.linkedin.com/in/aryo-deva-saputra-6394722a2/',
	github: 'https://github.com/',
} as const;

export interface NavLink {
	label: Tr;
	href: string;
}

export const NAV_LINKS: readonly NavLink[] = [
	{ label: UI.nav.home,       href: '#hero'       },
	{ label: UI.nav.education,  href: '#education'  },
	{ label: UI.nav.experience, href: '#experience' },
	{ label: UI.nav.projects,   href: '#projects'   },
	{ label: UI.nav.aiUsage,    href: '/ai-usage/'  },
	{ label: UI.nav.skills,     href: '#skills'     },
	{ label: UI.nav.contact,    href: '#contact'    },
];

export const SOCIAL_LINKS = [
	{
		label: 'GitHub',
		href: 'https://github.com/',
		icon: 'github',
	},
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/aryo-deva-saputra-6394722a2/',
		icon: 'linkedin',
	},
	{
		label: 'Email',
		href: 'mailto:aryodevasaputra243@gmail.com',
		icon: 'email',
	},
] as const;

export const FOOTER_LINKS = NAV_LINKS;
