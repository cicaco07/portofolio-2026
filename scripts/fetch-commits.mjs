/**
 * fetch-commits.mjs
 * Fetches commit activity for cicaco07 from GitHub (GraphQL) and GitLab (REST),
 * aggregates per-date counts, and writes to src/data/commit-activity.json.
 *
 * Usage:
 *   node scripts/fetch-commits.mjs           # fetch and write
 *   node scripts/fetch-commits.mjs --dry-run # fetch, print summary, no write
 *
 * Env vars:
 *   GH_PAT         GitHub Personal Access Token (repo/read:user scope)
 *   GITLAB_TOKEN   GitLab Personal Access Token (read_api scope, optional)
 *   GITLAB_USER_ID Numeric GitLab user ID, optional fallback if /users lookup is blocked
 *   GITLAB_AUTHOR  Commit author search value, defaults to cicaco07
 *   GITLAB_REF_NAME Branch/ref to count, for example "develop"; defaults to each project's default branch
 *   GITLAB_ALL_REFS Set to "true" to scan every branch/tag instead of default branch only
 *   GITLAB_REBASE   Set to "true" once to replace old GitLab counts after fixing overcount rules
 *   GITHUB_START_DATE Start date for GitHub activity, defaults to 2025-07-01
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT, 'src/data/commit-activity.json');

const USERNAME = 'cicaco07';
const DRY_RUN = process.argv.includes('--dry-run');

const GH_PAT = process.env.GH_PAT ?? '';
const GITLAB_TOKEN = process.env.GITLAB_TOKEN ?? '';
const GITLAB_USER_ID = process.env.GITLAB_USER_ID ?? '';
const GITLAB_AUTHOR = process.env.GITLAB_AUTHOR ?? USERNAME;
const GITLAB_REF_NAME = process.env.GITLAB_REF_NAME ?? '';
const GITLAB_ALL_REFS = process.env.GITLAB_ALL_REFS === 'true';
const GITLAB_REBASE = process.env.GITLAB_REBASE === 'true';
const GITHUB_START_DATE = process.env.GITHUB_START_DATE ?? process.env.COMMIT_START_DATE ?? '2025-07-01';

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';
const GITLAB_REST = 'https://gitlab.com/api/v4';

function getGitHubStartDate() {
  const date = new Date(`${GITHUB_START_DATE}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid GITHUB_START_DATE '${GITHUB_START_DATE}', expected YYYY-MM-DD`);
  }
  return date;
}

// ─── Schema helpers ──────────────────────────────────────────────────────────

/**
 * Returns a safe empty snapshot matching the commit-activity.json schema.
 * @param {object} overrides - Fields to override on the default snapshot.
 */
function emptySnapshot(overrides = {}) {
  return {
    username: USERNAME,
    available: false,
    fetchedAt: null,
    lastSuccessfulFetch: null,
    stale: false,
    error: null,
    totals: { all: 0, github: 0, gitlab: 0 },
    activity: [],
    github: { available: false, error: null, total: 0 },
    gitlab: { available: false, error: null, total: 0 },
    ...overrides,
  };
}

/**
 * Validates that a parsed JSON object looks like a commit-activity snapshot.
 * @param {unknown} data
 * @returns {boolean}
 */
function isValidSnapshot(data) {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.username === 'string' &&
    typeof data.available === 'boolean' &&
    data.totals &&
    typeof data.totals === 'object' &&
    Array.isArray(data.activity)
  );
}

// ─── Existing snapshot ───────────────────────────────────────────────────────

/**
 * Reads and validates the existing output file.
 * Returns null if missing, unreadable, or invalid.
 */
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

/**
 * fetch() wrapper with AbortController timeout.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Converts a Date (or ISO string) to a YYYY-MM-DD string in UTC.
 * @param {Date|string} d
 * @returns {string}
 */
function toDateStr(d) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function isOnOrAfterGitHubStart(dateStr) {
  return dateStr >= GITHUB_START_DATE;
}

// ─── GitHub source ───────────────────────────────────────────────────────────

/**
 * Fetches contribution data from GitHub GraphQL API using contributionsCollection.
 * Covers activity from GITHUB_START_DATE until now.
 * Returns a Map<dateStr, count> of commit contributions per day.
 *
 * Requires GH_PAT env var. Throws if token is missing or request fails.
 */
async function fetchGitHub() {
  if (!GH_PAT) {
    throw new Error('GH_PAT env var not set');
  }

  const now = new Date();
  const to = now.toISOString();
  const from = getGitHubStartDate().toISOString();

  // GitHub's contributionsCollection accepts this fixed portfolio window.
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetchWithTimeout(
    GITHUB_GRAPHQL,
    {
      method: 'POST',
      headers: {
        Authorization: `bearer ${GH_PAT}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-bot/1.0',
      },
      body: JSON.stringify({ query, variables: { login: USERNAME, from, to } }),
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub GraphQL HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
  }

  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks)) {
    throw new Error('GitHub response missing contributionCalendar.weeks');
  }

  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const week of weeks) {
    for (const day of week.contributionDays ?? []) {
      if (day.contributionCount > 0) {
        counts.set(day.date, (counts.get(day.date) ?? 0) + day.contributionCount);
      }
    }
  }

  return counts;
}

// ─── GitLab source ───────────────────────────────────────────────────────────

/**
 * Resolves the numeric GitLab user ID for USERNAME via the users search API.
 * @param {object} headers - Request headers (may include PRIVATE-TOKEN).
 * @returns {Promise<number>}
 */
async function resolveGitLabUserId(headers) {
  if (GITLAB_USER_ID) {
    const parsed = Number(GITLAB_USER_ID);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error('GITLAB_USER_ID must be a positive numeric ID');
    }
    return parsed;
  }

  if (GITLAB_TOKEN) {
    const currentUserRes = await fetchWithTimeout(`${GITLAB_REST}/user`, { headers });
    if (currentUserRes.ok) {
      const currentUser = await currentUserRes.json();
      if (currentUser?.id) return currentUser.id;
    }
  }

  const url = `${GITLAB_REST}/users?username=${encodeURIComponent(USERNAME)}`;
  const res = await fetchWithTimeout(url, { headers });
  if (!res.ok) throw new Error(`GitLab users lookup HTTP ${res.status}`);

  const json = await res.json();
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error(`GitLab user '${USERNAME}' not found`);
  }

  const user = json.find((u) => u.username?.toLowerCase() === USERNAME.toLowerCase());
  if (!user) throw new Error(`GitLab user '${USERNAME}' not found in results`);

  return user.id;
}

/**
 * Fetches push events for a GitLab user, paginating via `after` cursor.
 * Sums push_data.commit_count per date (UTC YYYY-MM-DD).
 * Returns a Map<dateStr, count>.
 *
 * GITLAB_TOKEN is optional — without it, rate limits are lower but it still works.
 */
async function fetchGitLabEvents(headers) {
  const userId = await resolveGitLabUserId(headers);

  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  /** @type {Map<string, number>} */
  const counts = new Map();
  let page = 1;
  let done = false;

  while (!done) {
    const url =
      `${GITLAB_REST}/users/${userId}/events` +
      `?action=pushed&per_page=100&page=${page}`;

    const res = await fetchWithTimeout(url, { headers });
    if (!res.ok) throw new Error(`GitLab events HTTP ${res.status} (page ${page})`);

    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) break;

    for (const event of events) {
      const createdAt = event.created_at ? new Date(event.created_at) : null;
      if (!createdAt) continue;

      // Stop paginating once we're past the configured portfolio window.
      if (createdAt < cutoff) {
        done = true;
        break;
      }

      const dateStr = toDateStr(createdAt);
      const commitCount = Number(event.push_data?.commit_count ?? 0);
      if (commitCount > 0) {
        counts.set(dateStr, (counts.get(dateStr) ?? 0) + commitCount);
      }
    }

    // If we got a full page and haven't hit the cutoff, fetch next page
    if (!done && events.length === 100) {
      page += 1;
    } else {
      done = true;
    }
  }

  return counts;
}

function createGitLabHeaders() {
  const headers = {
    'User-Agent': 'portfolio-bot/1.0',
    Accept: 'application/json',
  };
  if (GITLAB_TOKEN) {
    headers['PRIVATE-TOKEN'] = GITLAB_TOKEN;
  }
  return headers;
}

function getNextPage(res) {
  const nextPage = res.headers.get('x-next-page');
  return nextPage ? Number(nextPage) : 0;
}

async function fetchGitLabProjects(headers) {
  if (!GITLAB_TOKEN) {
    throw new Error('GITLAB_TOKEN env var not set');
  }

  const projects = [];
  let page = 1;

  while (page > 0) {
    const url =
      `${GITLAB_REST}/projects` +
      `?membership=true&simple=true&archived=false&per_page=100&page=${page}`;

    const res = await fetchWithTimeout(url, { headers });
    if (!res.ok) throw new Error(`GitLab projects HTTP ${res.status} (page ${page})`);

    const json = await res.json();
    if (!Array.isArray(json)) throw new Error('GitLab projects response is not an array');

    projects.push(...json);
    page = getNextPage(res);
  }

  return projects;
}

async function fetchGitLabProjectCommits(headers) {
  const projects = await fetchGitLabProjects(headers);
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  /** @type {Map<string, number>} */
  const counts = new Map();
  const seenCommitIds = new Set();
  let duplicateCommits = 0;
  let scannedProjects = 0;

  for (const project of projects) {
    if (!project?.id) continue;

    let page = 1;
    let projectHadCommits = false;

    while (page > 0) {
      const params = new URLSearchParams({
        since,
        per_page: '100',
        page: String(page),
        author: GITLAB_AUTHOR,
      });
      if (GITLAB_ALL_REFS) {
        params.set('all', 'true');
      } else if (GITLAB_REF_NAME) {
        params.set('ref_name', GITLAB_REF_NAME);
      }
      const url = `${GITLAB_REST}/projects/${encodeURIComponent(project.id)}/repository/commits?${params}`;

      const res = await fetchWithTimeout(url, { headers });
      if (res.status === 403 || res.status === 404) break;
      if (res.status === 400 && GITLAB_REF_NAME) break;
      if (!res.ok) {
        throw new Error(
          `GitLab commits HTTP ${res.status} (${project.path_with_namespace ?? project.id}, page ${page})`,
        );
      }

      const commits = await res.json();
      if (!Array.isArray(commits)) {
        throw new Error(`GitLab commits response is not an array (${project.path_with_namespace ?? project.id})`);
      }

      for (const commit of commits) {
        const commitId = commit.id ?? commit.short_id;
        if (commitId) {
          if (seenCommitIds.has(commitId)) {
            duplicateCommits += 1;
            continue;
          }
          seenCommitIds.add(commitId);
        }

        const date = commit.committed_date ?? commit.created_at;
        if (!date) continue;

        const dateStr = toDateStr(date);
        counts.set(dateStr, (counts.get(dateStr) ?? 0) + 1);
        projectHadCommits = true;
      }

      page = getNextPage(res);
    }

    if (projectHadCommits) scannedProjects += 1;
  }

  console.log(
    `[fetch-commits] GitLab scanned ${projects.length} visible projects (${GITLAB_ALL_REFS ? 'all refs' : GITLAB_REF_NAME ? `ref ${GITLAB_REF_NAME}` : 'default branch only'}), ${scannedProjects} with matching commits, ${duplicateCommits} duplicate commits skipped`,
  );

  return counts;
}

async function fetchGitLab() {
  const headers = createGitLabHeaders();
  if (GITLAB_TOKEN) return fetchGitLabProjectCommits(headers);
  return fetchGitLabEvents(headers);
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

/**
 * Merges two date→count Maps into a sorted activity array.
 * @param {Map<string, number>} githubCounts
 * @param {Map<string, number>} gitlabCounts
 * @returns {{ activity: Array, totals: object }}
 */
function aggregate(githubCounts, gitlabCounts) {
  const allDates = new Set([...githubCounts.keys(), ...gitlabCounts.keys()]);

  const activity = Array.from(allDates)
    .sort()
    .map((date) => {
      const gh = githubCounts.get(date) ?? 0;
      const gl = gitlabCounts.get(date) ?? 0;
      return { date, count: gh + gl, github: gh, gitlab: gl };
    });

  const githubTotal = [...githubCounts.values()].reduce((s, n) => s + n, 0);
  const gitlabTotal = [...gitlabCounts.values()].reduce((s, n) => s + n, 0);

  return {
    activity,
    totals: {
      all: githubTotal + gitlabTotal,
      github: githubTotal,
      gitlab: gitlabTotal,
    },
  };
}

/**
 * Keeps previously stored per-source counts as a non-decreasing floor.
 * This protects historical totals when a private repository is deleted,
 * transferred, or no longer visible to the GitHub/GitLab token.
 *
 * @param {object|null} existing
 * @param {Array<{date: string, count: number, github: number, gitlab: number}>} freshActivity
 * @param {{ preserveGithub?: boolean, preserveGitlab?: boolean }} options
 * @returns {{ activity: Array, totals: object, preserved: { github: number, gitlab: number } }}
 */
function preserveHistoricalActivity(existing, freshActivity, options = {}) {
  const preserveGithub = options.preserveGithub ?? true;
  const preserveGitlab = options.preserveGitlab ?? true;
  const byDate = new Map();

  for (const point of freshActivity) {
    if (!point?.date) continue;
    byDate.set(point.date, {
      date: point.date,
      github: isOnOrAfterGitHubStart(point.date) ? Number(point.github ?? 0) : 0,
      gitlab: Number(point.gitlab ?? 0),
    });
  }

  const preserved = { github: 0, gitlab: 0 };

  for (const oldPoint of existing?.activity ?? []) {
    if (!oldPoint?.date) continue;

    const current = byDate.get(oldPoint.date) ?? {
      date: oldPoint.date,
      github: 0,
      gitlab: 0,
    };

    const oldGithub = preserveGithub && isOnOrAfterGitHubStart(oldPoint.date) ? Number(oldPoint.github ?? 0) : 0;
    const oldGitlab = preserveGitlab ? Number(oldPoint.gitlab ?? 0) : 0;

    if (oldGithub > current.github) preserved.github += oldGithub - current.github;
    if (oldGitlab > current.gitlab) preserved.gitlab += oldGitlab - current.gitlab;

    current.github = Math.max(current.github, oldGithub);
    current.gitlab = Math.max(current.gitlab, oldGitlab);
    byDate.set(oldPoint.date, current);
  }

  const activity = Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((point) => ({
      date: point.date,
      count: point.github + point.gitlab,
      github: point.github,
      gitlab: point.gitlab,
    }));

  const totals = activity.reduce(
    (acc, point) => {
      acc.github += point.github;
      acc.gitlab += point.gitlab;
      acc.all += point.count;
      return acc;
    },
    { all: 0, github: 0, gitlab: 0 },
  );

  return { activity, totals, preserved };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date().toISOString();

  // ── Fetch GitHub (graceful failure) ──
  let githubCounts = new Map();
  let githubMeta = { available: false, error: null, total: 0 };

  try {
    githubCounts = await fetchGitHub();
    const total = [...githubCounts.values()].reduce((s, n) => s + n, 0);
    githubMeta = { available: true, error: null, total };
    console.log(`[fetch-commits] GitHub OK — ${githubCounts.size} active days, ${total} commits`);
  } catch (err) {
    githubMeta = { available: false, error: err.message, total: 0 };
    console.warn(`[fetch-commits] GitHub failed: ${err.message}`);
  }

  // ── Fetch GitLab (graceful failure) ──
  let gitlabCounts = new Map();
  let gitlabMeta = { available: false, error: null, total: 0 };

  try {
    gitlabCounts = await fetchGitLab();
    const total = [...gitlabCounts.values()].reduce((s, n) => s + n, 0);
    gitlabMeta = { available: true, error: null, total };
    console.log(`[fetch-commits] GitLab OK — ${gitlabCounts.size} active days, ${total} commits`);
  } catch (err) {
    gitlabMeta = { available: false, error: err.message, total: 0 };
    console.warn(`[fetch-commits] GitLab failed: ${err.message}`);
  }

  const atLeastOneSucceeded = githubMeta.available || gitlabMeta.available;

  let snapshot;

  if (atLeastOneSucceeded) {
    const existing = await readExistingSnapshot();
    const fresh = aggregate(githubCounts, gitlabCounts);
    const { activity, totals, preserved } = preserveHistoricalActivity(existing, fresh.activity, {
      preserveGithub: true,
      preserveGitlab: !GITLAB_REBASE,
    });
    const partialError = [
      githubMeta.error ? `GitHub: ${githubMeta.error}` : null,
      gitlabMeta.error ? `GitLab: ${gitlabMeta.error}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    if (preserved.github > 0 || preserved.gitlab > 0) {
      console.log(
        `[fetch-commits] Preserved historical floor — GitHub +${preserved.github}, GitLab +${preserved.gitlab}`,
      );
    }

    if (GITLAB_REBASE) {
      console.log('[fetch-commits] GITLAB_REBASE=true - old GitLab counts were not used as a floor');
    }

    githubMeta.total = totals.github;
    gitlabMeta.total = totals.gitlab;

    snapshot = emptySnapshot({
      available: true,
      fetchedAt: now,
      lastSuccessfulFetch: now,
      stale: false,
      error: partialError || null,
      totals,
      activity,
      github: githubMeta,
      gitlab: gitlabMeta,
    });
  } else {
    // Both sources failed — preserve existing snapshot with updated error state
    const existing = await readExistingSnapshot();
    const combinedError = [
      githubMeta.error ? `GitHub: ${githubMeta.error}` : null,
      gitlabMeta.error ? `GitLab: ${gitlabMeta.error}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    if (existing) {
      snapshot = {
        ...existing,
        available: false,
        fetchedAt: now,
        error: combinedError,
        stale: existing.lastSuccessfulFetch
          ? Date.now() - new Date(existing.lastSuccessfulFetch).getTime() > 7 * 24 * 60 * 60 * 1000
          : true,
        github: githubMeta,
        gitlab: gitlabMeta,
      };
      console.warn('[fetch-commits] Both sources failed — preserving existing snapshot with updated error state');
    } else {
      snapshot = emptySnapshot({
        fetchedAt: now,
        error: combinedError,
        github: githubMeta,
        gitlab: gitlabMeta,
      });
      console.warn('[fetch-commits] Both sources failed — writing safe unavailable snapshot');
    }
  }

  // ── Summary (always printed) ──
  console.log('\n── Commit Activity Summary ───────────────────────');
  console.log(`  username:      ${snapshot.username}`);
  console.log(`  available:     ${snapshot.available}`);
  console.log(`  fetchedAt:     ${snapshot.fetchedAt}`);
  console.log(`  total commits: ${snapshot.totals.all}`);
  console.log(`  github:        ${snapshot.totals.github} commits (available: ${snapshot.github.available})`);
  console.log(`  gitlab:        ${snapshot.totals.gitlab} commits (available: ${snapshot.gitlab.available})`);
  console.log(`  active days:   ${snapshot.activity.length}`);
  console.log(`  error:         ${snapshot.error ?? 'none'}`);
  console.log('──────────────────────────────────────────────────\n');

  if (DRY_RUN) {
    console.log('[fetch-commits] --dry-run: no file written.');
    return;
  }

  // Validate before writing
  if (!isValidSnapshot(snapshot)) {
    console.error('[fetch-commits] ABORT: snapshot failed validation — file not written');
    process.exit(1);
  }

  // ── No-change detection ──
  // Only skip write when both old and new are available (don't skip unavailable→unavailable
  // so fetchedAt stays fresh and error state is always persisted)
  if (snapshot.available) {
    const existing = await readExistingSnapshot();
    if (existing && existing.available) {
      const dataFields = (s) =>
        JSON.stringify({ totals: s.totals, activity: s.activity });
      if (dataFields(snapshot) === dataFields(existing)) {
        console.log('[fetch-commits] No changes detected — skipping write to avoid noisy diff.');
        return;
      }
    }
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
  console.log(`[fetch-commits] Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[fetch-commits] Unexpected error:', err.message);
  process.exit(1);
});
