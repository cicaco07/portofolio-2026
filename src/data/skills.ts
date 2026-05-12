import {
	siLaravel, siVuedotjs, siPhp, siNodedotjs, siMysql, siMongodb,
	siDocker, siGit, siTypescript, siJavascript, siNestjs, siNextdotjs,
	siBootstrap, siTailwindcss, siHtml5, siCss, siExpress, siFlutter,
	siReact, siLinux, siGithub, siGitlab, siGraphql, siDotnet,
} from 'simple-icons';

export interface Skill {
	title: string;
	hex: string;
	path: string;
}

export const coreSkills: Skill[]   = [siLaravel, siVuedotjs];

export const innerRing: Skill[]    = [
	siPhp, siJavascript, siTypescript, siNodedotjs, siNextdotjs, siNestjs,
];

export const middleRing: Skill[]   = [
	siMysql, siMongodb, siGraphql, siTailwindcss, siBootstrap, siHtml5, siCss, siReact,
];

export const outerRing: Skill[]    = [
	siDocker, siGit, siGithub, siGitlab, siLinux, siExpress, siFlutter, siDotnet,
];

export const allSkills: Skill[]    = [
	...coreSkills, ...innerRing, ...middleRing, ...outerRing,
];

export const BENTO_SIZE_PATTERN = [
	'l', 's', 's', 'm', 's', 'l', 's', 'm',
	's', 's', 'm', 's', 's', 'l', 's', 's',
	'm', 's', 's', 'l', 's', 'm', 's', 's',
] as const;
