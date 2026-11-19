import type { Project } from "@/model/project.ts";

export type ProjectFeature = "demo" | "source";

export interface ProjectFilter {
  query: string;
  stack: string[];
  features: ProjectFeature[];
  years?: string[];
}

export const tokenize = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean);

export function filterProjects(
  projects: Project[],
  filter: ProjectFilter,
  techName: (id: string) => string = (id) => id,
  projectYears: Map<string, string[]> = new Map()
): Project[] {
  const tokens = tokenize(filter.query);
  return projects.filter((project) => {
    if (filter.years?.length && !filter.years.some((year) => projectYears.get(project.id)?.includes(year)))
      return false;
    if (filter.stack.length && !filter.stack.some((id) => project.stack.includes(id))) return false;
    if (filter.features.some((feature) => !project[feature])) return false;
    if (!tokens.length) return true;
    const haystack = [project.name, project.description, ...project.stack.map(techName)]
      .join(" ")
      .toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

export function countStack(projects: Project[], techName: (id: string) => string = (id) => id) {
  const counts = new Map<string, number>();
  for (const project of projects)
    for (const id of project.stack) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || techName(a[0]).localeCompare(techName(b[0])))
    .map(([id, count]) => ({ id, name: techName(id), count }));
}
