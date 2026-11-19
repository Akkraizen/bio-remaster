import { t, type Locale } from "@/i18n";
import { getProjectsForLocale, type Project } from "@/model/project.ts";
import { getTechnologiesForLocale } from "@assets/technologies";
import socials from "@assets/socials";
import type { CvDocument, CvRun } from "@/model/cv.ts";

export type FileContent = string[] | Promise<string[]>;

export interface DirNode {
  kind: "dir";
  route?: string;
  index?: string;
  children: () => Record<string, VfsNode>;
}

export interface FileNode {
  kind: "file";
  read: () => FileContent;
}

export type VfsNode = DirNode | FileNode;

export const HOME = "~";

const file = (read: () => FileContent): FileNode => ({ kind: "file", read });

export const projectSlug = (project: Pick<Project, "name">) =>
  project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const stripHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\{'([^']*)'\}/g, "$1")
    .split("\n")
    .map((line) => line.trim());

const plain = (runs: CvRun[]) => runs.map((run) => run.text).join("").trim();

export function cvToText(document: CvDocument): string[] {
  const lines = [document.title.toUpperCase()];
  if (document.subtitle) lines.push(document.subtitle);
  if (document.contacts.length) lines.push(plain(document.contacts));
  for (const section of document.sections) {
    lines.push("", `## ${section.title}`);
    for (const block of section.blocks) {
      if (block.type === "list") block.items.forEach((item) => lines.push(`  • ${plain(item)}`));
      else if (block.type === "subheading") lines.push("", `# ${plain(block.runs)}`);
      else lines.push(plain(block.runs));
    }
  }
  return lines;
}

async function readCv(locale: Locale): Promise<string[]> {
  try {
    const { cvEntries } = await import("virtual:cv");
    const entry = cvEntries.find((item) => item.locale === locale) ?? cvEntries[0];
    return entry ? cvToText(entry.document) : ["cv: no resume found"];
  } catch {
    return ["cv: archive is unreachable"];
  }
}

function projectDir(project: Project, locale: Locale, route: string): DirNode {
  const technologies = getTechnologiesForLocale(locale);
  return {
    kind: "dir",
    route,
    index: "README.md",
    children: () => ({
      "README.md": file(() => [`# ${project.name}`, "", project.fullDescription]),
      "stack.txt": file(() =>
        project.stack.map((id) => {
          const tech = technologies[id];
          return tech ? `${tech.name.padEnd(12)} ${tech.description}` : id;
        })
      ),
      ...(project.source || project.demo
        ? {
            "links.txt": file(() =>
              [project.source && `source  ${project.source}`, project.demo && `demo    ${project.demo}`].filter(
                (line): line is string => Boolean(line)
              )
            )
          }
        : {})
    })
  };
}

export function buildTree(locale: Locale, pages: Record<string, string>, stats: () => Promise<string[]>): DirNode {
  const projects = getProjectsForLocale(locale);
  const root: Record<string, () => VfsNode> = {
    "readme.txt": () =>
      file(() => [
        "AKKRAIZEN CORE // personal node",
        "every directory is a page: 'cd' walks there, 'ls' looks around, 'cat' reads.",
        "type 'man <command>' when lost."
      ]),
    file: () => ({
      kind: "dir",
      route: pages.file,
      index: "about.txt",
      children: () => ({
        "about.txt": file(() => stripHtml(t("file.biographyText"))),
        "links.txt": file(() => Object.entries(socials).map(([key, social]) => `${key.padEnd(12)} ${social.link}`))
      })
    }),
    projects: () => ({
      kind: "dir",
      route: pages.projects,
      children: () =>
        Object.fromEntries(
          projects.map((project) => [projectSlug(project), projectDir(project, locale, `${pages.projects}/${project.id}`)])
        )
    }),
    activity: () => ({
      kind: "dir",
      route: pages.activity,
      index: "stats.log",
      children: () => ({ "stats.log": file(stats) })
    }),
    cv: () => ({
      kind: "dir",
      route: pages.cv,
      index: "resume.txt",
      children: () => ({ "resume.txt": file(() => readCv(locale)) })
    })
  };
  if (pages.uplink)
    root.uplink = () => ({
      kind: "dir",
      route: pages.uplink,
      index: "howto.txt",
      children: () => ({
        "howto.txt": file(() => [
          "uplink: send a direct transmission or sign the guestbook.",
          "'cd uplink' opens the console."
        ])
      })
    });

  return {
    kind: "dir",
    route: pages.entrypoint,
    index: "readme.txt",
    children: () => Object.fromEntries(Object.entries(root).map(([name, make]) => [name, make()]))
  };
}

export function childOf(dir: DirNode, name: string, locale: Locale): { name: string; node: VfsNode } | null {
  const children = dir.children();
  const lower = name.toLowerCase();
  const match = children[name] ? name : Object.keys(children).find((key) => key.toLowerCase() === lower);
  if (match) return { name: match, node: children[match] };
  if (dir.route?.endsWith("/projects")) {
    const project = getProjectsForLocale(locale).find(
      (item) => item.id === lower.padStart(3, "0") || item.name.toLowerCase() === lower
    );
    const slug = project && projectSlug(project);
    if (slug && children[slug]) return { name: slug, node: children[slug] };
  }
  return null;
}

export function splitPath(target: string, cwd: string[]): string[] {
  const absolute = /^(~|\/)/.test(target);
  const raw = target.replace(/^~\/?|^\//, "").replace(/^core\//i, "");
  const parts = absolute ? [] : [...cwd];
  for (const piece of raw.split("/")) {
    if (!piece || piece === ".") continue;
    if (piece === "..") parts.pop();
    else parts.push(piece);
  }
  return parts;
}

export function resolve(root: DirNode, parts: string[], locale: Locale): { node: VfsNode; parts: string[] } | null {
  let node: VfsNode = root;
  const canonical: string[] = [];
  for (const part of parts) {
    if (node.kind !== "dir") return null;
    const next = childOf(node, part, locale);
    if (!next) return null;
    canonical.push(next.name);
    node = next.node;
  }
  return { node, parts: canonical };
}

export const formatPath = (parts: string[]) => (parts.length ? `${HOME}/${parts.join("/")}` : HOME);

export function pathForRoute(root: DirNode, route: string): string[] {
  const walk = (dir: DirNode, trail: string[]): string[] | null => {
    if (dir.route === route) return trail;
    for (const [name, child] of Object.entries(dir.children()))
      if (child.kind === "dir") {
        const found = walk(child, [...trail, name]);
        if (found) return found;
      }
    return null;
  };
  return walk(root, []) ?? [];
}
