import type { CvBlock, CvDocument, CvRun } from "@/model/cv.ts";

export interface CvProject {
  kind: "project";
  name: string;
  tagline: string;
  notes: string[];
  description: string;
  tags: string[];
  links: CvRun[];
  bullets: CvRun[][];
}

export type CvViewBlock =
  | CvProject
  | { kind: "skills"; rows: { label: string; values: string[] }[] }
  | { kind: "entries"; items: { name: string; rest: CvRun[] }[] }
  | { kind: "chips"; items: string[] }
  | { kind: "subheading"; runs: CvRun[] }
  | { kind: "text"; runs: CvRun[] }
  | { kind: "list"; items: CvRun[][] };

export interface CvViewSection {
  id: string;
  index: string;
  title: string;
  blocks: CvViewBlock[];
}

export interface CvContact {
  label: string;
  runs: CvRun[];
}

export interface CvView {
  name: string;
  role: string;
  contacts: CvContact[];
  sections: CvViewSection[];
}

const SEPARATOR = /\s*[·|]\s*/;
const META_LABEL = /^\s*(стек|stack|tech|технологии)\s*:\s*/i;
const HOST_LABELS: Record<string, string> = {
  "github.com": "GitHub",
  "t.me": "Telegram",
  "codeforces.com": "Codeforces",
  "leetcode.com": "LeetCode"
};

const plain = (runs: CvRun[]) => runs.map((run) => run.text).join("");

export function splitOutsideParens(text: string, separator = ","): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth++;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else current += char;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function trimRuns(runs: CvRun[]): CvRun[] {
  const result = runs.map((run) => ({ ...run })).filter((run) => run.text);
  while (result.length && !result[0].text.trim()) result.shift();
  while (result.length && !result[result.length - 1].text.trim()) result.pop();
  if (result.length) {
    result[0].text = result[0].text.replace(/^[\s—–:-]+/, "");
    result[result.length - 1].text = result[result.length - 1].text.trimEnd();
  }
  return result.filter((run) => run.text);
}

function hostLabel(href: string) {
  if (href.startsWith("mailto:")) return "Email";
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return HOST_LABELS[host] ?? "Web";
  } catch {
    return "";
  }
}

function splitContacts(runs: CvRun[]): CvContact[] {
  const groups: CvRun[][] = [[]];
  for (const run of runs) {
    if (run.href) {
      groups[groups.length - 1].push(run);
      continue;
    }
    run.text.split(SEPARATOR).forEach((piece, index) => {
      if (index > 0) groups.push([]);
      if (piece) groups[groups.length - 1].push({ ...run, text: piece });
    });
  }

  return groups
    .map(trimRuns)
    .filter((group) => group.length)
    .map((group) => {
      const first = group[0];
      if (group.length > 1 && !first.href)
        return { label: first.text.trim().replace(/:$/, ""), runs: trimRuns(group.slice(1)) };
      if (first.href) return { label: hostLabel(first.href), runs: group };
      return { label: "", runs: group };
    });
}

const isItalic = (runs: CvRun[]) => runs.every((run) => run.italic || !run.text.trim());

const isMeta = (runs: CvRun[]) => {
  const text = plain(runs);
  return META_LABEL.test(text) || (text.split(SEPARATOR).length > 2 && text.length < 400);
};

function parseTitle(text: string) {
  const [head, ...noteParts] = text.split(/\s+—\s+/);
  const notes = noteParts.length ? splitOutsideParens(noteParts.join(" — ")) : [];
  const colon = head.indexOf(": ");
  if (colon > 0 && colon < 40) return { name: head.slice(0, colon).trim(), tagline: head.slice(colon + 2).trim(), notes };
  return { name: head.trim(), tagline: "", notes };
}

function projectFrom(title: CvRun[], description: string, meta: CvRun[] | null, bullets: CvRun[][]): CvProject {
  const links = (meta ?? []).filter((run) => run.href);
  const linkTexts = new Set(links.map((run) => run.text.trim()));
  const metaText = (meta ?? [])
    .filter((run) => !run.href)
    .map((run) => run.text)
    .join("")
    .replace(META_LABEL, "");
  const [tagsPart, ...rest] = metaText.split(/\s+—\s+/);
  const tags = tagsPart
    .split(SEPARATOR)
    .map((tag) => tag.trim())
    .filter((tag) => tag && !linkTexts.has(tag));
  const { name, tagline, notes } = parseTitle(plain(title));
  const metaNotes = rest.length ? splitOutsideParens(rest.join(" — ").replace(SEPARATOR, ", ")) : [];
  return { kind: "project", name, tagline, notes: [...notes, ...metaNotes], description, tags, links, bullets };
}

const labelOf = (runs: CvRun[]) => {
  const first = runs.find((run) => run.text.trim());
  return first?.bold && /:\s*$/.test(first.text) ? first : null;
};

function skillRow(runs: CvRun[]) {
  const label = labelOf(runs)!;
  const rest = plain(runs.slice(runs.indexOf(label) + 1)).trim().replace(/\.$/, "");
  return { label: label.text.trim().replace(/:$/, ""), values: splitOutsideParens(rest) };
}

function convertList(items: CvRun[][]): CvViewBlock {
  if (items.every((item) => labelOf(item))) return { kind: "skills", rows: items.map(skillRow) };

  const boldCount = items.filter((item) => item[0]?.bold).length;
  if (boldCount >= Math.ceil(items.length / 2))
    return {
      kind: "entries",
      items: items.map((item) =>
        item[0]?.bold ? { name: item[0].text.trim(), rest: trimRuns(item.slice(1)) } : { name: "", rest: trimRuns(item) }
      )
    };

  return { kind: "list", items };
}

function convertBlocks(blocks: CvBlock[]): CvViewBlock[] {
  const result: CvViewBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === "subheading") {
      let next = i + 1;
      let description = "";
      let meta: CvRun[] | null = null;
      let bullets: CvRun[][] = [];
      const first = blocks[next];
      if (first?.type === "paragraph" && isItalic(first.runs)) {
        description = plain(first.runs).trim();
        next++;
      }
      const second = blocks[next];
      if (second?.type === "paragraph" && isMeta(second.runs)) {
        meta = second.runs;
        next++;
      }
      const third = blocks[next];
      if (third?.type === "list") {
        bullets = third.items;
        next++;
      }
      if (description || meta || bullets.length) {
        result.push(projectFrom(block.runs, description, meta, bullets));
        i = next - 1;
        continue;
      }
      result.push({ kind: "subheading", runs: block.runs });
      continue;
    }

    if (block.type === "list") {
      result.push(convertList(block.items));
      continue;
    }

    if (labelOf(block.runs)) {
      const rows = [skillRow(block.runs)];
      while (blocks[i + 1]?.type === "paragraph" && labelOf((blocks[i + 1] as { runs: CvRun[] }).runs)) {
        i++;
        rows.push(skillRow((blocks[i] as { runs: CvRun[] }).runs));
      }
      result.push({ kind: "skills", rows });
      continue;
    }

    const text = plain(block.runs);
    if (!block.runs.some((run) => run.href || run.bold) && SEPARATOR.test(text) && text.length < 200)
      result.push({ kind: "chips", items: text.split(SEPARATOR).map((item) => item.trim()).filter(Boolean) });
    else result.push({ kind: "text", runs: block.runs });
  }
  return result;
}

const slug = (value: string, index: number) =>
  `cv-${index + 1}-${value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")}`;

const capitalize = (value: string) =>
  value === value.toUpperCase() ? value.charAt(0) + value.slice(1).toLowerCase() : value;

export function buildCvView(document: CvDocument): CvView {
  const [name, ...role] = document.title.split(/\s+—\s+/);
  return {
    name: name.trim(),
    role: document.subtitle ?? role.join(" — ").trim(),
    contacts: splitContacts(document.contacts),
    sections: document.sections.map((section, index) => ({
      id: slug(section.title, index),
      index: String(index + 1).padStart(2, "0"),
      title: capitalize(section.title),
      blocks: convertBlocks(section.blocks)
    }))
  };
}
