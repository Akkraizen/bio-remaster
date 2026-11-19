import { readFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { CvBlock, CvDocument, CvRun, CvSection } from "../src/model/cv.ts";

interface Line {
  page: number;
  x: number;
  y: number;
  size: number;
  bullet: boolean;
  runs: CvRun[];
}

interface RawItem {
  page: number;
  x: number;
  y: number;
  size: number;
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
}

interface LinkArea {
  page: number;
  rect: number[];
  url: string;
}

const CHROME_RATIO = 0.7;
const BULLET = /^[•◦▪●‣∙]$/;
const INDENT = 10;
const PLACEHOLDER = /\s*(?:[—–·|,-]\s*)?\[[^\]]*\]/g;
const SENTENCE_END = /[.!?;:)»]$/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;

const round = (value: number) => Math.round(value * 10) / 10;

function pushRun(runs: CvRun[], run: CvRun) {
  if (!run.text) return;
  const last = runs[runs.length - 1];
  if (
    last &&
    Boolean(last.bold) === Boolean(run.bold) &&
    Boolean(last.italic) === Boolean(run.italic) &&
    last.href === run.href
  )
    last.text += run.text;
  else runs.push({ ...run });
}

function joinRuns(target: CvRun[], source: CvRun[]) {
  if (target.length && source.length) {
    const last = target[target.length - 1];
    if (!/\s$/.test(last.text) && !/^\s/.test(source[0].text))
      pushRun(target, { text: " ", bold: last.bold && source[0].bold, italic: last.italic && source[0].italic });
  }
  for (const run of source) pushRun(target, run);
  return target;
}

function normalize(runs: CvRun[]): CvRun[] {
  const result: CvRun[] = [];
  for (const run of runs) pushRun(result, { ...run, text: run.text.replace(/\s+/g, " ") });
  if (result.length) {
    result[0].text = result[0].text.trimStart();
    result[result.length - 1].text = result[result.length - 1].text.trimEnd();
  }
  return result.filter((run) => run.text);
}

function stripPlaceholders(runs: CvRun[]): { runs: CvRun[]; hadPlaceholder: boolean; empty: boolean } {
  const text = runs.map((run) => run.text).join("");
  const ranges = [...text.matchAll(PLACEHOLDER)].map((match) => [match.index!, match.index! + match[0].length]);
  if (!ranges.length) return { runs, hadPlaceholder: false, empty: false };

  const result: CvRun[] = [];
  let offset = 0;
  for (const run of runs) {
    let kept = "";
    for (let i = 0; i < run.text.length; i++) {
      const position = offset + i;
      if (!ranges.some(([start, end]) => position >= start && position < end)) kept += run.text[i];
    }
    offset += run.text.length;
    pushRun(result, { ...run, text: kept });
  }

  const cleaned = normalize(result);
  if (cleaned.length) {
    const last = cleaned[cleaned.length - 1];
    last.text = last.text.replace(/[\s·|,—–-]+$/, "");
  }
  const remaining = normalize(cleaned);
  const empty = !remaining.map((run) => run.text).join("").replace(/[\s·|,.:;—–()-]/g, "");
  return { runs: remaining, hadPlaceholder: true, empty };
}

function linkEmails(runs: CvRun[]): CvRun[] {
  const result: CvRun[] = [];
  for (const run of runs) {
    if (run.href) {
      result.push(run);
      continue;
    }
    let last = 0;
    for (const match of run.text.matchAll(EMAIL)) {
      pushRun(result, { ...run, text: run.text.slice(last, match.index) });
      result.push({ ...run, text: match[0], href: `mailto:${match[0]}` });
      last = match.index! + match[0].length;
    }
    pushRun(result, { ...run, text: run.text.slice(last) });
  }
  return result;
}

async function readItems(path: string): Promise<RawItem[]> {
  const data = new Uint8Array(await readFile(path));
  const pdf = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
  const items: RawItem[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    await page.getOperatorList();
    const content = await page.getTextContent();
    const links: LinkArea[] = (await page.getAnnotations())
      .filter((annotation) => annotation.url)
      .map((annotation) => ({ page: pageNumber, rect: annotation.rect, url: annotation.url }));

    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      const [, , c, d, x, y] = item.transform as number[];
      const size = round(Math.hypot(c, d));
      const font = page.commonObjs.has(item.fontName) ? page.commonObjs.get(item.fontName) : null;
      const name: string = font?.name ?? "";
      const bold = /bold|semibold|black|heavy/i.test(name);
      const italic = /italic|oblique/i.test(name);
      const midY = y + size * 0.3;
      const rowLinks = links.filter(({ rect: [, y1, , y2] }) => midY >= y1 - 2 && midY <= y2 + 2);
      const linkAt = (position: number) =>
        rowLinks.find(({ rect: [x1, , x2] }) => position >= x1 && position <= x2)?.url;

      const charWidth = item.str.length ? item.width / item.str.length : 0;
      const tokens = item.str.match(/\s+|[()|·,:;]+|[^\s()|·,:;]+/g) ?? [];
      let offset = 0;
      for (const token of tokens) {
        const center = x + (offset + token.length / 2) * charWidth;
        items.push({
          page: pageNumber,
          x: x + offset * charWidth,
          y,
          size,
          text: token,
          bold,
          italic,
          href: /[^\s()|·,:;]/.test(token) ? linkAt(center) : undefined
        });
        offset += token.length;
      }
    }
  }
  return items;
}

function mostCommonSize(items: RawItem[]) {
  const weight = new Map<number, number>();
  for (const item of items) weight.set(item.size, (weight.get(item.size) ?? 0) + item.text.trim().length);
  return [...weight.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function buildLines(items: RawItem[], bodySize: number): Line[] {
  const markers = items.filter((item) => BULLET.test(item.text.trim()));
  const content = items.filter((item) => !BULLET.test(item.text.trim()) && item.size >= bodySize * CHROME_RATIO);

  const lines: Line[] = [];
  const byKey = new Map<string, Line>();
  for (const item of content) {
    const key = `${item.page}:${Math.round(item.y)}`;
    let line = byKey.get(key);
    if (!line) {
      line = {
        page: item.page,
        x: item.text.trim() ? item.x : Infinity,
        y: item.y,
        size: item.size,
        bullet: false,
        runs: []
      };
      byKey.set(key, line);
      lines.push(line);
    }
    if (item.text.trim()) line.x = Math.min(line.x, item.x);
    line.size = Math.max(line.size, item.size);
    pushRun(line.runs, {
      text: item.text,
      bold: item.bold || undefined,
      italic: item.italic || undefined,
      href: item.text.trim() ? item.href : undefined
    });
  }

  for (const line of lines)
    line.bullet = markers.some(
      (marker) => marker.page === line.page && Math.abs(marker.y - line.y) <= 3 && marker.x < line.x
    );

  return lines
    .filter((line) => line.runs.some((run) => run.text.trim()))
    .sort((a, b) => a.page - b.page || b.y - a.y);
}

function leadsWithLabel(line: Line) {
  const first = line.runs.find((run) => run.text.trim());
  return Boolean(first?.bold && /:\s*$/.test(first.text));
}

export async function parseCvPdf(path: string): Promise<CvDocument> {
  const items = await readItems(path);
  if (!items.length) throw new Error(`${path}: no text found`);

  const bodySize = mostCommonSize(items);
  const lines = buildLines(items, bodySize);
  const hasMarkers = lines.some((line) => line.bullet);
  const baseX = Math.min(...lines.filter((line) => line.size === bodySize).map((line) => line.x));
  const titleSize = Math.max(...lines.map((line) => line.size));
  const headingSizes = [...new Set(lines.map((line) => line.size))]
    .filter((size) => size > bodySize && size < titleSize)
    .sort((a, b) => b - a);
  const sectionSize = headingSizes[0];

  const title: CvRun[] = [];
  const subtitle: CvRun[] = [];
  const contacts: CvRun[] = [];
  const sections: CvSection[] = [];

  type Open = { kind: "paragraph" | "subheading" | "item"; runs: CvRun[] };
  let open: Open | null = null;
  let previous: Line | null = null;

  const section = () => sections[sections.length - 1];

  const close = () => {
    if (!open) return;
    const current = section();
    const runs = normalize(open.runs);
    if (!current) joinRuns(contacts, runs);
    else if (open.kind === "item") {
      const last = current.blocks[current.blocks.length - 1];
      if (last?.type === "list") last.items.push(runs);
      else current.blocks.push({ type: "list", items: [runs] });
    } else current.blocks.push({ type: open.kind, runs });
    open = null;
  };

  for (const line of lines) {
    const gap = previous && previous.page === line.page ? previous.y - line.y : null;
    const startsNew =
      !previous ||
      previous.size !== line.size ||
      leadsWithLabel(line) ||
      (gap !== null
        ? gap > line.size * 1.6
        : SENTENCE_END.test(runsTextOf(previous).trim()) || Boolean(line.runs.find((run) => run.text.trim())?.bold));

    if (line.size === titleSize) {
      joinRuns(title, line.runs);
    } else if (!section() && line.size !== sectionSize && line.size > bodySize) {
      joinRuns(subtitle, line.runs);
    } else if (line.size === sectionSize) {
      close();
      if (previous?.size === sectionSize && gap !== null && gap <= line.size * 1.6)
        section().title += ` ${runsTextOf(line)}`;
      else sections.push({ title: runsTextOf(line).trim(), blocks: [] });
    } else if (line.size > bodySize) {
      if (open?.kind !== "subheading" || startsNew) {
        close();
        open = { kind: "subheading", runs: [] };
      }
      joinRuns(open.runs, line.runs);
    } else {
      const indented = line.x > baseX + INDENT;
      const kind = section() && (line.bullet || indented) ? "item" : "paragraph";
      const newItem = hasMarkers ? line.bullet : startsNew;
      if (!open || open.kind !== kind || (kind === "item" ? newItem : startsNew)) {
        close();
        open = { kind, runs: [] };
      }
      joinRuns(open.runs, line.runs);
    }
    previous = line;
  }
  close();

  const subtitleText = normalize(subtitle).map((run) => run.text).join("");
  return {
    title: normalize(title).map((run) => run.text).join(""),
    ...(subtitleText ? { subtitle: subtitleText } : {}),
    contacts: linkEmails(normalize(contacts)),
    sections: cleanSections(sections)
  };
}

function runsTextOf(line: Line) {
  return line.runs.map((run) => run.text).join("");
}

function cleanSections(sections: CvSection[]): CvSection[] {
  const result: CvSection[] = [];
  for (const section of sections) {
    let total = 0;
    let dropped = 0;
    const blocks: CvBlock[] = [];

    for (const block of section.blocks) {
      if (block.type === "list") {
        const items: CvRun[][] = [];
        for (const item of block.items) {
          total++;
          const stripped = stripPlaceholders(item);
          if (stripped.empty) dropped++;
          else items.push(linkEmails(stripped.runs));
        }
        if (items.length) blocks.push({ type: "list", items });
      } else {
        total++;
        const stripped = stripPlaceholders(block.runs);
        if (stripped.empty) dropped++;
        else blocks.push({ type: block.type, runs: linkEmails(stripped.runs) });
      }
    }

    if (blocks.length && dropped * 2 < total) result.push({ title: section.title, blocks });
  }
  return result;
}
