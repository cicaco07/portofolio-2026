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

const lblFramework = tr('Framework', 'Framework');
const lblModule = tr('Modul', 'Module');
const lblYear = tr('Tahun', 'Year');
const lblScope = tr('Cakupan', 'Scope');
const lblClient = tr('Klien', 'Client');
const lblStack = tr('Stack', 'Stack');
const lblPanel = tr('Panel', 'Panel');
const lblData = tr('Data', 'Data');

export const projects: Project[] = [
	{
		title: 'OBE Academic System',
		description: tr(
			'Web-based academic system super app yang dikembangkan menggunakan Laravel. Sistem terintegrasi untuk pengelolaan akademik berbasis Outcome-Based Education dengan multi-modul yang saling terhubung.',
			'A web-based academic system super app developed using Laravel. An integrated system for academic management based on Outcome-Based Education with multiple interconnected modules.',
		),
		techStack: ['Laravel', 'PHP', 'PostgreSQL', 'REST API', 'Bootstrap'],
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
			{ value: 'OBE', label: lblFramework },
			{ value: 'Multi', label: lblModule },
			{ value: '2026', label: lblYear },
		],
	},
	{
		title: 'Agromodern',
		description: tr(
			'Aplikasi diseminasi informasi pertanian untuk Kementerian Pertanian Republik Indonesia. Dibangun dengan Laravel sebagai platform penyebaran informasi pertanian modern ke pengguna di seluruh Indonesia.',
			'An agricultural information dissemination application for the Ministry of Agriculture of the Republic of Indonesia. Built with Laravel as a platform for distributing modern agricultural information to users across Indonesia.',
		),
		techStack: ['Laravel', 'PHP', 'PostgreSQL', 'REST API', 'Bootstrap'],
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
			{ value: 'Gov', label: lblClient },
			{ value: 'RI', label: lblScope },
			{ value: '2026', label: lblYear },
		],
	},
	{
		title: 'Academic System E2E Testing',
		description: tr(
			'Automated end-to-end testing untuk academic system super app menggunakan CypressJS. Membuat lebih dari 60 test case yang meningkatkan code coverage sebesar 40% dan mengurangi bug di production, mencakup seluruh user journey dari penerimaan mahasiswa hingga pengelolaan akademik.',
			'Automated end-to-end testing for the academic system super app using CypressJS. Created more than 60 test cases that increased code coverage by 40% and reduced bugs in production, covering the entire user journey from student admissions to academic management.',
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
			'Aplikasi kalkulator biaya konstruksi rumah dengan sistem manajemen harga satuan material dan pekerja yang mengelola 10+ entri data. Mempercepat proses estimasi biaya pembangunan rumah sebesar 40-50% dibanding perhitungan manual.',
			'A house construction cost calculator with a unit price management system for materials and workers that manages 10+ data entries. Speeds up the construction cost estimation process by 40-50% compared to manual calculations.',
		),
		techStack: ['Laravel', 'Vue.js', 'MySQL', 'Bootstrap', 'REST API'],
		repoVisibility: 'private',
		year: '2024',
	},
	{
		title: 'Slum Area Scoring',
		description: tr(
			'Aplikasi survey dan scoring untuk memetakan tingkat kekumuhan kawasan di Kabupaten Lumajang. Mengolah dan mengklasifikasi data dari 65 kawasan ke dalam 4 kategori, mempercepat proses pengambilan keputusan pemberian bantuan pemerintah sekitar 30-40%.',
			'A survey and scoring application to map the slum level of areas in Lumajang Regency. Processed and classified data from 65 areas into 4 categories, accelerating the government\'s aid-allocation decision-making by around 30-40%.',
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
			{ value: 'MLBB', label: lblData },
			{ value: '2025', label: lblYear },
		],
	},
	{
		title: 'MLBB Admin Dashboard',
		description: tr(
			'Web admin panel berbasis Vue.js untuk mengelola data API Mobile Legends. Terhubung dengan backend GraphQL untuk CRUD hero, item, dan konfigurasi lainnya.',
			'A Vue.js-based admin web panel for managing Mobile Legends API data. Connected to the GraphQL backend for CRUD operations on heroes, items, and other configurations.',
		),
		techStack: ['Vue.js', 'GraphQL', 'ApolloClient', 'Bootstrap', 'TypeScript'],
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
			{ value: 'Vue', label: lblFramework },
			{ value: 'Admin', label: lblPanel },
			{ value: '2025', label: lblYear },
		],
	},
	{
		title: 'Decision Support System (WASPAS)',
		description: tr(
			'Aplikasi web yang mengimplementasikan metode WASPAS untuk sistem pendukung keputusan multi-kriteria, mampu memproses matriks dengan 10+ kriteria untuk menghasilkan peringkat yang presisi.',
			'A web application that implements the WASPAS method for a multi-criteria decision support system, capable of processing matrices with 10+ criteria to generate precise rankings.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
		githubUrl: 'https://github.com/cicaco07/spk_waspas',
		year: '2023',
	},
	{
		title: 'Student ID Card Scanner',
		description: tr(
			'Aplikasi mobile hasil kerja tim 3 orang yang memindai dan mendeteksi kartu identitas mahasiswa (KTM) menggunakan teknologi OCR dengan tingkat akurasi 85-90%, menghilangkan kebutuhan input data manual.',
			'A mobile app built by a 3-person team that scans and detects student ID cards (KTM) using OCR technology with an 85-90% accuracy rate, eliminating the need for manual data entry.',
		),
		techStack: ['Flutter', 'OCR', 'Dart', 'REST API', 'C++', 'Python'],
		githubUrl: 'https://github.com/cicaco07/ocr_app',
		year: '2023',
	},
	{
		title: 'My Bengkel App',
		description: tr(
			'Sistem manajemen antrian untuk digitalisasi proses bisnis dealer servis. Mencakup fitur antrian, notifikasi, dan laporan harian yang diperkirakan mengurangi waktu tunggu pelanggan sebesar 20-30% dan meningkatkan kapasitas servis harian.',
			'A queue management system to digitize a service dealer\'s business processes. Includes queue management, notifications, and daily reports estimated to reduce customer wait times by 20-30% and increase daily service capacity.',
		),
		techStack: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Tailwind'],
		githubUrl: 'https://github.com/cicaco07/MyBengkel',
		year: '2023',
	},
	{
		title: 'Niagahoster Landing Page',
		description: tr(
			'Project pertama saya — slicing landing page Niagahoster secara individu dalam 1 minggu menggunakan HTML, CSS, dan JavaScript vanilla. Mencapai Lighthouse score 90+ dan kompatibel responsif pada 100% perangkat.',
			'My first project — slicing the Niagahoster landing page individually in 1 week using HTML, CSS, and vanilla JavaScript. Achieved a Lighthouse score of 90+ and responsive compatibility on 100% of devices.',
		),
		techStack: ['HTML', 'CSS', 'JavaScript'],
		githubUrl: 'https://github.com/cicaco07/wri-phyton-landing-page',
		year: '2021',
	},
	{
		title: 'Discord Bot (UNO/Rummy)',
		description: tr(
			'Bot Discord untuk permainan kartu UNO/Rummy yang mendukung multiplayer real-time menggunakan Python dan Supabase, melayani hingga 20 concurrent users di server.',
			'A Discord bot for UNO/Rummy card games supporting real-time multiplayer using Python and Supabase, serving up to 20 concurrent users on the server.',
		),
		techStack: ['Python', 'Supabase', 'Discord API', 'WebSocket'],
		githubUrl: 'https://github.com/cicaco07/card-bot',
		year: '2026',
	},
	{
		title: 'Portfolio Website',
		description: tr(
			'Website portfolio super cepat yang dibangun menggunakan AstroJS dalam 2 minggu, dengan optimasi load time hingga di bawah 2 detik.',
			'A super-fast portfolio website built with AstroJS in 2 weeks, optimized to load in under 2 seconds.',
		),
		techStack: ['Astro', 'TypeScript', 'Tailwind CSS', 'GSAP', 'DaisyUI'],
		githubUrl: 'https://github.com/cicaco07/portofolio-2026',
		year: '2026',
	},
];

export const featuredProjects = projects.filter((p) => p.detailSlug);
export const otherProjects = projects.filter((p) => !p.detailSlug);
