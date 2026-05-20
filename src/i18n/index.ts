export type Lang = 'id' | 'en';

export const LANGS: readonly Lang[] = ['id', 'en'] as const;
export const DEFAULT_LANG: Lang = 'id';

export interface Tr {
	id: string;
	en: string;
}

export function tr(id: string, en: string): Tr {
	return { id, en };
}

export const UI = {
		nav: {
			home:       tr('Beranda',     'Home'),
			education:  tr('Pendidikan',  'Education'),
			experience: tr('Pengalaman',  'Experience'),
			projects:   tr('Proyek',      'Projects'),
			aiUsage:    tr('Penggunaan AI', 'AI Usage'),
			skills:     tr('Keahlian',    'Skills'),
			contact:    tr('Kontak',      'Contact'),
		},
	a11y: {
		toggleTheme:    tr('Ubah tema',     'Toggle theme'),
		toggleMenu:     tr('Buka menu',     'Toggle menu'),
		toggleLanguage: tr('Ubah bahasa',   'Toggle language'),
	},
	hero: {
		greet:    tr('Halo, saya',                  "Hi, I'm"),
		intro:    tr(
			'3+ tahun pengalaman membangun aplikasi web dengan PHP & JavaScript. Familiar dengan Laravel, Next.js, Vue.js, dan Nest.js. Fokus pada REST & GraphQL API serta clean architecture.',
			'3+ years of experience building web applications with PHP & JavaScript. Familiar with Laravel, Next.js, Vue.js, and Nest.js. Focused on REST & GraphQL APIs and clean architecture.',
		),
		ctaWork:    tr('Lihat Karya',    'View My Work'),
		ctaContact: tr('Hubungi Saya',   'Get In Touch'),
		statYears:  tr('Tahun',          'Years Exp.'),
		statProj:   tr('Proyek',         'Projects'),
		statGpa:    tr('IPK',            'GPA'),
		statToeic:  tr('TOEIC',          'TOEIC'),
		scroll:     tr('Geser',          'Scroll'),
	},
	section: {
		education: {
			number:   '01. Education',
			title:    tr('Riwayat Pendidikan', 'Education History'),
		},
		experience: {
			number:   '02. Experience',
			title:    tr('Pengalaman Kerja',   'Work Experience'),
			subtitle: tr(
				'Perjalanan profesional saya sebagai developer, dari miniclass hingga internship di perusahaan teknologi.',
				'My professional journey as a developer, from miniclass to internships at tech companies.',
			),
		},
		projects: {
			number:   '03. Projects',
			title:    tr('Project Unggulan',   'Featured Projects'),
			subtitle: tr(
				'Tiga project unggulan yang merepresentasikan keahlian teknis dan proses pengembangan saya.',
				'Three featured projects that represent my technical expertise and development process.',
			),
			otherTitle:    tr('Project Lainnya', 'Other Projects'),
			otherSubtitle: tr(
				'Beberapa project lain yang pernah saya kerjakan.',
				"Other projects I've worked on.",
			),
		},
		aiUsage: {
			number:   '04. AI Usage',
			title:    tr('Penggunaan AI', 'AI Usage'),
			subtitle: tr('Statistik penggunaan token AI saya dari Tokscale.', 'My AI token usage statistics from Tokscale.'),
			totalTokens: tr('Total Token', 'Total Tokens'),
			totalCost: tr('Total Biaya', 'Total Cost'),
			totalRequests: tr('Total Permintaan', 'Total Requests'),
			activeDays: tr('Hari Aktif', 'Active Days'),
			modelsUsed: tr('Model Digunakan', 'Models Used'),
			streak: tr('Streak', 'Streak'),
			bestDay: tr('Hari Terbaik', 'Best Day'),
			avgDaily: tr('Rata-rata Harian', 'Daily Average'),
			viewOnTokscale: tr('Lihat di Tokscale', 'View on Tokscale'),
			unavailable: tr('Data tidak tersedia saat ini.', 'Data is currently unavailable.'),
			stale: tr('Data mungkin sudah usang.', 'Data may be outdated.'),
			updatedAt: tr('Diperbarui', 'Updated'),
		},
		skills: {
			number:   '05. Skills',
			title:    tr('Tech Universe',      'Tech Universe'),
			subtitle: tr(
				'Ekosistem teknologi yang saya kuasai — arahkan kursor untuk jeda dan lihat detail.',
				'The technology ecosystem I master — hover to pause and see details.',
			),
		},
		contact: {
			number:   '06. Contact',
			title:    tr('Hubungi Saya',       'Contact Me'),
			subtitle: tr(
				'Tertarik untuk berkolaborasi atau punya pertanyaan? Jangan ragu untuk menghubungi saya.',
				'Interested in collaborating or have a question? Feel free to reach out.',
			),
		},
	},
	exp: {
		keyAchievements: tr('Pencapaian Utama', 'Key Achievements'),
		techStack:       tr('Tech Stack',       'Tech Stack'),
	},
	projects: {
		featured:    tr('Unggulan',           'Featured'),
		viewCase:    tr('Lihat Studi Kasus',  'View Case Study'),
		viewCaseS:   tr('Lihat studi kasus',  'View case study'),
		viewMore:    tr('Lihat Selengkapnya', 'View More'),
		privateRepo: tr('Repo Privat',        'Private Repo'),
		privateHint: tr(
			'Kode sumber tidak tersedia secara publik karena dimiliki klien.',
			'Source code is not publicly available due to client ownership.',
		),
	},
	contact: {
		labelName:        tr('Nama',                    'Name'),
		labelEmail:       tr('Email',                   'Email'),
		labelSubject:     tr('Perihal',                 'Subject'),
		labelMessage:     tr('Pesan',                   'Message'),
		phName:           tr('Nama lengkap',            'Full name'),
		phEmail:          tr('email@example.com',       'email@example.com'),
		phSubject:        tr('Perihal',                 'Subject'),
		phMessage:        tr('Tulis pesan Anda...',     'Write your message...'),
		send:             tr('Kirim Pesan',             'Send Message'),
		labelPhone:       tr('Telepon',                 'Phone'),
		labelLocation:    tr('Lokasi',                  'Location'),
		findMe:           tr('Temukan saya di',         'Find me on'),
	},
	footer: {
		builtWith: tr('Dibangun dengan', 'Built with'),
		rights:    tr('Hak cipta dilindungi.', 'All rights reserved.'),
		toTop:     tr('Ke atas', 'Back to top'),
	},
	projectDetail: {
		back:        tr('Kembali ke proyek',           'Back to projects'),
		role:        tr('Peran',                       'Role'),
		client:      tr('Klien',                       'Client'),
		duration:    tr('Durasi',                      'Duration'),
		team:        tr('Tim',                         'Team'),
		techStack:   tr('Tech Stack',                  'Tech Stack'),
		visitSite:   tr('Kunjungi Situs',              'Visit Site'),
		viewSource:  tr('Lihat Source',                'View Source'),
		preview:     tr('Pratinjau placeholder',       'Preview placeholder'),
		previewHint: tr('Tangkapan layar segera hadir','Real screenshot coming soon'),
		statusLive:    tr('Tayang',           'Live'),
		statusInDev:   tr('Dalam Pengembangan','In Development'),
		statusArchive: tr('Diarsipkan',       'Archived'),
	},
} as const;
