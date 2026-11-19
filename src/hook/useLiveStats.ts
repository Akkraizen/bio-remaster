import { reactive } from "vue";

export const profiles = {
  github: "Akkraizen",
  lichess: "Akkraizen",
  chessdotcom: "akkraizen",
  codeforces: "kiNgchev"
} as const;

const CACHE_PREFIX = "live-stats:v2:";
const CACHE_TTL = 10 * 60 * 1000;

export type ResourceStatus = "idle" | "loading" | "ready" | "error";

export interface Resource<T> {
  status: ResourceStatus;
  data: T | null;
}

export interface GithubEvent {
  id: string;
  kind: "pushed" | "created" | "starred" | "opened" | "released";
  repo: string;
  date: string;
}

export interface LanguageShare {
  name: string;
  repos: number;
  share: number;
}

export interface GithubStats {
  repos: number;
  followers: number;
  stars: number;
  languages: string[];
  languageShare: LanguageShare[];
  events: GithubEvent[];
}

export interface ChessStats {
  lichessBlitz: number | null;
  lichessGames: number | null;
  chessBlitz: number | null;
  chessBest: number | null;
  chessTactics: number | null;
  chessRecord: { win: number; loss: number; draw: number } | null;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionStats {
  total: number;
  days: ContributionDay[];
}

export interface CodeforcesStats {
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
}

interface Stats {
  github: Resource<GithubStats>;
  chess: Resource<ChessStats>;
  codeforces: Resource<CodeforcesStats>;
  contributions: Resource<ContributionStats>;
}

const stats = reactive<Stats>({
  github: { status: "idle", data: null },
  chess: { status: "idle", data: null },
  codeforces: { status: "idle", data: null },
  contributions: { status: "idle", data: null }
});

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { time, data } = JSON.parse(raw) as { time: number; data: T };
    return Date.now() - time < CACHE_TTL ? data : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: unknown) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ time: Date.now(), data }));
  } catch {
    // ignore
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<T>;
}

async function settle<T>(url: string): Promise<T | null> {
  try {
    return await getJson<T>(url);
  } catch {
    return null;
  }
}

const eventKinds: Record<string, GithubEvent["kind"]> = {
  PushEvent: "pushed",
  CreateEvent: "created",
  WatchEvent: "starred",
  PullRequestEvent: "opened",
  ReleaseEvent: "released"
};

async function fetchGithub(): Promise<GithubStats> {
  const base = `https://api.github.com/users/${profiles.github}`;
  const [user, repos, events] = await Promise.all([
    getJson<{ public_repos: number; followers: number }>(base),
    getJson<Array<{ fork: boolean; stargazers_count: number; language: string | null }>>(
      `${base}/repos?per_page=100`
    ),
    settle<Array<{ id: string; type: string; repo: { name: string }; created_at: string }>>(
      `${base}/events/public?per_page=30`
    )
  ]);

  const own = repos.filter((repo) => !repo.fork);
  const languageCount = new Map<string, number>();
  for (const repo of own)
    if (repo.language)
      languageCount.set(repo.language, (languageCount.get(repo.language) ?? 0) + 1);

  const seen = new Set<string>();
  const feed: GithubEvent[] = [];
  for (const event of events ?? []) {
    const kind = eventKinds[event.type];
    const key = `${kind}:${event.repo.name}`;
    if (!kind || seen.has(key)) continue;
    seen.add(key);
    feed.push({
      id: event.id,
      kind,
      repo: event.repo.name,
      date: event.created_at
    });
    if (feed.length === 6) break;
  }

  const ranked = [...languageCount.entries()].sort((a, b) => b[1] - a[1]);
  const languageTotal = ranked.reduce((sum, [, count]) => sum + count, 0);

  return {
    repos: user.public_repos,
    followers: user.followers,
    stars: own.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    languages: ranked.slice(0, 4).map(([name]) => name),
    languageShare: ranked.slice(0, 5).map(([name, count]) => ({
      name,
      repos: count,
      share: languageTotal ? count / languageTotal : 0
    })),
    events: feed
  };
}

async function fetchChess(): Promise<ChessStats> {
  const [lichess, chess] = await Promise.all([
    settle<{ perfs?: { blitz?: { rating: number; games: number } } }>(
      `https://lichess.org/api/user/${profiles.lichess}`
    ),
    settle<{
      chess_blitz?: {
        last?: { rating: number };
        best?: { rating: number };
        record?: { win: number; loss: number; draw: number };
      };
      tactics?: { highest?: { rating: number } };
    }>(`https://api.chess.com/pub/player/${profiles.chessdotcom}/stats`)
  ]);

  if (!lichess && !chess) throw new Error("chess sources unavailable");

  return {
    lichessBlitz: lichess?.perfs?.blitz?.rating ?? null,
    lichessGames: lichess?.perfs?.blitz?.games ?? null,
    chessBlitz: chess?.chess_blitz?.last?.rating ?? null,
    chessBest: chess?.chess_blitz?.best?.rating ?? null,
    chessTactics: chess?.tactics?.highest?.rating ?? null,
    chessRecord: chess?.chess_blitz?.record ?? null
  };
}

async function fetchCodeforces(): Promise<CodeforcesStats> {
  const response = await getJson<{
    status: string;
    result: Array<{ rating?: number; maxRating?: number; rank?: string }>;
  }>(`https://codeforces.com/api/user.info?handles=${profiles.codeforces}`);
  const user = response.result[0];
  return {
    rating: user?.rating ?? null,
    maxRating: user?.maxRating ?? null,
    rank: user?.rank ?? null
  };
}

async function fetchContributions(): Promise<ContributionStats> {
  const response = await getJson<{ total: { lastYear?: number }; contributions: ContributionDay[] }>(
    `https://github-contributions-api.jogruber.de/v4/${profiles.github}?y=last`
  );
  const days = response.contributions.map(({ date, count, level }) => ({ date, count, level }));
  return {
    total: response.total.lastYear ?? days.reduce((sum, day) => sum + day.count, 0),
    days
  };
}

const loaders: { [K in keyof Stats]: () => Promise<NonNullable<Stats[K]["data"]>> } = {
  github: fetchGithub,
  chess: fetchChess,
  codeforces: fetchCodeforces,
  contributions: fetchContributions
};

async function load<K extends keyof Stats>(key: K) {
  const resource = stats[key];
  if (resource.status === "loading" || resource.status === "ready") return;

  const cached = readCache<Stats[K]["data"]>(key);
  if (cached) {
    resource.data = cached;
    resource.status = "ready";
    return;
  }

  resource.status = "loading";
  try {
    const data = await loaders[key]();
    resource.data = data;
    resource.status = "ready";
    writeCache(key, data);
  } catch {
    resource.status = "error";
  }
}

export function loadLiveStats() {
  return Promise.all([load("github"), load("chess"), load("codeforces"), load("contributions")]);
}

export function useLiveStats() {
  loadLiveStats();
  return stats;
}
