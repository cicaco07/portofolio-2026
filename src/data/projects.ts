export interface Highlight {
	text: string;
}

export interface Metric {
	value: string;
	label: string;
}

export interface Project {
	title: string;
	description: string;
	techStack: string[];
	liveUrl?: string;
	githubUrl?: string;
	detailSlug?: string;
	featured?: boolean;
	year?: string;
	accent?: 'primary' | 'secondary' | 'accent';
	highlights?: Highlight[];
	metrics?: Metric[];
}

export const projects: Project[] = [
	{
		title: 'OBE Academic System',
		description:
			'Web-based academic system super app yang dikembangkan menggunakan Laravel. Sistem terintegrasi untuk pengelolaan akademik berbasis Outcome-Based Education dengan multi-modul yang saling terhubung.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'REST API', 'Tailwind CSS'],
		githubUrl: '#',
		detailSlug: 'obe-academic-system',
		featured: true,
		year: '2026',
		accent: 'primary',
		highlights: [
			{ text: 'Super app dengan multi-modul akademik terintegrasi' },
			{ text: 'Implementasi Outcome-Based Education framework' },
			{ text: 'REST API untuk integrasi dengan sistem eksternal' },
		],
		metrics: [
			{ value: 'OBE',  label: 'Framework' },
			{ value: 'Multi', label: 'Module'    },
			{ value: '2026', label: 'Year'      },
		],
	},
	{
		title: 'Agromodern',
		description:
			'Aplikasi diseminasi informasi pertanian untuk Kementerian Pertanian Republik Indonesia. Dibangun dengan Laravel sebagai platform penyebaran informasi pertanian modern ke pengguna di seluruh Indonesia.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'REST API', 'Tailwind CSS'],
		githubUrl: '#',
		detailSlug: 'agromodern',
		featured: true,
		year: '2026',
		accent: 'secondary',
		highlights: [
			{ text: 'Platform diseminasi informasi pertanian nasional' },
			{ text: 'Klien: Kementerian Pertanian Republik Indonesia' },
			{ text: 'Multi-channel content distribution' },
		],
		metrics: [
			{ value: 'Gov',  label: 'Client' },
			{ value: 'RI',   label: 'Scope'  },
			{ value: '2026', label: 'Year'   },
		],
	},
	{
		title: 'Academic System E2E Testing',
		description:
			'Automated end-to-end testing untuk academic system super app menggunakan CypressJS. Mencakup test scenario untuk seluruh user journey dari penerimaan mahasiswa hingga pengelolaan akademik.',
		techStack: ['CypressJS', 'JavaScript', 'Node.js', 'Laravel'],
		githubUrl: '#',
		featured: true,
		year: '2026',
		accent: 'accent',
		highlights: [
			{ text: 'E2E test coverage untuk academic super app' },
			{ text: 'Automated regression testing dengan CypressJS' },
			{ text: 'CI/CD integration untuk continuous testing' },
		],
		metrics: [
			{ value: 'E2E',  label: 'Coverage' },
			{ value: 'Auto', label: 'Testing'  },
			{ value: '2026', label: 'Year'     },
		],
	},
	{
		title: 'Hitungrumah',
		description:
			'Aplikasi kalkulator biaya konstruksi rumah dengan sistem manajemen harga satuan material dan pekerja. Memudahkan pengguna mengestimasi biaya pembangunan rumah sesuai desain yang diinginkan.',
		techStack: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS', 'REST API'],
		githubUrl: '#',
		year: '2024',
	},
	{
		title: 'Slum Area Scoring',
		description:
			'Aplikasi scoring untuk menentukan klasifikasi tingkat kekumuhan suatu kawasan di Kabupaten Lumajang. Membantu DPKP dalam pengambilan keputusan pemberian bantuan dan perbaikan kawasan permukiman.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
		githubUrl: '#',
		year: '2024',
	},
	{
		title: 'MLBB Data APIs',
		description:
			'Endpoint management system untuk Mobile Legends Bang Bang data APIs menggunakan GraphQL. Include dashboard admin terintegrasi untuk mengelola data hero, item, dan statistik game.',
		techStack: ['Nest.js', 'GraphQL', 'MongoDB', 'Node.js', 'TypeScript'],
		githubUrl: '#',
		detailSlug: 'mlbb-data-apis',
		year: '2025',
	},
	{
		title: 'MLBB Admin Dashboard',
		description:
			'Web admin panel berbasis Vue.js untuk mengelola data API Mobile Legends. Terhubung dengan backend GraphQL untuk CRUD hero, item, dan konfigurasi lainnya.',
		techStack: ['Vue.js', 'GraphQL', 'Tailwind CSS', 'TypeScript'],
		githubUrl: '#',
		detailSlug: 'mlbb-admin-dashboard',
		year: '2025',
	},
	{
		title: 'Decision Support System (WASPAS)',
		description:
			'Web application yang mengimplementasikan metode WASPAS untuk sistem pendukung keputusan multi-criteria.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
		githubUrl: '#',
		year: '2023',
	},
	{
		title: 'Student ID Card Scanner',
		description:
			'Mobile application yang dapat memindai dan mendeteksi kartu identitas mahasiswa menggunakan teknologi OCR.',
		techStack: ['Flutter', 'OCR', 'Dart', 'REST API'],
		githubUrl: '#',
		year: '2023',
	},
	{
		title: 'My Bengkel App',
		description:
			'Service queue information system untuk meningkatkan proses bisnis service dealer. Include fitur antrian, notifikasi, dan laporan harian.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
		githubUrl: '#',
		year: '2022',
	},
	{
		title: 'Niagahoster Landing Page',
		description:
			'Project pertama saya — slicing landing page Niagahoster menggunakan HTML, CSS, dan JavaScript vanilla.',
		techStack: ['HTML', 'CSS', 'JavaScript'],
		githubUrl: '#',
		year: '2021',
	},
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects    = projects.filter((p) => !p.featured);
