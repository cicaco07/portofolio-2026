export interface CommitDataPoint {
	date: string;
	count: number;
	github: number;
	gitlab: number;
}

interface CommitTotals {
	all: number;
	github: number;
	gitlab: number;
}

interface CommitSourceInfo {
	available: boolean;
	error: string | null;
	total: number;
}

type CommitPayload = {
	activity?: CommitDataPoint[];
	totals?: CommitTotals;
	github?: CommitSourceInfo;
	gitlab?: CommitSourceInfo;
};

const COMMIT_DATA_ID = 'commit-activity-data';
const COMMIT_CANVAS_ID = 'commit-heatmap-canvas';
const MAX_INTENSITY_COMMIT_COUNT = 10;

const palette = {
	empty: 'rgba(148, 163, 184, 0.12)',
	level1: '#0e4429',
	level2: '#006d32',
	level3: '#26a641',
	level4: '#39d353',
};

function parseCommitData(): {
	activity: CommitDataPoint[];
	totals: CommitTotals;
	github: CommitSourceInfo;
	gitlab: CommitSourceInfo;
} {
	const dataScript = document.getElementById(COMMIT_DATA_ID);
	if (!(dataScript instanceof HTMLScriptElement) || !dataScript.textContent?.trim()) {
		return {
			activity: [],
			totals: { all: 0, github: 0, gitlab: 0 },
			github: { available: false, error: null, total: 0 },
			gitlab: { available: false, error: null, total: 0 },
		};
	}

	try {
		const parsed = JSON.parse(dataScript.textContent) as CommitPayload;
		return {
			activity: Array.isArray(parsed.activity) ? parsed.activity : [],
			totals: parsed.totals ?? { all: 0, github: 0, gitlab: 0 },
			github: parsed.github ?? { available: false, error: null, total: 0 },
			gitlab: parsed.gitlab ?? { available: false, error: null, total: 0 },
		};
	} catch {
		return {
			activity: [],
			totals: { all: 0, github: 0, gitlab: 0 },
			github: { available: false, error: null, total: 0 },
			gitlab: { available: false, error: null, total: 0 },
		};
	}
}

function getThemeTextColor(): string {
	return document.documentElement.getAttribute('data-theme') === 'acid' ? '#475569' : '#8aa0bd';
}

function startOfWeek(date: Date): Date {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	next.setDate(next.getDate() - next.getDay());
	return next;
}

function endOfWeek(date: Date): Date {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	next.setDate(next.getDate() + (6 - next.getDay()));
	return next;
}

function getLatestActivityDate(activity: CommitDataPoint[]): Date {
	const dated = activity
		.map((p) => new Date(`${p.date}T00:00:00`))
		.filter((d) => !Number.isNaN(d.getTime()))
		.sort((a, b) => b.getTime() - a.getTime());
	const latest = dated[0];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return latest && latest > today ? latest : today;
}

function getEarliestActivityDate(activity: CommitDataPoint[]): Date {
	const dated = activity
		.map((p) => new Date(`${p.date}T00:00:00`))
		.filter((d) => !Number.isNaN(d.getTime()))
		.sort((a, b) => a.getTime() - b.getTime());
	const earliest = dated[0] ?? new Date();
	earliest.setHours(0, 0, 0, 0);
	return earliest;
}

function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function getIntensity(count: number): number {
	if (count <= 0) return 0;
	if (count >= MAX_INTENSITY_COMMIT_COUNT) return 4;
	return Math.max(1, Math.ceil((count / MAX_INTENSITY_COMMIT_COUNT) * 4));
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

type CellMap = Map<string, { x: number; y: number; size: number; point: CommitDataPoint | undefined; inRange: boolean }>;

function drawHeatmap(
	canvas: HTMLCanvasElement,
	activity: CommitDataPoint[],
): CellMap {
	const rect = canvas.getBoundingClientRect();
	const containerWidth = Math.max(600, rect.width || canvas.offsetWidth || 600);
	const dpr = window.devicePixelRatio || 1;
	const ctx = canvas.getContext('2d');
	const cellMap: CellMap = new Map();
	if (!ctx) return cellMap;

	const activityByDate = new Map(activity.map((p) => [p.date, p]));
	const start = startOfWeek(getEarliestActivityDate(activity));
	const end = endOfWeek(getLatestActivityDate(activity));
	const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
	const totalWeeks = Math.ceil(totalDays / 7);

	const compact = containerWidth < 700;
	const left = compact ? 36 : 52;
	const top = compact ? 36 : 54;
	const labelGap = 10;
	const legendHeight = compact ? 28 : 42;
	const cellGap = compact ? 2 : 4;
	const cell = compact ? 12 : 18;
	const requiredGridWidth = totalWeeks * cell + (totalWeeks - 1) * cellGap;
	const width = Math.max(containerWidth, left + requiredGridWidth + 28);
	const gridHeight = 7 * (cell + cellGap) - cellGap;
	const height = top + gridHeight + legendHeight + 26;

	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);

	const muted = getThemeTextColor();

	ctx.font = `${compact ? '600 9px' : '600 11px'} "Fira Code", monospace`;
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = muted;
	for (const [label, row] of [['Mon', 1], ['Wed', 3], ['Fri', 5]] as const) {
		ctx.fillText(label, left - labelGap, top + row * (cell + cellGap) + cell / 2);
	}

	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	ctx.font = `${compact ? '600 10px' : '600 12px'} "Fira Code", monospace`;
	const monthLabels = new Set<string>();
	for (let i = 0; i < totalDays; i++) {
		const current = new Date(start);
		current.setDate(start.getDate() + i);
		const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
		if (current.getDate() !== 1 || monthLabels.has(monthKey)) continue;
		const isFirstMonthLabel = monthLabels.size === 0;
		monthLabels.add(monthKey);
		const week = Math.floor(i / 7);
		const month = current.toLocaleString('en-US', { month: 'short' });
		const label = isFirstMonthLabel || current.getMonth() === 0 ? `${month} ${current.getFullYear()}` : month;
		ctx.fillStyle = muted;
		ctx.fillText(label, left + week * (cell + cellGap), top - 10);
	}

	for (let i = 0; i < totalDays; i++) {
		const current = new Date(start);
		current.setDate(start.getDate() + i);
		const week = Math.floor(i / 7);
		const day = current.getDay();
		const x = left + week * (cell + cellGap);
		const y = top + day * (cell + cellGap);
		const dateKey = toDateKey(current);
		const point = activityByDate.get(dateKey);
		const intensity = point ? getIntensity(point.count) : 0;

		const colors = [palette.empty, palette.level1, palette.level2, palette.level3, palette.level4];
		ctx.fillStyle = colors[intensity];
		drawRoundedRect(ctx, x, y, cell, cell, 2);

		cellMap.set(dateKey, { x, y, size: cell, point, inRange: true });
	}

	if (activity.length === 0) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = muted;
		ctx.font = '600 11px "Fira Code", monospace';
		ctx.fillText('No activity data available', width / 2, top + 3.5 * (cell + cellGap));
	}

	const legendY = top + gridHeight + 14;
	const legendCellSize = compact ? 10 : 13;
	const legendGap = compact ? 3 : 4;
	ctx.font = `${compact ? '10px' : '11px'} "Fira Code", monospace`;
	ctx.textBaseline = 'middle';
	ctx.fillStyle = muted;

	const legendColors = [palette.empty, palette.level1, palette.level2, palette.level3, palette.level4];
	const legendTotalWidth = legendColors.length * (legendCellSize + legendGap) - legendGap;
	const lessText = '1';
	const moreText = '10+';
	const lessWidth = ctx.measureText(lessText).width;
	const legendStartX = width - legendTotalWidth - ctx.measureText(moreText).width - lessWidth - 16;

	ctx.textAlign = 'right';
	ctx.fillText(lessText, legendStartX - 4, legendY + legendCellSize / 2);

	for (let i = 0; i < legendColors.length; i++) {
		ctx.fillStyle = legendColors[i];
		drawRoundedRect(ctx, legendStartX + i * (legendCellSize + legendGap), legendY, legendCellSize, legendCellSize, 2);
	}

	ctx.fillStyle = muted;
	ctx.textAlign = 'left';
	ctx.fillText(moreText, legendStartX + legendTotalWidth + 4, legendY + legendCellSize / 2);

	return cellMap;
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00');
	return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function setupTooltip(canvas: HTMLCanvasElement, getCellMap: () => CellMap): void {
	let tooltip = document.getElementById('commit-heatmap-tooltip');
	if (!tooltip) {
		tooltip = document.createElement('div');
		tooltip.id = 'commit-heatmap-tooltip';
		tooltip.style.cssText = [
			'position:fixed',
			'z-index:9999',
			'pointer-events:none',
			'padding:8px 12px',
			'border-radius:8px',
			'font-size:12px',
			'font-family:"Fira Code",monospace',
			'line-height:1.6',
			'white-space:pre',
			'opacity:0',
			'transition:opacity 0.1s',
			'background:var(--color-base-200,#1e293b)',
			'color:var(--color-base-content,#e2e8f0)',
			'border:1px solid rgba(148,163,184,0.15)',
			'box-shadow:0 4px 16px rgba(0,0,0,0.3)',
		].join(';');
		document.body.appendChild(tooltip);
	}

	canvas.addEventListener('mousemove', (e) => {
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		const scaleX = (canvas.width / dpr) / rect.width;
		const scaleY = (canvas.height / dpr) / rect.height;
		const mx = (e.clientX - rect.left) * scaleX;
		const my = (e.clientY - rect.top) * scaleY;

		const cellMap = getCellMap();
		let found: { dateKey: string; cell: CellMap extends Map<string, infer V> ? V : never } | null = null;
		for (const [dateKey, cell] of cellMap) {
			if (
				mx >= cell.x &&
				mx <= cell.x + cell.size &&
				my >= cell.y &&
				my <= cell.y + cell.size &&
				cell.inRange
			) {
				found = { dateKey, cell };
				break;
			}
		}

		if (!found || !tooltip) {
			if (tooltip) tooltip.style.opacity = '0';
			return;
		}

		const { dateKey, cell } = found;
		const point = cell.point;
		const count = point?.count ?? 0;
		const gh = point?.github ?? 0;
		const gl = point?.gitlab ?? 0;

		const lines = [
			formatDate(dateKey),
			`${count} commit${count !== 1 ? 's' : ''}`,
			...(count > 0 ? [`GitHub: ${gh} · GitLab: ${gl}`] : []),
		];
		tooltip.textContent = lines.join('\n');
		tooltip.style.opacity = '1';

		const tw = tooltip.offsetWidth;
		const th = tooltip.offsetHeight;
		let tx = e.clientX + 12;
		let ty = e.clientY - th / 2;
		if (tx + tw > window.innerWidth - 8) tx = e.clientX - tw - 12;
		if (ty < 8) ty = 8;
		if (ty + th > window.innerHeight - 8) ty = window.innerHeight - th - 8;
		tooltip.style.left = `${tx}px`;
		tooltip.style.top = `${ty}px`;
	});

	canvas.addEventListener('mouseleave', () => {
		if (tooltip) tooltip.style.opacity = '0';
	});
}

export function initCommitHeatmap(): void {
	const canvas = document.getElementById(COMMIT_CANVAS_ID);
	if (!(canvas instanceof HTMLCanvasElement)) return;

	const { activity } = parseCommitData();

	const render = () => {
		const cellMap = drawHeatmap(canvas, activity);
		return cellMap;
	};

	let cellMap = render();
	setupTooltip(canvas, () => cellMap);

	const resizeObserver = new ResizeObserver(() => {
		cellMap = render();
	});
	resizeObserver.observe(canvas);

	const themeObserver = new MutationObserver(() => {
		cellMap = render();
	});
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	});

	window.addEventListener(
		'beforeunload',
		() => {
			resizeObserver.disconnect();
			themeObserver.disconnect();
		},
		{ once: true },
	);
}
