import type { Tr } from '../i18n';
import { tr } from '../i18n';

export interface Education {
	period: string;
	degree: Tr;
	institution: string;
	description: Tr;
}

export const educations: Education[] = [
	{
		period: 'Aug 2021 — Jul 2025',
		degree: tr(
			'Diploma (D4) — Teknik Informatika',
			'Diploma (D4) — Informatics Engineering',
		),
		institution: 'State Polytechnic of Malang (Polinema)',
		description: tr(
			'Lulus dengan IPK 3.83/4.00. Fokus pada rekayasa perangkat lunak, pengembangan web, dan sistem informasi. Aktif di organisasi Workshop Riset Informatika (WRI).',
			'Graduated with a 3.83/4.00 GPA. Focused on software engineering, web development, and information systems. Active in the Informatics Research Workshop (WRI) organization.',
		),
	},
	{
		period: 'Jun 2017 — May 2020',
		degree: tr(
			'SMA — Matematika & Ilmu Pengetahuan Alam',
			'High School — Mathematics & Science',
		),
		institution: 'SMAN 01 Batu',
		description: tr(
			'Jurusan IPA. Menumbuhkan dasar logika dan problem solving yang menjadi fondasi dalam dunia pengembangan perangkat lunak.',
			'Mathematics & Science major. Built the foundation of logic and problem solving that became the basis for software development.',
		),
	},
];
