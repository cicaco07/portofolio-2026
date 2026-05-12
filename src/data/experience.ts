export interface Achievement {
	text: string;
}

export interface Metric {
	value: string;
	label: string;
}

export interface Experience {
	period: string;
	role: string;
	company: string;
	type: string;
	description: string;
	techStack: string[];
	accent: 'primary' | 'secondary' | 'accent';
	initials: string;
	shape: 'circle' | 'squircle' | 'hexagon';
	achievements: Achievement[];
	metrics: Metric[];
	pattern: 'dots' | 'grid' | 'lines';
}

export const experiences: Experience[] = [
	{
		period: 'Aug 2024 — Dec 2024',
		role: 'Fullstack Web Developer',
		company: 'DPKP Lumajang',
		type: 'Internship',
		description:
			'Mengembangkan aplikasi untuk survey dan scoring tingkat kekumuhan kawasan di Kabupaten Lumajang. Membantu pemerintah daerah dalam pengambilan keputusan pemberian bantuan.',
		techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
		accent: 'primary',
		initials: 'DP',
		shape: 'squircle',
		achievements: [
			{ text: 'Membangun sistem scoring multi-kriteria dari nol' },
			{ text: 'Integrasi peta interaktif untuk visualisasi kawasan' },
			{ text: 'Dashboard laporan untuk pengambilan keputusan' },
		],
		metrics: [
			{ value: '5',   label: 'Bulan'    },
			{ value: '15+', label: 'Screens'  },
			{ value: '1',   label: 'Produksi' },
		],
		pattern: 'dots',
	},
	{
		period: 'Feb 2024 — Jun 2024',
		role: 'Fullstack Web Developer',
		company: 'PT Arkatama Multi Solusindo',
		type: 'Internship',
		description:
			'Membangun Hitungrumah — aplikasi kalkulator biaya konstruksi rumah dengan manajemen harga satuan material dan pekerja untuk estimasi biaya pembangunan.',
		techStack: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS', 'REST API'],
		accent: 'secondary',
		initials: 'AM',
		shape: 'hexagon',
		achievements: [
			{ text: 'Sistem manajemen harga satuan material & pekerja' },
			{ text: 'Kalkulasi otomatis berdasarkan desain rumah' },
			{ text: 'Export laporan estimasi biaya ke PDF' },
		],
		metrics: [
			{ value: '5',    label: 'Bulan'    },
			{ value: '100+', label: 'Material' },
			{ value: 'Live', label: 'Produksi' },
		],
		pattern: 'grid',
	},
	{
		period: 'Oct 2021 — Jun 2023',
		role: 'Member — Web Dev Miniclass',
		company: 'WRI Polinema',
		type: 'Organization',
		description:
			'Aktif di Workshop Riset Informatika Polinema. Mempelajari HTML, CSS, JavaScript ES6, PHP, metodologi Twelve-Factor App, dan backend C# dengan .NET framework.',
		techStack: ['HTML', 'CSS', 'JavaScript', 'PHP', 'C#', '.NET'],
		accent: 'accent',
		initials: 'WR',
		shape: 'circle',
		achievements: [
			{ text: 'Menguasai Twelve-Factor App methodology' },
			{ text: 'Membangun backend C# dengan .NET framework' },
			{ text: 'Aktif 20+ bulan dalam komunitas developer' },
		],
		metrics: [
			{ value: '20+', label: 'Bulan'     },
			{ value: '6+',  label: 'Teknologi' },
			{ value: '1',   label: 'Komunitas' },
		],
		pattern: 'lines',
	},
];
