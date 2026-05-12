export interface Education {
	period: string;
	degree: string;
	institution: string;
	description: string;
}

export const educations: Education[] = [
	{
		period: 'Aug 2021 — Jul 2025',
		degree: 'Diploma (D4) — Informatics Engineering',
		institution: 'State Polytechnic of Malang (Polinema)',
		description:
			'Fresh graduate dengan IPK 3.83/4.00. Fokus pada rekayasa perangkat lunak, pengembangan web, dan sistem informasi. Aktif di organisasi Workshop Riset Informatika (WRI).',
	},
	{
		period: 'Jun 2017 — May 2020',
		degree: 'SMA — Mathematics & Science',
		institution: 'SMAN 01 Batu',
		description:
			'Jurusan IPA (Mathematics & Science). Menumbuhkan dasar logika dan problem solving yang menjadi fondasi dalam dunia pengembangan perangkat lunak.',
	},
];
