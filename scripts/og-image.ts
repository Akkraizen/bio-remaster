import { readFile } from "node:fs/promises";
import sharp from "sharp";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const COLORS = {
  bg: "#050505",
  text: "#f0f0f0",
  accent: "#c6ff33",
  warning: "#ff003c"
};

const FONT = "'JetBrains Mono', 'Cascadia Mono', Consolas, 'DejaVu Sans Mono', monospace";
const CUT = 40;

export interface OgCard {
  kicker: string;
  title: string;
  description: string;
  tags?: string[];
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function wrap(text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else line = next;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && lines.join(" ").length < text.trim().length)
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]?$/, "")}…`;
  return lines;
}

let avatarCache: string | null = null;

async function avatarDataUri(avatarPath: string) {
  if (!avatarCache) {
    const png = await sharp(await readFile(avatarPath)).resize(220, 220).png().toBuffer();
    avatarCache = `data:image/png;base64,${png.toString("base64")}`;
  }
  return avatarCache;
}

function cutPolygon(x: number, y: number, w: number, h: number, cut: number) {
  return [
    [x + cut, y],
    [x + w, y],
    [x + w, y + h - cut],
    [x + w - cut, y + h],
    [x, y + h],
    [x, y + cut]
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(" ");
}

export async function renderOgImage(card: OgCard, avatarPath: string): Promise<Buffer> {
  const avatar = await avatarDataUri(avatarPath);
  const titleSize = card.title.length > 18 ? 60 : 76;
  const titleLines = wrap(card.title, card.title.length > 18 ? 22 : 18, 2);
  const descriptionLines = wrap(card.description, 46, 3);
  const titleTop = 230;
  const descriptionTop = titleTop + titleLines.length * (titleSize + 8) + 30;

  const grid = [
    ...Array.from({ length: OG_WIDTH / 40 + 1 }, (_, i) => `M${i * 40} 0V${OG_HEIGHT}`),
    ...Array.from({ length: OG_HEIGHT / 40 + 1 }, (_, i) => `M0 ${i * 40}H${OG_WIDTH}`)
  ].join("");

  const tags = (card.tags ?? []).slice(0, 5);
  let tagX = 80;
  const tagNodes = tags
    .map((tag) => {
      const width = tag.length * 14 + 28;
      const node = `<g transform="translate(${tagX} 500)"><polygon points="${cutPolygon(0, 0, width, 40, 8)}" fill="none" stroke="${COLORS.accent}" stroke-width="2"/><text x="14" y="27" font-size="20" fill="${COLORS.accent}">${escapeXml(tag.toUpperCase())}</text></g>`;
      tagX += width + 14;
      return node;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <clipPath id="avatar"><polygon points="${cutPolygon(0, 0, 220, 220, 30)}"/></clipPath>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.bg}"/>
  <path d="${grid}" stroke="${COLORS.accent}" stroke-opacity="0.06" stroke-width="1"/>
  <polygon points="${cutPolygon(30, 30, OG_WIDTH - 60, OG_HEIGHT - 60, CUT)}" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>
  <g font-family="${FONT}" font-weight="bold">
    <text x="80" y="110" font-size="28" fill="${COLORS.accent}" letter-spacing="3">AKKRAIZEN</text>
    <rect x="80" y="140" width="4" height="40" fill="${COLORS.warning}"/>
    <text x="100" y="170" font-size="24" fill="${COLORS.text}" fill-opacity="0.75" letter-spacing="2">${escapeXml(card.kicker)}</text>
    ${titleLines
      .map(
        (line, i) =>
          `<text x="80" y="${titleTop + titleSize + i * (titleSize + 8)}" font-size="${titleSize}" fill="${COLORS.text}">${escapeXml(line)}</text>`
      )
      .join("")}
    ${descriptionLines
      .map(
        (line, i) =>
          `<text x="80" y="${descriptionTop + 30 + i * 40}" font-size="28" font-weight="normal" fill="${COLORS.text}" fill-opacity="0.8">${escapeXml(line)}</text>`
      )
      .join("")}
    ${tagNodes}
    <text x="${OG_WIDTH - 80}" y="${OG_HEIGHT - 70}" font-size="24" fill="${COLORS.accent}" text-anchor="end">akkraizen.dev</text>
  </g>
  <g transform="translate(${OG_WIDTH - 300} 80)">
    <image href="${avatar}" width="220" height="220" clip-path="url(#avatar)"/>
    <polygon points="${cutPolygon(0, 0, 220, 220, 30)}" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>
  </g>
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
