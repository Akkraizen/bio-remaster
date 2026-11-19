import { t } from "@/i18n";
import { siteUrl } from "@/config/seo.ts";
import { achievementCount, achievementIds, achievements, currentRank } from "@/utils/achievements.ts";

const WIDTH = 1200;
const HEIGHT = 630;
const CUT = 40;
const FILE_NAME = "akkraizen-secrets.png";

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    bg: read("--c-bg", "#050505"),
    text: read("--c-text", "#f0f0f0"),
    accent: read("--c-accent", "#c6ff33"),
    warning: read("--c-warning", "#ff003c"),
    onAccent: read("--c-on-accent", "#000000")
  };
}

function cutPath(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cut: number) {
  context.beginPath();
  context.moveTo(x + cut, y);
  context.lineTo(x + w, y);
  context.lineTo(x + w, y + h - cut);
  context.lineTo(x + w - cut, y + h);
  context.lineTo(x, y + h);
  context.lineTo(x, y + cut);
  context.closePath();
}

export async function renderShareCard(): Promise<Blob> {
  await document.fonts?.ready;
  const colors = readColors();
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");

  const font = (size: number, weight = "bold") => `${weight} ${size}px "JetBrains Mono", monospace`;

  context.fillStyle = colors.bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.strokeStyle = colors.accent;
  context.globalAlpha = 0.06;
  context.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WIDTH, y);
    context.stroke();
  }
  context.globalAlpha = 1;

  context.lineWidth = 3;
  cutPath(context, 30, 30, WIDTH - 60, HEIGHT - 60, CUT);
  context.stroke();

  context.fillStyle = colors.accent;
  context.font = font(26);
  context.fillText("AKKRAIZEN // SECRETS", 80, 105);

  context.fillStyle = colors.warning;
  context.fillRect(80, 135, 4, 70);
  context.fillStyle = colors.text;
  context.font = font(20, "normal");
  context.fillText(t("settings.rank").toUpperCase(), 100, 160);
  context.fillStyle = colors.accent;
  context.font = font(48);
  context.fillText(currentRank.value.label, 100, 205);

  const total = achievementIds.length;
  context.fillStyle = colors.text;
  context.font = font(64);
  const count = `${achievementCount.value}/${total}`;
  context.fillText(count, WIDTH - 80 - context.measureText(count).width, 205);

  const barX = 80;
  const barY = 240;
  const barW = WIDTH - 160;
  const gap = 6;
  const cell = (barW - gap * (total - 1)) / total;
  achievements.value.forEach((item, index) => {
    context.fillStyle = colors.accent;
    context.globalAlpha = item.unlocked ? 1 : 0.15;
    context.fillRect(barX + index * (cell + gap), barY, cell, 14);
  });
  context.globalAlpha = 1;

  const columns = 4;
  const columnWidth = barW / columns;
  context.font = font(20, "normal");
  achievements.value.forEach((item, index) => {
    const x = barX + (index % columns) * columnWidth;
    const y = 310 + Math.floor(index / columns) * 52;
    context.fillStyle = item.unlocked ? colors.accent : colors.text;
    context.globalAlpha = item.unlocked ? 1 : 0.35;
    context.fillRect(x, y - 20, 3, 26);
    const label = item.unlocked ? t(`achievements.items.${item.id}`).toUpperCase() : "???";
    context.fillText(label, x + 14, y);
  });
  context.globalAlpha = 1;

  context.fillStyle = colors.accent;
  const url = new URL(siteUrl).host;
  context.font = font(22);
  context.fillText(url, WIDTH - 80 - context.measureText(url).width, HEIGHT - 70);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("export failed"))), "image/png")
  );
}

export function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILE_NAME;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareCard(): Promise<"shared" | "downloaded" | "cancelled"> {
  const blob = await renderShareCard();
  const file = new File([blob], FILE_NAME, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: t("settings.shareTitle"), url: siteUrl });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  downloadBlob(blob);
  return "downloaded";
}

export async function downloadCard() {
  downloadBlob(await renderShareCard());
}
