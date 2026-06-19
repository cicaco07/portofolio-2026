import type { Tr } from '../i18n';
import { tr } from '../i18n';

export interface Highlight {
	text: Tr;
}

export interface Metric {
	value: string;
	label: Tr;
}

export interface Project {
	title: string;
	description: Tr;
	techStack: string[];
	liveUrl?: string;
	githubUrl?: string;
	repoVisibility?: 'public' | 'private';
	detailSlug?: string;
	year?: string;
	accent?: 'primary' | 'secondary' | 'accent';
	highlights?: Highlight[];
	metrics?: Metric[];
}

const lblFramework = tr('Framework',  'Framework');
const lblModule    = tr('Modul',      'Module');
const lblYear      = tr('Tahun',      'Year');
const lblScope     = tr('Cakupan',    'Scope');
const lblClient    = tr('Klien',      'Client');
const lblStack     = tr('Stack',      'Stack');
const lblPanel     = tr('Panel',      'Panel');
const lblData     = tr('Data',        'Data');

export const projects: Project[] = [
	{
		title: 'OBE Academic System',
		description: tr(
			'Web-based academic system super app yang dikembangkan menggunakan Laravel. Sistem terintegrasi untuk pengelolaan akademik berbasis Outcome-Based Education dengan multi-modul yang saling terhubung.',
			'A web-based academic system super app developed using Laravel. An integrated system for academic management based on Outcome-Based Education with multiple interconnected modules.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'REST API', 'Tailwind CSS'],
		repoVisibility: 'private',
		detailSlug: 'obe-academic-system',
		year: '2026',
		accent: 'primary',
		highlights: [
			{ text: tr('Super app dengan multi-modul akademik terintegrasi', 'Super app with integrated multi-module academic features') },
			{ text: tr('Implementasi framework Outcome-Based Education', 'Implementation of the Outcome-Based Education framework') },
			{ text: tr('REST API untuk integrasi dengan sistem eksternal', 'REST API for integration with external systems') },
		],
		metrics: [
			{ value: 'OBE',  label: lblFramework },
			{ value: 'Multi', label: lblModule   },
			{ value: '2026', label: lblYear     },
		],
	},
	{
		title: 'Agromodern',
		description: tr(
			'Aplikasi diseminasi informasi pertanian untuk Kementerian Pertanian Republik Indonesia. Dibangun dengan Laravel sebagai platform penyebaran informasi pertanian modern ke pengguna di seluruh Indonesia.',
			'An agricultural information dissemination application for the Ministry of Agriculture of the Republic of Indonesia. Built with Laravel as a platform for distributing modern agricultural information to users across Indonesia.',
		),
		techStack: ['Laravel', 'PHP', 'PostgreSQL', 'REST API', 'Tailwind CSS', 'Octane'],
		repoVisibility: 'private',
		detailSlug: 'agromodern',
		year: '2026',
		accent: 'secondary',
		highlights: [
			{ text: tr('Platform diseminasi informasi pertanian nasional', 'National agricultural information dissemination platform') },
			{ text: tr('Klien: Kementerian Pertanian Republik Indonesia', 'Client: Ministry of Agriculture of the Republic of Indonesia') },
			{ text: tr('Distribusi konten multi-channel', 'Multi-channel content distribution') },
		],
		metrics: [
			{ value: 'Gov',  label: lblClient },
			{ value: 'RI',   label: lblScope  },
			{ value: '2026', label: lblYear   },
		],
	},
	{
		title: 'Academic System E2E Testing',
		description: tr(
			'Automated end-to-end testing untuk academic system super app menggunakan CypressJS. Mencakup test scenario untuk seluruh user journey dari penerimaan mahasiswa hingga pengelolaan akademik.',
			'Automated end-to-end testing for the academic system super app using CypressJS. Covers test scenarios for the entire user journey from student admissions to academic management.',
		),
		techStack: ['CypressJS', 'JavaScript', 'Node.js', 'Laravel'],
		repoVisibility: 'private',
		year: '2026',
		accent: 'accent',
		highlights: [
			{ text: tr('Cakupan test E2E untuk academic super app', 'E2E test coverage for the academic super app') },
			{ text: tr('Automated regression testing dengan CypressJS', 'Automated regression testing with CypressJS') },
			{ text: tr('Integrasi CI/CD untuk continuous testing', 'CI/CD integration for continuous testing') },
		],
	},
	{
		title: 'Hitungrumah',
		description: tr(
			'Aplikasi kalkulator biaya konstruksi rumah dengan sistem manajemen harga satuan material dan pekerja. Memudahkan pengguna mengestimasi biaya pembangunan rumah sesuai desain yang diinginkan.',
			'A house construction cost calculator with a unit price management system for materials and workers. Helps users estimate construction costs based on the desired design.',
		),
		techStack: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS', 'REST API'],
		repoVisibility: 'private',
		year: '2024',
	},
	{
		title: 'Slum Area Scoring',
		description: tr(
			'Aplikasi scoring untuk menentukan klasifikasi tingkat kekumuhan suatu kawasan di Kabupaten Lumajang. Membantu DPKP dalam pengambilan keputusan pemberian bantuan dan perbaikan kawasan permukiman.',
			'A scoring application to determine the slum-level classification of an area in Lumajang Regency. Assists DPKP in deciding on aid distribution and settlement improvements.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
		repoVisibility: 'private',
		year: '2024',
	},
	{
		title: 'MLBB Data APIs',
		description: tr(
			'Endpoint management system untuk Mobile Legends Bang Bang data APIs menggunakan GraphQL. Termasuk dashboard admin terintegrasi untuk mengelola data hero, item, dan statistik game.',
			'Endpoint management system for Mobile Legends Bang Bang data APIs using GraphQL. Includes an integrated admin dashboard for managing hero, item, and game statistics data.',
		),
		techStack: ['Nest.js', 'GraphQL', 'MongoDB', 'Node.js', 'TypeScript', 'JWT'],
		githubUrl: 'https://github.com/cicaco07/graphql-api',
		detailSlug: 'mlbb-data-apis',
		year: '2025',
		accent: 'primary',
		highlights: [
			{ text: tr('GraphQL endpoint untuk data hero, item, dan statistik', 'GraphQL endpoints for hero, item, and stats data') },
			{ text: tr('Skema modular dengan Nest.js dan MongoDB', 'Modular schema with Nest.js and MongoDB') },
			{ text: tr('Dokumentasi API otomatis via GraphQL Playground', 'Auto-generated API docs via GraphQL Playground') },
		],
		metrics: [
			{ value: 'GraphQL', label: lblStack },
			{ value: 'MLBB',    label: lblData  },
			{ value: '2025',    label: lblYear  },
		],
	},
	{
		title: 'MLBB Admin Dashboard',
		description: tr(
			'Web admin panel berbasis Vue.js untuk mengelola data API Mobile Legends. Terhubung dengan backend GraphQL untuk CRUD hero, item, dan konfigurasi lainnya.',
			'A Vue.js-based admin web panel for managing Mobile Legends API data. Connected to the GraphQL backend for CRUD operations on heroes, items, and other configurations.',
		),
		techStack: ['Vue.js', 'GraphQL', 'Bootstrap', 'TypeScript'],
		githubUrl: 'https://github.com/cicaco07/web-admin',
		detailSlug: 'mlbb-admin-dashboard',
		year: '2025',
		accent: 'secondary',
		highlights: [
			{ text: tr('Panel admin reaktif berbasis Vue.js', 'Reactive admin panel built with Vue.js') },
			{ text: tr('CRUD lengkap untuk hero, item, dan konfigurasi', 'Full CRUD for heroes, items, and configurations') },
			{ text: tr('Integrasi langsung dengan backend GraphQL', 'Direct integration with the GraphQL backend') },
		],
		metrics: [
			{ value: 'Vue',   label: lblFramework },
			{ value: 'Admin', label: lblPanel     },
			{ value: '2025',  label: lblYear      },
		],
	},
	{
		title: 'Decision Support System (WASPAS)',
		description: tr(
			'Aplikasi web yang mengimplementasikan metode WASPAS untuk sistem pendukung keputusan multi-kriteria.',
			'A web application that implements the WASPAS method for a multi-criteria decision support system.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
		githubUrl: 'https://github.com/cicaco07/spk_waspas',
		year: '2023',
	},
	{
		title: 'Student ID Card Scanner',
		description: tr(
			'Aplikasi mobile yang dapat memindai dan mendeteksi kartu identitas mahasiswa menggunakan teknologi OCR.',
			'A mobile application that can scan and detect student ID cards using OCR technology.',
		),
		techStack: ['Flutter', 'OCR', 'Dart', 'REST API', 'C++', 'Phyton'],
		githubUrl: 'https://github.com/cicaco07/ocr_app',
		year: '2023',
	},
	{
		title: 'My Bengkel App',
		description: tr(
			'Sistem informasi antrian servis untuk meningkatkan proses bisnis dealer servis. Mencakup fitur antrian, notifikasi, dan laporan harian.',
			'A service queue information system to improve a service dealer\'s business processes. Includes queue management, notifications, and daily reports.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Tailwind'],
		githubUrl: 'https://github.com/cicaco07/MyBengkel',
		year: '2023',
	},
	{
		title: 'Niagahoster Landing Page',
		description: tr(
			'Project pertama saya — slicing landing page Niagahoster menggunakan HTML, CSS, dan JavaScript vanilla.',
			'My first project — slicing the Niagahoster landing page using HTML, CSS, and vanilla JavaScript.',
		),
		techStack: ['HTML', 'CSS', 'JavaScript'],
		githubUrl: 'https://github.com/cicaco07/wri-phyton-landing-page',
		year: '2021',
	},
];

export const featuredProjects = projects.filter((p) => p.detailSlug);
export const otherProjects    = projects.filter((p) => !p.detailSlug);
