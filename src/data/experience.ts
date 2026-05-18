import type { Tr } from '../i18n';
import { tr } from '../i18n';

export interface Achievement {
	text: Tr;
}

export interface Metric {
	value: string;
	label: Tr;
}

export interface Experience {
	period: string;
	role: Tr;
	company: string;
	type: Tr;
	description: Tr;
	techStack: string[];
	accent: 'primary' | 'secondary' | 'accent';
	initials: string;
	shape: 'circle' | 'squircle' | 'hexagon';
	achievements: Achievement[];
	metrics: Metric[];
	pattern: 'dots' | 'grid' | 'lines';
}

const lblMonths   = tr('Bulan',     'Months');
const lblApps     = tr('Aplikasi',  'Apps');
const lblClient   = tr('Klien',     'Client');
const lblScreens  = tr('Halaman',   'Screens');
const lblProd     = tr('Produksi',  'Production');
const lblMaterial = tr('Material',  'Materials');
const lblTech     = tr('Teknologi', 'Technologies');
const lblComm     = tr('Komunitas', 'Community');

const typeFulltime = tr('Penuh Waktu', 'Full-time');
const typeIntern   = tr('Magang',      'Internship');
const typeOrg      = tr('Organisasi',  'Organization');

export const experiences: Experience[] = [
	{
		period: 'Nov 2025 — May 2026',
		role: tr('Fullstack Laravel Developer', 'Fullstack Laravel Developer'),
		company: 'PT AMD Academy Indonesia',
		type: typeFulltime,
		description: tr(
			'Membangun, mengembangkan, dan menguji aplikasi untuk sistem akademik, penerimaan mahasiswa baru, diseminasi informasi pertanian, dan kebutuhan lainnya berupa admin panel website serta REST API.',
			'Building, developing, and testing applications for academic systems, new student admissions, agricultural information dissemination, and other needs in the form of admin panel websites and REST APIs.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'REST API', 'CypressJS', 'Tailwind CSS'],
		accent: 'secondary',
		initials: 'AM',
		shape: 'circle',
		achievements: [
			{ text: tr('Membangun OBE Academic System super app dengan Laravel', 'Built the OBE Academic System super app with Laravel') },
			{ text: tr('Mengembangkan Agromodern untuk Kementerian Pertanian RI', 'Developed Agromodern for the Indonesian Ministry of Agriculture') },
			{ text: tr('Automated testing CypressJS untuk academic super app', 'Automated CypressJS testing for the academic super app') },
		],
		metrics: [
			{ value: '7',   label: lblMonths },
			{ value: '3+',  label: lblApps   },
			{ value: 'Gov', label: lblClient },
		],
		pattern: 'grid',
	},
	{
		period: 'Aug 2024 — Dec 2024',
		role: tr('Fullstack Web Developer', 'Fullstack Web Developer'),
		company: 'DPKP Lumajang',
		type: typeIntern,
		description: tr(
			'Mengembangkan aplikasi untuk survey dan scoring tingkat kekumuhan kawasan di Kabupaten Lumajang. Membantu pemerintah daerah dalam pengambilan keputusan pemberian bantuan.',
			'Developed an application to survey and score the level of slum areas in Lumajang Regency. Assisted the local government in decision-making for providing aid.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
		accent: 'primary',
		initials: 'DP',
		shape: 'squircle',
		achievements: [
			{ text: tr('Membangun sistem scoring multi-kriteria dari nol', 'Built a multi-criteria scoring system from scratch') },
			{ text: tr('Integrasi peta interaktif untuk visualisasi kawasan', 'Integrated interactive maps for area visualization') },
			{ text: tr('Dashboard laporan untuk pengambilan keputusan', 'Reporting dashboard for decision making') },
		],
		metrics: [
			{ value: '5',   label: lblMonths  },
			{ value: '15+', label: lblScreens },
			{ value: '1',   label: lblProd    },
		],
		pattern: 'dots',
	},
	{
		period: 'Feb 2024 — Jun 2024',
		role: tr('Fullstack Web Developer', 'Fullstack Web Developer'),
		company: 'PT Arkatama Multi Solusindo',
		type: typeIntern,
		description: tr(
			'Membangun Hitungrumah — aplikasi kalkulator biaya konstruksi rumah dengan manajemen harga satuan material dan pekerja untuk estimasi biaya pembangunan.',
			'Built Hitungrumah — a house construction cost calculator with unit price management for materials and workers to estimate construction costs.',
		),
		techStack: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS', 'REST API'],
		accent: 'secondary',
		initials: 'AR',
		shape: 'hexagon',
		achievements: [
			{ text: tr('Sistem manajemen harga satuan material & pekerja', 'Unit price management system for materials & workers') },
			{ text: tr('Kalkulasi otomatis berdasarkan desain rumah', 'Automatic calculation based on house design') },
			{ text: tr('Export laporan estimasi biaya ke PDF', 'Export cost estimate reports to PDF') },
		],
		metrics: [
			{ value: '5',    label: lblMonths   },
			{ value: '100+', label: lblMaterial },
			{ value: 'Live', label: lblProd     },
		],
		pattern: 'grid',
	},
	{
		period: 'Oct 2021 — Jun 2023',
		role: tr('Member — Web Dev Miniclass', 'Member — Web Dev Miniclass'),
		company: 'WRI Polinema',
		type: typeOrg,
		description: tr(
			'Aktif di Workshop Riset Informatika Polinema. Mempelajari HTML, CSS, JavaScript ES6, PHP, metodologi Twelve-Factor App, dan backend C# dengan .NET framework.',
			'Active in the Polinema Informatics Research Workshop. Studied HTML, CSS, JavaScript ES6, PHP, the Twelve-Factor App methodology, and C# backend with the .NET framework.',
		),
		techStack: ['HTML', 'CSS', 'JavaScript', 'PHP', 'C#', '.NET'],
		accent: 'accent',
		initials: 'WR',
		shape: 'circle',
		achievements: [
			{ text: tr('Menguasai metodologi Twelve-Factor App', 'Mastered the Twelve-Factor App methodology') },
			{ text: tr('Membangun backend C# dengan .NET framework', 'Built C# backend with the .NET framework') },
			{ text: tr('Aktif 20+ bulan dalam komunitas developer', 'Active 20+ months in the developer community') },
		],
		metrics: [
			{ value: '20+', label: lblMonths },
			{ value: '6+',  label: lblTech   },
			{ value: '1',   label: lblComm   },
		],
		pattern: 'lines',
	},
];
