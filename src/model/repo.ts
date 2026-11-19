export interface RepoLanguage {
  name: string;
  share: number;
}

export interface RepoInfo {
  stars: number;
  forks: number;
  issues: number;
  pushedAt: string;
  createdAt: string;
  license: string | null;
  topics: string[];
  archived: boolean;
  languages: RepoLanguage[];
}

export const repoKeyOf = (url?: string) =>
  url?.startsWith("https://github.com/") ? url.replace("https://github.com/", "").replace(/\/$/, "").toLowerCase() : null;

export function topLanguages(languages: RepoLanguage[], limit = 5): RepoLanguage[] {
  if (languages.length <= limit) return languages;
  const head = languages.slice(0, limit - 1);
  const rest = languages.slice(limit - 1).reduce((sum, language) => sum + language.share, 0);
  return [...head, { name: "Other", share: Math.round(rest * 10) / 10 }];
}
