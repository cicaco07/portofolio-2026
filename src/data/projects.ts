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
	featured?: boolean;
	year?: string;
	accent?: 'primary' | 'secondary' | 'accent';
	highlights?: Highlight[];
	metrics?: Metric[];
}

export const projects: Project[] = [
	{
		title: 'Hitungrumah',
		description:
			'Aplikasi kalkulator biaya konstruksi rumah dengan sistem manajemen harga satuan material dan pekerja. Memudahkan pengguna mengestimasi biaya pembangunan rumah sesuai desain yang diinginkan.',
		techStack: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS', 'REST API'],
		githubUrl: '#',
		featured: true,
		year: '2024',
		accent: 'primary',
		highlights: [
			{ text: 'Manajemen 100+ jenis material & pekerja' },
			{ text: 'Kalkulasi real-time berdasarkan input desain' },
			{ text: 'Export laporan estimasi ke PDF' },
		],
		metrics: [
			{ value: '100+', label: 'Material'  },
			{ value: '5',    label: 'Bulan Dev' },
			{ value: 'Live', label: 'Status'    },
		],
	},
	{
		title: 'Slum Area Scoring',
		description:
			'Aplikasi scoring untuk menentukan klasifikasi tingkat kekumuhan suatu kawasan di Kabupaten Lumajang. Membantu DPKP dalam pengambilan keputusan pemberian bantuan dan perbaikan kawasan permukiman.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
		githubUrl: '#',
		featured: true,
		year: '2024',
		accent: 'secondary',
		highlights: [
			{ text: 'Sistem scoring multi-kriteria kekumuhan' },
			{ text: 'Visualisasi peta interaktif kawasan' },
			{ text: 'Dashboard laporan untuk pemerintah daerah' },
		],
		metrics: [
			{ value: '15+', label: 'Screens'   },
			{ value: '5',   label: 'Bulan Dev' },
			{ value: 'Gov', label: 'Client'    },
		],
	},
	{
		title: 'MLBB Data APIs',
		description:
			'Endpoint management system untuk Mobile Legends Bang Bang data APIs menggunakan GraphQL. Include dashboard admin terintegrasi untuk mengelola data hero, item, dan statistik game.',
		techStack: ['Nest.js', 'GraphQL', 'MongoDB', 'Node.js', 'TypeScript'],
		githubUrl: '#',
		featured: true,
		year: '2025',
		accent: 'accent',
		highlights: [
			{ text: 'GraphQL API dengan schema-first design' },
			{ text: 'Admin dashboard Vue.js terintegrasi' },
			{ text: 'Real-time data sync hero & item MLBB' },
		],
		metrics: [
			{ value: 'GQL',  label: 'Protocol' },
			{ value: '2',    label: 'Apps'     },
			{ value: '2025', label: 'Year'     },
		],
	},
	{
		title: 'MLBB Admin Dashboard',
		description:
			'Web admin panel berbasis Vue.js untuk mengelola data API Mobile Legends. Terhubung dengan backend GraphQL untuk CRUD hero, item, dan konfigurasi lainnya.',
		techStack: ['Vue.js', 'GraphQL', 'Tailwind CSS', 'TypeScript'],
		githubUrl: '#',
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
