/**
 * fetch-ai-usage.mjs
 * Fetches public Tokscale profile for cicaco07 and normalizes into src/data/ai-usage.json
 *
 * Usage:
 *   node scripts/fetch-ai-usage.mjs           # fetch and write
 *   node scripts/fetch-ai-usage.mjs --dry-run # fetch, print summary, no write
 *
 * Env overrides (for testing):
 *   TOKSCALE_PROFILE_URL=<url>   override primary profile URL
 *   TOKSCALE_API_URL=<url>       override fallback API URL
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT, 'src/data/ai-usage.json');

const USERNAME = 'cicaco07';
const PROFILE_URL = process.env.TOKSCALE_PROFILE_URL ?? `https://tokscale.ai/u/${USERNAME}`;
const API_URL = process.env.TOKSCALE_API_URL ?? `https://tokscale.ai/api/leaderboard?period=all&limit=100&search=${USERNAME}`;

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Schema helpers ──────────────────────────────────────────────────────────

function emptySnapshot(overrides = {}) {
  return {
    username: USERNAME,
    profileUrl: `https://tokscale.ai/u/${USERNAME}`,
    available: false,
    fetchedAt: null,
    lastSuccessfulFetch: null,
    stale: false,
    error: null,
    totals: { tokens: 0, cost: 0, requests: 0, activeDays: 0 },
    activity: [],
    models: [],
    clients: [],
    stats: { streak: 0, bestDay: null, avgDailyTokens: 0 },
    ...overrides,
  };
}

function isValidSnapshot(data) {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.username === 'string' &&
    typeof data.available === 'boolean' &&
    data.totals &&
    typeof data.totals === 'object'
  );
}

// ─── Existing snapshot ───────────────────────────────────────────────────────

async function readExistingSnapshot() {
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (isValidSnapshot(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; portfolio-bot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/json',
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Primary: parse __NEXT_DATA__ from HTML ──────────────────────────────────

function extractNextData(html) {
  // Match <script id="__NEXT_DATA__" type="application/json">...</script>
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractBalancedValue(source, startIndex) {
  const opener = source[startIndex];
  const closer = opener === '[' ? ']' : opener === '{' ? '}' : null;
  if (!closer) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIndex, i + 1);
      }
    }
  }

  return null;
}

function findPushArgument(html, startIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < html.length; i += 1) {
    const char = html[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return html.slice(startIndex + 1, i);
      }
    }
  }

  return null;
}

function collectStrings(value, parts = []) {
  if (typeof value === 'string') {
    parts.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, parts);
  }
  return parts;
}

function extractNextFlightText(html) {
  const marker = 'self.__next_f.push(';
  const parts = [];
  let searchFrom = 0;

  while (searchFrom < html.length) {
    const markerIndex = html.indexOf(marker, searchFrom);
    if (markerIndex === -1) break;

    const argumentStart = markerIndex + marker.length - 1;
    const argument = findPushArgument(html, argumentStart);
    searchFrom = markerIndex + marker.length;
    if (!argument) continue;

    try {
      parts.push(...collectStrings(JSON.parse(argument)));
    } catch {
      // Ignore malformed flight chunks; other chunks may still contain profile data.
    }
  }

  return parts.join('');
}

function parseJsonValueNearKey(source, key, beforeIndex = source.length) {
  const keyIndex = source.lastIndexOf(`"${key}":`, beforeIndex);
  if (keyIndex === -1) return null;

  const colonIndex = source.indexOf(':', keyIndex);
  const valueStart = source.slice(colonIndex + 1).search(/[\[{]/);
  if (valueStart === -1) return null;

  const absoluteStart = colonIndex + 1 + valueStart;
  const rawValue = extractBalancedValue(source, absoluteStart);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function normalizeFromFlightText(flightText) {
  const contributionsIndex = flightText.indexOf('"contributions":[');
  if (contributionsIndex === -1) return null;

  const contributions = parseJsonValueNearKey(flightText, 'contributions', contributionsIndex + '"contributions"'.length);
  if (!Array.isArray(contributions)) return null;

  const stats = parseJsonValueNearKey(flightText, 'stats', contributionsIndex) ?? {};
  const models = parseJsonValueNearKey(flightText, 'modelUsage', contributionsIndex) ?? [];
  const clients = new Map();

  const normalizedActivity = contributions.map((entry) => {
    const entryClients = Array.isArray(entry.clients) ? entry.clients : [];
    for (const client of entryClients) {
      const key = client.client ?? client.name ?? '';
      if (!key) continue;
      const existing = clients.get(key) ?? { name: key, tokens: 0, cost: 0 };
      existing.tokens += Number(client.tokens?.input ?? 0) + Number(client.tokens?.output ?? 0) + Number(client.tokens?.cacheRead ?? 0) + Number(client.tokens?.cacheWrite ?? 0) + Number(client.tokens?.reasoning ?? 0);
      existing.cost += Number(client.cost ?? 0);
      clients.set(key, existing);
    }

    const tokenBreakdown = entry.tokenBreakdown ?? entry.totals?.breakdown ?? entry.tokens ?? {};
    const messages = entryClients.reduce((sum, client) => sum + Number(client.messages ?? 0), 0);
    return {
      date: entry.date ?? '',
      tokens: Number(entry.totals?.tokens ?? entry.tokens ?? 0),
      cost: Number(entry.totals?.cost ?? entry.cost ?? 0),
      requests: messages || Number(entry.totals?.messages ?? entry.messages ?? 0),
      input: Number(tokenBreakdown.input ?? 0),
      output: Number(tokenBreakdown.output ?? 0),
      cacheRead: Number(tokenBreakdown.cacheRead ?? 0),
      cacheWrite: Number(tokenBreakdown.cacheWrite ?? 0),
      reasoning: Number(tokenBreakdown.reasoning ?? 0),
      clients: entryClients.map((client) => ({
        name: client.client ?? client.name ?? '',
        tokens: Number(client.tokens?.input ?? 0) + Number(client.tokens?.output ?? 0) + Number(client.tokens?.cacheRead ?? 0) + Number(client.tokens?.cacheWrite ?? 0) + Number(client.tokens?.reasoning ?? 0),
      })).filter((client) => client.name && client.tokens > 0),
    };
  }).filter((entry) => entry.date && entry.tokens > 0);

  const totalTokens = Number(stats.totalTokens ?? normalizedActivity.reduce((sum, entry) => sum + entry.tokens, 0));
  const totalCost = Number(stats.totalCost ?? normalizedActivity.reduce((sum, entry) => sum + entry.cost, 0));
  const totalRequests = Number(stats.submissionCount ?? normalizedActivity.reduce((sum, entry) => sum + entry.requests, 0));

  const normalizedModels = Array.isArray(models)
    ? models.map((m) => ({
        name: typeof m === 'string' ? m : (m.name ?? m.model ?? m.model_name ?? ''),
        tokens: typeof m === 'string' ? 0 : Number(m.tokens ?? m.token_count ?? 0),
        cost: typeof m === 'string' ? 0 : Number(m.cost ?? m.usd ?? m.total_cost ?? m.totalCost ?? 0),
        percentage: typeof m === 'string' ? 0 : Number(m.percentage ?? m.pct ?? 0),
      })).filter((m) => m.name && m.tokens > 0)
    : [];

  const normalizedClients = Array.from(clients.values())
    .map((client) => ({
      name: client.name,
      tokens: client.tokens,
      percentage: totalTokens > 0 ? (client.tokens / totalTokens) * 100 : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens);

  return {
    totals: {
      tokens: totalTokens,
      cost: totalCost,
      requests: totalRequests,
      activeDays: Number(stats.activeDays ?? normalizedActivity.length),
    },
    activity: normalizedActivity,
    models: normalizedModels,
    clients: normalizedClients,
    stats: {
      streak: 0,
      bestDay: normalizedActivity.reduce((best, entry) => (entry.tokens > (best?.tokens ?? 0) ? entry : best), null)?.date ?? null,
      avgDailyTokens: normalizedActivity.length > 0 ? Math.round(totalTokens / normalizedActivity.length) : 0,
    },
  };
}

function extractFlightData(html) {
  const flightText = extractNextFlightText(html);
  if (!flightText) return null;
  return normalizeFromFlightText(flightText);
}

function normalizeFromNextData(nextData) {
  // Defensive traversal — structure may change
  const props = nextData?.props?.pageProps ?? nextData?.props ?? {};

  // Try common paths where profile data might live
  const profile =
    props.profile ??
    props.user ??
    props.data?.profile ??
    props.data?.user ??
    props.userData ??
    null;

  const stats = props.stats ?? props.data?.stats ?? profile?.stats ?? {};
  const activity = props.activity ?? props.data?.activity ?? profile?.activity ?? [];
  const models = props.models ?? props.data?.models ?? profile?.models ?? [];
  const clients = props.clients ?? props.data?.clients ?? profile?.clients ?? [];
  const totals = props.totals ?? props.data?.totals ?? profile?.totals ?? stats?.totals ?? {};

  // Normalize activity array
  const normalizedActivity = Array.isArray(activity)
    ? activity.map((a) => ({
        date: a.date ?? a.day ?? '',
        tokens: Number(a.tokens ?? a.token_count ?? 0),
        cost: Number(a.cost ?? a.usd ?? 0),
        requests: Number(a.requests ?? a.request_count ?? 0),
      }))
    : [];

  // Normalize models array
  const normalizedModels = Array.isArray(models)
    ? models.map((m) => ({
        name: m.name ?? m.model ?? m.model_name ?? '',
        tokens: Number(m.tokens ?? m.token_count ?? 0),
        cost: Number(m.cost ?? m.usd ?? m.total_cost ?? m.totalCost ?? 0),
        percentage: Number(m.percentage ?? m.pct ?? 0),
      }))
    : [];

  // Normalize clients array
  const normalizedClients = Array.isArray(clients)
    ? clients.map((c) => ({
        name: c.name ?? c.client ?? c.client_name ?? '',
        tokens: Number(c.tokens ?? c.token_count ?? 0),
        percentage: Number(c.percentage ?? c.pct ?? 0),
      }))
    : [];

  const totalTokens = Number(
    totals.tokens ?? totals.token_count ?? stats.total_tokens ?? stats.tokens ?? 0
  );
  const totalCost = Number(totals.cost ?? totals.usd ?? stats.total_cost ?? stats.cost ?? 0);
  const totalRequests = Number(
    totals.requests ?? totals.request_count ?? stats.total_requests ?? stats.requests ?? 0
  );
  const activeDays = Number(
    totals.activeDays ?? totals.active_days ?? stats.active_days ?? normalizedActivity.length ?? 0
  );

  const streak = Number(stats.streak ?? stats.current_streak ?? 0);
  const bestDay = stats.bestDay ?? stats.best_day ?? null;
  const avgDailyTokens = Number(
    stats.avgDailyTokens ?? stats.avg_daily_tokens ?? (activeDays > 0 ? Math.round(totalTokens / activeDays) : 0)
  );

  // If we got nothing meaningful, signal failure
  if (totalTokens === 0 && normalizedActivity.length === 0 && normalizedModels.length === 0) {
    return null;
  }

  return {
    totals: { tokens: totalTokens, cost: totalCost, requests: totalRequests, activeDays },
    activity: normalizedActivity,
    models: normalizedModels,
    clients: normalizedClients,
    stats: { streak, bestDay, avgDailyTokens },
  };
}

async function fetchPrimary() {
  const res = await fetchWithTimeout(PROFILE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${PROFILE_URL}`);

  const html = await res.text();

  const nextData = extractNextData(html);
  const normalized = nextData ? normalizeFromNextData(nextData) : extractFlightData(html);
  if (!normalized) throw new Error('Could not extract meaningful data from __NEXT_DATA__');

  return normalized;
}

// ─── Fallback: leaderboard API ───────────────────────────────────────────────

async function fetchFallback() {
  const res = await fetchWithTimeout(API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${API_URL}`);

  const json = await res.json();

  // Leaderboard may return { data: [...] } or [...] directly
  const list = Array.isArray(json) ? json : (json.data ?? json.users ?? json.results ?? []);

  const entry = list.find(
    (u) =>
      (u.username ?? u.name ?? u.handle ?? '').toLowerCase() === USERNAME.toLowerCase()
  );

  if (!entry) throw new Error(`User ${USERNAME} not found in leaderboard response`);

  const tokens = Number(entry.totalTokens ?? entry.tokens ?? entry.token_count ?? entry.total_tokens ?? 0);
  const cost = Number(entry.totalCost ?? entry.cost ?? entry.usd ?? entry.total_cost ?? 0);
  const requests = Number(entry.submissionCount ?? entry.requests ?? entry.request_count ?? entry.total_requests ?? 0);

  if (tokens === 0 && requests === 0) {
    throw new Error('Leaderboard entry has no meaningful token/request data');
  }

  const freshnessLastUpdated = entry.submissionFreshness?.lastUpdated ?? null;
  const isStale = entry.submissionFreshness?.isStale ?? false;
  const lastSuccessfulFetch = freshnessLastUpdated ?? new Date().toISOString();

  return {
    totals: { tokens, cost, requests, activeDays: 0 },
    activity: [],
    models: [],
    clients: [],
    stats: { streak: 0, bestDay: null, avgDailyTokens: 0 },
    _fallbackMeta: { lastSuccessfulFetch, stale: isStale },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date().toISOString();
  let fetchedData = null;
  let fetchError = null;

  // Try primary, then fallback
  try {
    fetchedData = await fetchPrimary();
    console.log('[fetch-ai-usage] Primary fetch succeeded (__NEXT_DATA__)');
  } catch (primaryErr) {
    console.warn(`[fetch-ai-usage] Primary failed: ${primaryErr.message}`);
    try {
      fetchedData = await fetchFallback();
      console.log('[fetch-ai-usage] Fallback fetch succeeded (leaderboard API)');
    } catch (fallbackErr) {
      fetchError = `Primary: ${primaryErr.message} | Fallback: ${fallbackErr.message}`;
      console.warn(`[fetch-ai-usage] Fallback failed: ${fallbackErr.message}`);
    }
  }

  let snapshot;

  if (fetchedData) {
    const { _fallbackMeta, ...fetchedDataClean } = fetchedData;
    snapshot = emptySnapshot({
      available: true,
      fetchedAt: now,
      lastSuccessfulFetch: _fallbackMeta?.lastSuccessfulFetch ?? now,
      stale: _fallbackMeta?.stale ?? false,
      error: null,
      ...fetchedDataClean,
    });
  } else {
    // Failure path — preserve existing snapshot
    const existing = await readExistingSnapshot();
    if (existing) {
      snapshot = {
        ...existing,
        available: false,
        fetchedAt: now,
        error: fetchError,
        stale: existing.lastSuccessfulFetch
          ? (Date.now() - new Date(existing.lastSuccessfulFetch).getTime()) > 7 * 24 * 60 * 60 * 1000
          : true,
      };
      console.warn('[fetch-ai-usage] Using preserved existing snapshot with updated error state');
    } else {
      snapshot = emptySnapshot({
        fetchedAt: now,
        error: fetchError,
      });
      console.warn('[fetch-ai-usage] No existing snapshot — writing safe unavailable snapshot');
    }
  }

  // ── Summary (always printed) ──
  console.log('\n── AI Usage Summary ──────────────────────────────');
  console.log(`  username:      ${snapshot.username}`);
  console.log(`  available:     ${snapshot.available}`);
  console.log(`  fetchedAt:     ${snapshot.fetchedAt}`);
  console.log(`  tokens:        ${snapshot.totals.tokens.toLocaleString()}`);
  console.log(`  cost:          $${snapshot.totals.cost.toFixed ? snapshot.totals.cost.toFixed(4) : snapshot.totals.cost}`);
  console.log(`  requests:      ${snapshot.totals.requests.toLocaleString()}`);
  console.log(`  activeDays:    ${snapshot.totals.activeDays}`);
  console.log(`  models:        ${snapshot.models.length}`);
  console.log(`  clients:       ${snapshot.clients.length}`);
  console.log(`  activityDays:  ${snapshot.activity.length}`);
  console.log(`  streak:        ${snapshot.stats.streak}`);
  console.log(`  error:         ${snapshot.error ?? 'none'}`);
  console.log('──────────────────────────────────────────────────\n');

  if (DRY_RUN) {
    console.log('[fetch-ai-usage] --dry-run: no file written.');
    return;
  }

  // Validate before writing
  if (!isValidSnapshot(snapshot)) {
    console.error('[fetch-ai-usage] ABORT: snapshot failed validation — file not written');
    process.exit(1);
  }

  // ── No-change detection ──
  // Only skip write when both old and new are available (don't skip unavailable→unavailable
  // so fetchedAt stays fresh and error state is always persisted)
  if (snapshot.available) {
    const existing = await readExistingSnapshot();
    if (existing && existing.available) {
      const dataFields = (s) => JSON.stringify({
        totals: s.totals,
        activity: s.activity,
        models: s.models,
        clients: s.clients,
        stats: s.stats,
      });
      if (dataFields(snapshot) === dataFields(existing)) {
        console.log('[fetch-ai-usage] No changes detected — skipping write to avoid noisy diff.');
        return;
      }
    }
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
  console.log(`[fetch-ai-usage] Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[fetch-ai-usage] Unexpected error:', err.message);
  process.exit(1);
});
