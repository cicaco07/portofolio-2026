export interface ActivityDataPoint {
	date: string;
	tokens: number;
	cost: number;
	requests: number;
}

export interface ModelDataPoint {
	name: string;
	tokens: number;
	cost?: number;
	percentage: number;
}

type AiUsagePayload = {
	activity?: ActivityDataPoint[];
	models?: ModelDataPoint[];
};

type PaletteName = 'green' | 'blue' | 'amber';
type RenderMode = '2d' | '3d';

const AI_USAGE_SECTION_ID = 'ai-usage';
const AI_USAGE_DATA_ID = 'ai-usage-data';

const palettes: Record<PaletteName, string[]> = {
	green: ['#17212b', '#174d35', '#239954', '#51d879', '#8dffac'],
	blue: ['#17212b', '#183b72', '#2563eb', '#38bdf8', '#bfdbfe'],
	amber: ['#17212b', '#5f3516', '#d97706', '#fbbf24', '#fde68a'],
};

function parseAiUsageData(): { activity: ActivityDataPoint[]; models: ModelDataPoint[] } {
	const dataScript = document.getElementById(AI_USAGE_DATA_ID);
	if (!(dataScript instanceof HTMLScriptElement) || !dataScript.textContent?.trim()) {
		return { activity: [], models: [] };
	}

	try {
		const parsed = JSON.parse(dataScript.textContent) as AiUsagePayload;
		return {
			activity: Array.isArray(parsed.activity) ? parsed.activity : [],
			models: Array.isArray(parsed.models) ? parsed.models : [],
		};
	} catch {
		return { activity: [], models: [] };
	}
}

function getThemeTextColor(): string {
	return document.documentElement.getAttribute('data-theme') === 'acid' ? '#475569' : '#8aa0bd';
}

function getYear(activity: ActivityDataPoint[]): number {
	const dated = activity
		.map((point) => new Date(point.date))
		.filter((date) => !Number.isNaN(date.getTime()))
		.sort((a, b) => b.getTime() - a.getTime());

	return (dated[0] ?? new Date()).getFullYear();
}

function startOfCalendar(year: number): Date {
	const date = new Date(year, 0, 1);
	date.setDate(date.getDate() - date.getDay());
	return date;
}

function endOfCalendar(year: number): Date {
	const date = new Date(year, 11, 31);
	date.setDate(date.getDate() + (6 - date.getDay()));
	return date;
}

function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function getIntensity(tokens: number, maxTokens: number): number {
	if (tokens <= 0 || maxTokens <= 0) return 0;
	if (tokens >= maxTokens) return 4;
	return Math.max(1, Math.ceil((tokens / maxTokens) * 4));
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
	ctx.fill();
}

function drawHeatmap(
	canvas: HTMLCanvasElement,
	activity: ActivityDataPoint[],
	paletteName: PaletteName,
	mode: RenderMode,
) {
	const rect = canvas.getBoundingClientRect();
	const width = Math.max(680, rect.width);
	const height = Math.max(168, rect.height);
	const dpr = window.devicePixelRatio || 1;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);

	const year = getYear(activity);
	const activityByDate = new Map(activity.map((point) => [point.date, point]));
	const maxTokens = Math.max(...activity.map((point) => Number(point.tokens) || 0), 0);
	const start = startOfCalendar(year);
	const end = endOfCalendar(year);
	const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
	const totalWeeks = Math.ceil(totalDays / 7);
	const left = 48;
	const top = 48;
	const labelGap = 12;
	const gridWidth = width - left - 10;
	const cellGap = width < 760 ? 2 : 3;
	const cell = Math.max(7, Math.min(12, Math.floor((gridWidth - (totalWeeks - 1) * cellGap) / totalWeeks)));
	const radius = mode === '3d' ? 3 : 2;
	const palette = palettes[paletteName] ?? palettes.green;
	const muted = getThemeTextColor();

	ctx.font = '600 10px "Fira Code", monospace';
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = muted;
	for (const [label, row] of [
		['Mon', 1],
		['Wed', 3],
		['Fri', 5],
	] as const) {
		ctx.fillText(label, left - labelGap, top + row * (cell + cellGap) + cell / 2);
	}

	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	const monthLabels = new Set<number>();
	for (let index = 0; index < totalDays; index += 1) {
		const current = new Date(start);
		current.setDate(start.getDate() + index);
		if (current.getFullYear() !== year || current.getDate() !== 1 || monthLabels.has(current.getMonth())) continue;
		monthLabels.add(current.getMonth());
		const week = Math.floor(index / 7);
		ctx.fillText(current.toLocaleString('en-US', { month: 'short' }), left + week * (cell + cellGap), top - 30);
	}

	for (let index = 0; index < totalDays; index += 1) {
		const current = new Date(start);
		current.setDate(start.getDate() + index);
		const week = Math.floor(index / 7);
		const day = current.getDay();
		const x = left + week * (cell + cellGap);
		const y = top + day * (cell + cellGap);
		const inYear = current.getFullYear() === year;
		const point = inYear ? activityByDate.get(toDateKey(current)) : undefined;
		const intensity = point ? getIntensity(point.tokens, maxTokens) : 0;

		ctx.fillStyle = inYear ? palette[intensity] : 'rgba(148, 163, 184, 0.05)';
		if (mode === '3d' && intensity > 0) {
			ctx.shadowColor = palette[intensity];
			ctx.shadowBlur = 8;
			drawRoundedRect(ctx, x, y + 1, cell, cell, radius);
			ctx.shadowBlur = 0;
			ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
			ctx.fillRect(x + 2, y + 2, Math.max(2, cell - 4), 1);
		} else {
			drawRoundedRect(ctx, x, y, cell, cell, radius);
		}
	}

	if (activity.length === 0) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = muted;
		ctx.font = '600 11px "Fira Code", monospace';
		ctx.fillText('No activity data available', width / 2, top + 3.5 * (cell + cellGap));
	}
}

function initHeatmap(activity: ActivityDataPoint[]) {
	const canvas = document.querySelector<HTMLCanvasElement>('[data-ai-usage-heatmap]');
	if (!canvas) return;

	const paletteSelect = document.querySelector<HTMLSelectElement>('[data-ai-usage-palette]');
	const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-ai-usage-mode]'));
	let palette = (paletteSelect?.value as PaletteName | undefined) ?? 'green';
	let mode: RenderMode = '2d';

	const render = () => drawHeatmap(canvas, activity, palette, mode);
	const setMode = (nextMode: RenderMode) => {
		mode = nextMode;
		for (const button of modeButtons) {
			const isActive = button.dataset.aiUsageMode === nextMode;
			button.setAttribute('aria-pressed', String(isActive));
			button.classList.toggle('bg-primary', isActive);
			button.classList.toggle('text-primary-content', isActive);
			button.classList.toggle('text-base-content', !isActive);
			button.classList.toggle('hover:bg-base-content/10', !isActive);
		}
		render();
	};

	paletteSelect?.addEventListener('change', () => {
		palette = (paletteSelect.value as PaletteName) || 'green';
		render();
	});

	for (const button of modeButtons) {
		button.addEventListener('click', () => {
			const nextMode = button.dataset.aiUsageMode === '3d' ? '3d' : '2d';
			setMode(nextMode);
		});
	}

	const resizeObserver = new ResizeObserver(render);
	resizeObserver.observe(canvas);

	const themeObserver = new MutationObserver(render);
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	});

	render();

	window.addEventListener(
		'beforeunload',
		() => {
			resizeObserver.disconnect();
			themeObserver.disconnect();
		},
		{ once: true },
	);
}

export function initAiUsageCharts(): void {
	if (typeof window === 'undefined') return;
	if (!document.getElementById(AI_USAGE_SECTION_ID)) return;

	const { activity } = parseAiUsageData();
	initHeatmap(activity);
}
