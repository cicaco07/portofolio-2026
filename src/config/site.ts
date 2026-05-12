export const SITE = {
	title: 'Aryo Deva Saputra — Fullstack Web Developer',
	description:
		'Portfolio Aryo Deva Saputra, Fullstack Web Developer dengan 3+ tahun pengalaman di Laravel, Vue.js, Next.js, dan Nest.js.',
	author: 'Aryo Deva Saputra',
	email: 'aryodevasaputra243@gmail.com',
	phone: '+62 895-3312-76986',
	location: 'Batu, Jawa Timur, Indonesia',
	linkedin: 'https://www.linkedin.com/in/aryo-deva-saputra-6394722a2/',
	github: 'https://github.com/',
} as const;

export const NAV_LINKS = [
	{ label: 'Home',       href: '#hero'       },
	{ label: 'Education',  href: '#education'  },
	{ label: 'Experience', href: '#experience' },
	{ label: 'Projects',   href: '#projects'   },
	{ label: 'Skills',     href: '#skills'     },
	{ label: 'Contact',    href: '#contact'    },
] as const;

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
