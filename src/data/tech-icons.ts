import {
	siLaravel, siVuedotjs, siPhp, siMysql, siTailwindcss, siBootstrap,
	siJavascript, siDotnet, siHtml5, siCss, siGit, siNodedotjs,
	siTypescript, siDocker, siReact, siNextdotjs, siNestjs, siExpress,
	siMongodb, siGraphql, siGithub, siGitlab, siLinux, siFlutter,
} from 'simple-icons';

/**
 * Maps a tech-stack label (as written in experience.ts / projects data)
 * to its simple-icons glyph + brand color.
 *
 * Labels that have no matching icon (e.g. "REST API", "CypressJS", "C#")
 * are intentionally omitted — callers should filter undefined results.
 */
const TECH_ICON_BY_TITLE: Record<string, { hex: string; path: string }> = {
	// Build a lookup by simple-icons `title` so future tech strings just work
	// if their wording matches the upstream title.
};

const icons = [
	siLaravel, siVuedotjs, siPhp, siMysql, siTailwindcss, siBootstrap,
	siJavascript, siDotnet, siHtml5, siCss, siGit, siNodedotjs,
	siTypescript, siDocker, siReact, siNextdotjs, siNestjs, siExpress,
	siMongodb, siGraphql, siGithub, siGitlab, siLinux, siFlutter,
];

for (const icon of icons) {
	TECH_ICON_BY_TITLE[icon.title] = { hex: icon.hex, path: icon.path };
}

/** Explicit aliases for the wording used in the data files. */
const TECH_ICON_ALIASES: Record<string, string> = {
	'Vue.js': 'Vue.js',
	'Node.js': 'Node.js',
	'Tailwind CSS': 'Tailwind CSS',
	'HTML': 'HTML5',
	'CSS': 'CSS',
	'JavaScript': 'JavaScript',
	'TypeScript': 'TypeScript',
	'.NET': '.NET',
	'C#': '.NET', // closest brand glyph; C# has no dedicated simple-icon
	'React': 'React',
	'Next.js': 'Next.js',
	'Nest.js': 'NestJS',
	'NestJS': 'NestJS',
	'Express': 'Express',
	'MongoDB': 'MongoDB',
	'GraphQL': 'GraphQL',
	'Docker': 'Docker',
	'Git': 'Git',
	'GitHub': 'GitHub',
	'GitLab': 'GitLab',
	'Linux': 'Linux',
	'Flutter': 'Flutter',
	'MySQL': 'MySQL',
	'PHP': 'PHP',
	'Laravel': 'Laravel',
	'Bootstrap': 'Bootstrap',
};

/**
 * Resolve a tech-stack label to an icon glyph, or undefined when none exists.
 */
export function getTechIcon(label: string): { hex: string; path: string } | undefined {
	const key = TECH_ICON_ALIASES[label] ?? label;
	return TECH_ICON_BY_TITLE[key];
}

/**
 * Resolve a list of tech-stack labels to icons, dropping labels without icons.
 */
export function getTechIcons(labels: string[]): { label: string; hex: string; path: string }[] {
	return labels
		.map((label) => {
			const icon = getTechIcon(label);
			return icon ? { label, ...icon } : undefined;
		})
		.filter((entry): entry is { label: string; hex: string; path: string } => entry !== undefined);
}
