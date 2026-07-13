export interface ActivityDataPoint {
	date: string;
	tokens: number;
	cost: number;
	requests: number;
	input?: number;
	output?: number;
	cacheRead?: number;
	cacheWrite?: number;
	reasoning?: number;
	clients?: { name: string; tokens: number }[];
	modelUsage?: { model: string; client: string; tokens: number; cost: number }[];
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

interface CellInfo {
	x: number;
	y: number;
	size: number;
	date: string;
	point: ActivityDataPoint | undefined;
}

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

function fmtNum(n: number): string {
	return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function drawHeatmap(
	canvas: HTMLCanvasElement,
	activity: ActivityDataPoint[],
	paletteName: PaletteName,
): CellInfo[] {
	const rect = canvas.getBoundingClientRect();
	const width = Math.max(300, rect.width);
	const dpr = window.devicePixelRatio || 1;
	const ctx = canvas.getContext('2d');
	if (!ctx) return [];

	const now = new Date();
	const end = new Date(now);
	end.setDate(end.getDate() + (6 - end.getDay()));
	const start = new Date(end);
	start.setFullYear(start.getFullYear() - 1);
	start.setDate(start.getDate() - start.getDay());

	const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
	const totalWeeks = Math.ceil(totalDays / 7);

	const activityByDate = new Map(activity.map((point) => [point.date, point]));
	const maxTokens = Math.max(...activity.map((point) => Number(point.tokens) || 0), 0);

	const left = 36;
	const top = 28;
	const right = 8;
	const gridWidth = width - left - right;
	const cellGap = Math.max(2, Math.min(3, Math.floor(gridWidth / totalWeeks * 0.2)));
	const cell = Math.max(4, Math.floor((gridWidth - (totalWeeks - 1) * cellGap) / totalWeeks));
	const height = top + 7 * (cell + cellGap) + 4;
	const radius = Math.max(1, Math.round(cell * 0.2));
	const palette = palettes[paletteName] ?? palettes.green;
	const muted = getThemeTextColor();

	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	canvas.style.height = height + 'px';
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);

	ctx.font = '600 10px "JetBrains Mono", monospace';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = muted;
	const drawnMonths = new Set<string>();
	for (let index = 0; index < totalDays; index += 1) {
		const current = new Date(start);
		current.setDate(start.getDate() + index);
		if (current.getDate() !== 1) continue;
		const key = current.getFullYear() + '-' + current.getMonth();
		if (drawnMonths.has(key)) continue;
		drawnMonths.add(key);
		const week = Math.floor(index / 7);
		const x = left + week * (cell + cellGap);
		if (x + 30 < width - right) {
			ctx.fillText(current.toLocaleString('en-US', { month: 'short' }).toUpperCase(), x, top - 12);
		}
	}

	const cells: CellInfo[] = [];

	for (let index = 0; index < totalDays; index += 1) {
		const current = new Date(start);
		current.setDate(start.getDate() + index);
		const week = Math.floor(index / 7);
		const day = current.getDay();
		const x = left + week * (cell + cellGap);
		const y = top + day * (cell + cellGap);
		const dateKey = toDateKey(current);
		const point = activityByDate.get(dateKey);
		const intensity = point ? getIntensity(point.tokens, maxTokens) : 0;

		ctx.fillStyle = palette[intensity];
		drawRoundedRect(ctx, x, y, cell, cell, radius);

		cells.push({ x, y, size: cell, date: dateKey, point });
	}

	if (activity.length === 0) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = muted;
		ctx.font = '600 11px "JetBrains Mono", monospace';
		ctx.fillText('No activity data available', width / 2, top + 3.5 * (cell + cellGap));
	}

	return cells;
}

function createTooltip(): HTMLDivElement {
	let tooltip = document.getElementById('ai-usage-tooltip') as HTMLDivElement | null;
	if (tooltip) return tooltip;

	tooltip = document.createElement('div');
	tooltip.id = 'ai-usage-tooltip';
	tooltip.style.cssText = `
		position: fixed;
		z-index: 9999;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s ease;
		padding: 10px 14px;
		border-radius: 12px;
		background: oklch(0.2 0.02 260 / 0.95);
		backdrop-filter: blur(8px);
		border: 1px solid oklch(0.4 0.02 260 / 0.3);
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		color: oklch(0.9 0 0);
		white-space: nowrap;
		min-width: 260px;
		max-width: 320px;
	`;
	document.body.appendChild(tooltip);
	return tooltip;
}

function showTooltip(tooltip: HTMLDivElement, cellInfo: CellInfo, canvasRect: DOMRect) {
	const date = new Date(cellInfo.date + 'T00:00:00');
	const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

	const row = (label: string, value: string) => `<div style="display:flex;justify-content:space-between;gap:28px"><span style="color:oklch(0.7 0 0)">${label}</span><strong>${value}</strong></div>`;
	let content = `<div style="font-weight:700;margin-bottom:10px">${dateStr}</div>`;
	if (cellInfo.point && cellInfo.point.tokens > 0) {
		const point = cellInfo.point;
		content += `<div style="display:flex;flex-direction:column;gap:5px">${row('Total tokens', fmtNum(point.tokens))}`;
		content += `<div style="height:1px;background:oklch(0.5 0.02 260 / .3);margin:5px 0"></div>`;
		content += row('Input', fmtNum(point.input ?? 0));
		content += row('Output', fmtNum(point.output ?? 0));
		content += row('Cache read', fmtNum(point.cacheRead ?? 0));
		if ((point.cacheWrite ?? 0) > 0) content += row('Cache write', fmtNum(point.cacheWrite ?? 0));
		if ((point.reasoning ?? 0) > 0) content += row('Reasoning', fmtNum(point.reasoning ?? 0));
		content += row('Cost', `$${point.cost.toFixed(2)}`);
		content += row('Messages', point.requests.toLocaleString('en-US'));
		if (point.clients?.length) {
			content += `<div style="height:1px;background:oklch(0.5 0.02 260 / .3);margin:5px 0"></div><div style="font-size:10px;font-weight:700;letter-spacing:.12em;color:oklch(0.7 0 0)">CLIENTS</div>`;
			for (const client of point.clients) content += row(client.name, fmtNum(client.tokens));
		}
		content += `</div>`;
	} else {
		content += `<div style="color:oklch(0.6 0 0)">No activity</div>`;
	}

	tooltip.innerHTML = content;
	tooltip.style.opacity = '1';

	const cellCenterX = canvasRect.left + cellInfo.x + cellInfo.size / 2;
	const cellTopY = canvasRect.top + cellInfo.y;

	const tooltipRect = tooltip.getBoundingClientRect();
	let tooltipX = cellCenterX - tooltipRect.width / 2;
	let tooltipY = cellTopY - tooltipRect.height - 8;

	if (tooltipY < 4) {
		tooltipY = canvasRect.top + cellInfo.y + cellInfo.size + 8;
	}
	if (tooltipX < 4) tooltipX = 4;
	if (tooltipX + tooltipRect.width > window.innerWidth - 4) {
		tooltipX = window.innerWidth - tooltipRect.width - 4;
	}

	tooltip.style.left = tooltipX + 'px';
	tooltip.style.top = tooltipY + 'px';
}

function hideTooltip(tooltip: HTMLDivElement) {
	tooltip.style.opacity = '0';
}

function findCell(cells: CellInfo[], mouseX: number, mouseY: number): CellInfo | null {
	for (const cell of cells) {
		if (
			mouseX >= cell.x &&
			mouseX <= cell.x + cell.size &&
			mouseY >= cell.y &&
			mouseY <= cell.y + cell.size
		) {
			return cell;
		}
	}
	return null;
}

function initHeatmap(activity: ActivityDataPoint[]) {
	const canvas = document.querySelector<HTMLCanvasElement>('[data-ai-usage-heatmap]');
	if (!canvas) return;

	const palette: PaletteName = 'green';
	let cells: CellInfo[] = [];
	const tooltip = createTooltip();

	const render = () => {
		cells = drawHeatmap(canvas, activity, palette);
	};

	canvas.style.cursor = 'pointer';

	canvas.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const scaleX = canvas.width / dpr / rect.width;
		const scaleY = canvas.height / dpr / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;
		const cell = findCell(cells, mouseX, mouseY);

		if (cell) {
			showTooltip(tooltip, cell, rect);
		} else {
			hideTooltip(tooltip);
		}
	});

	canvas.addEventListener('mouseleave', () => {
		hideTooltip(tooltip);
	});

	canvas.addEventListener('click', (e) => {
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const scaleX = canvas.width / dpr / rect.width;
		const scaleY = canvas.height / dpr / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;
		const cell = findCell(cells, mouseX, mouseY);

		if (cell) {
			showTooltip(tooltip, cell, rect);
		}
	});

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

function getSortValue(row: HTMLTableRowElement, key: string): string | number {
	if (key === 'name') return row.dataset.modelName?.toLowerCase() ?? '';
	const value = row.dataset[`model${key.charAt(0).toUpperCase()}${key.slice(1)}`];
	return Number(value ?? 0);
}

function initModelSorting(): void {
	const table = document.querySelector<HTMLTableElement>('[data-ai-usage-model-table]');
	if (!table) return;
	const body = table.tBodies.item(0);
	if (!body) return;

	let activeKey = 'tokens';
	let direction: 'asc' | 'desc' = 'desc';
	let page = 1;
	let pageSize = 10;
	const pageSizeSelect = document.querySelector<HTMLSelectElement>('[data-ai-usage-page-size]');
	const pageInfo = document.querySelector<HTMLElement>('[data-ai-usage-page-info]');
	const previous = document.querySelector<HTMLButtonElement>('[data-ai-usage-page-prev]');
	const next = document.querySelector<HTMLButtonElement>('[data-ai-usage-page-next]');
	const renderPage = () => {
		const rows = Array.from(body.rows);
		const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
		page = Math.min(Math.max(page, 1), totalPages);
		rows.forEach((row, index) => {
			row.hidden = index < (page - 1) * pageSize || index >= page * pageSize;
		});
		if (pageInfo) pageInfo.textContent = `${page} of ${totalPages}`;
		if (previous) previous.disabled = page === 1;
		if (next) next.disabled = page === totalPages;
	};

	for (const button of table.querySelectorAll<HTMLButtonElement>('[data-ai-usage-sort]')) {
		button.addEventListener('click', () => {
			const key = button.dataset.aiUsageSort ?? 'tokens';
			if (activeKey === key) direction = direction === 'asc' ? 'desc' : 'asc';
			else {
				activeKey = key;
				direction = key === 'name' ? 'asc' : 'desc';
			}

			const rows = Array.from(body.rows);
			rows.sort((a, b) => {
				const left = getSortValue(a, activeKey);
				const right = getSortValue(b, activeKey);
				const result = typeof left === 'string' && typeof right === 'string'
					? left.localeCompare(right)
					: Number(left) - Number(right);
				return direction === 'asc' ? result : -result;
			});

			body.append(...rows);
			page = 1;
			renderPage();
			for (const sortButton of table.querySelectorAll<HTMLButtonElement>('[data-ai-usage-sort]')) {
				const isActive = sortButton.dataset.aiUsageSort === activeKey;
				sortButton.setAttribute('aria-sort', isActive ? direction : 'none');
			}
		});
	}

	pageSizeSelect?.addEventListener('change', () => {
		pageSize = Number(pageSizeSelect.value);
		page = 1;
		renderPage();
	});
	previous?.addEventListener('click', () => { page -= 1; renderPage(); });
	next?.addEventListener('click', () => { page += 1; renderPage(); });
	renderPage();
}

function initModelComparison(activity: ActivityDataPoint[]): void {
	const canvas = document.querySelector<HTMLCanvasElement>('[data-ai-usage-model-chart]');
	const range = document.querySelector<HTMLSelectElement>('[data-ai-usage-range]');
	const client = document.querySelector<HTMLSelectElement>('[data-ai-usage-client]');
	const legend = document.querySelector<HTMLElement>('[data-ai-usage-model-legend]');
	if (!canvas || !range || !client || !legend) return;
	const colors = ['#22d3ee', '#60a5fa', '#facc15', '#34d399', '#c084fc', '#fb7185', '#a3e635', '#f97316'];

	const render = () => {
		const days = activity.slice(-Number(range.value));
		const totals = new Map<string, number>();
		for (const day of days) for (const usage of day.modelUsage ?? []) {
			if (client.value !== 'all' && usage.client !== client.value) continue;
			totals.set(usage.model, (totals.get(usage.model) ?? 0) + usage.tokens);
		}
		const models = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name]) => name);
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, rect.width, rect.height);
		const pad = { l: 8, r: 8, t: 12, b: 28 };
		const width = rect.width - pad.l - pad.r;
		const height = rect.height - pad.t - pad.b;
		ctx.strokeStyle = 'rgba(148,163,184,.14)';
		ctx.lineWidth = 1;
		for (let i = 0; i <= 4; i += 1) {
			const y = pad.t + height * i / 4;
			ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + width, y); ctx.stroke();
		}
		const values = models.map((model) => days.map((day) =>
			(day.modelUsage ?? []).filter((usage) => usage.model === model && (client.value === 'all' || usage.client === client.value)).reduce((sum, usage) => sum + usage.tokens, 0),
		));
		const max = Math.max(1, ...values.flat());
		values.forEach((series, seriesIndex) => {
			ctx.strokeStyle = colors[seriesIndex]; ctx.lineWidth = 2; ctx.beginPath();
			series.forEach((value, index) => {
				const x = pad.l + (days.length <= 1 ? width / 2 : width * index / (days.length - 1));
				const y = pad.t + height - value / max * height;
				index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
			});
			ctx.stroke();
		});
		ctx.fillStyle = getThemeTextColor();
		ctx.font = '10px "JetBrains Mono", monospace';
		if (days.length) {
			ctx.fillText(days[0].date, pad.l, rect.height - 7);
			ctx.textAlign = 'right';
			ctx.fillText(days.at(-1)?.date ?? '', rect.width - pad.r, rect.height - 7);
			ctx.textAlign = 'left';
		}
		legend.innerHTML = models.map((model, index) => `<span style="display:inline-flex;align-items:center;gap:6px"><i style="width:8px;height:8px;border-radius:999px;background:${colors[index]}"></i>${model}</span>`).join('') || '<span>No model usage for this filter</span>';
	};

	range.addEventListener('change', render);
	client.addEventListener('change', render);
	new ResizeObserver(render).observe(canvas);
	render();
}

export function initAiUsageCharts(): void {
	if (typeof window === 'undefined') return;
	if (!document.getElementById(AI_USAGE_SECTION_ID)) return;

	const { activity } = parseAiUsageData();
	initHeatmap(activity);
	initModelComparison(activity);
	initModelSorting();
}
