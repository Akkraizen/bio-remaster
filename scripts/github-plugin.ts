import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import type { Plugin } from "vite";
import type { RepoInfo } from "../src/model/repo.ts";

const MODULE_ID = "virtual:github-repos";
const RESOLVED_ID = `\0${MODULE_ID}`;
const SOURCE_FILE = "src/model/project.ts";
const CACHE_FILE = "node_modules/.cache/github-repos.json";
const DEV_TTL = 6 * 60 * 60 * 1000;
const TIMEOUT = 6000;
const REPO_PATTERN = /https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/g;

interface Cache {
  savedAt: number;
  repos: Record<string, RepoInfo>;
}

interface GithubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  license: { spdx_id: string | null } | null;
  topics?: string[];
  archived: boolean;
}

export const repoKey = (url: string) => url.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "").toLowerCase();

async function request<T>(url: string): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "bio-build" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchRepo(key: string): Promise<RepoInfo> {
  const base = `https://api.github.com/repos/${key}`;
  const [repo, languages] = await Promise.all([
    request<GithubRepo>(base),
    request<Record<string, number>>(`${base}/languages`)
  ]);
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0) || 1;
  return {
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    license: repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null,
    topics: repo.topics ?? [],
    archived: repo.archived,
    languages: Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([name, bytes]) => ({ name, share: Math.round((bytes / total) * 1000) / 10 }))
  };
}

async function readCache(root: string): Promise<Cache | null> {
  try {
    return JSON.parse(await readFile(path.join(root, CACHE_FILE), "utf8")) as Cache;
  } catch {
    return null;
  }
}

async function writeCache(root: string, repos: Record<string, RepoInfo>) {
  try {
    await mkdir(path.dirname(path.join(root, CACHE_FILE)), { recursive: true });
    await writeFile(path.join(root, CACHE_FILE), JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {}
}

export async function collectRepoKeys(root: string): Promise<string[]> {
  const source = await readFile(path.join(root, SOURCE_FILE), "utf8");
  return [...new Set([...source.matchAll(REPO_PATTERN)].map((match) => repoKey(match[0])))];
}

export async function loadRepos(root: string, fresh: boolean): Promise<Record<string, RepoInfo>> {
  const keys = await collectRepoKeys(root);
  const cache = await readCache(root);
  const cached = cache?.repos ?? {};
  if (!fresh && cache && Date.now() - cache.savedAt < DEV_TTL && keys.every((key) => key in cached)) return cached;
  if (process.env.GITHUB_REPOS === "off") return cached;

  const repos: Record<string, RepoInfo> = {};
  const results = await Promise.allSettled(keys.map(async (key) => [key, await fetchRepo(key)] as const));
  let failed = 0;
  results.forEach((result, index) => {
    if (result.status === "fulfilled") repos[result.value[0]] = result.value[1];
    else {
      failed++;
      const fallback = cached[keys[index]];
      if (fallback) repos[keys[index]] = fallback;
    }
  });
  if (failed) console.warn(`[github-repos] ${failed}/${keys.length} repositories unavailable, using cache`);
  if (failed < keys.length) await writeCache(root, repos);
  return repos;
}

export function githubPlugin(): Plugin {
  let root = "";
  let isBuild = false;

  return {
    name: "github-repos",
    configResolved(config) {
      root = config.root;
      isBuild = config.command === "build";
    },
    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const repos = await loadRepos(root, isBuild);
      return `export const repos = ${JSON.stringify(repos)};`;
    }
  };
}
