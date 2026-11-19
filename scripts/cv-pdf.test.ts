// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseCvPdf } from "./cv-pdf.ts";
import { buildCvView, type CvProject } from "../src/model/cvView.ts";
import type { CvBlock, CvRun } from "../src/model/cv.ts";

const text = (runs: CvRun[]) => runs.map((run) => run.text).join("");
const blockText = (block: CvBlock) => (block.type === "list" ? block.items.map(text).join("\n") : text(block.runs));

describe("parseCvPdf", async () => {
  const cv = await parseCvPdf("public/cv/resume-ru.pdf");
  const view = buildCvView(cv);
  const all = cv.sections.flatMap((section) => section.blocks.map(blockText)).join("\n");

  it("reads the name, role and linked contacts", () => {
    expect(cv.title).toBe("Игорь");
    expect(cv.subtitle).toBe("Software Engineer, System Design, Backend");
    expect(view.contacts.map((contact) => contact.label)).toEqual(["", "Email", "GitHub", "Web", "Telegram"]);
    expect(view.contacts[4].runs[0].href).toBe("https://t.me/akkraizenhere");
    expect(cv.contacts.filter((run) => run.href && /^[\s|]+$/.test(run.text))).toHaveLength(0);
  });

  it("finds every section", () => {
    expect(view.sections.map((section) => section.title)).toEqual([
      "О себе",
      "Навыки",
      "Проекты",
      "Образование",
      "Дополнительно"
    ]);
  });

  it("turns labelled paragraphs into skill rows", () => {
    const skills = view.sections[1].blocks[0];
    expect(skills.kind).toBe("skills");
    if (skills.kind !== "skills") return;
    expect(skills.rows.map((row) => row.label)).toEqual([
      "Языки программирования",
      "Клиентская разработка",
      "Бэкенд и данные",
      "Инфраструктура",
      "Безопасность",
      "System Design"
    ]);
    expect(skills.rows[4].values).toContain("сквозное шифрование (libsodium, AES-GCM)");
  });

  it("builds project cards from heading, description, stack and bullets", () => {
    const projects = view.sections[2].blocks.filter((block): block is CvProject => block.kind === "project");
    expect(projects.map((project) => project.name)).toEqual(["SJ", "Berill", "Wavedot", "Mnema", "Другие проекты"]);

    const berill = projects[1];
    expect(berill.tagline).toBe("local-first рабочее пространство");
    expect(berill.notes).toEqual(["pet-проект"]);
    expect(berill.description).toMatch(/^Приложение «всё в одном»/);
    expect(berill.tags).toContain("Compose Multiplatform");
    expect(berill.tags).not.toContain("berill.space");
    expect(berill.links.map((link) => link.href)).toEqual(["https://github.com/Akkraizen/Berill", "https://berill.space/"]);
    expect(berill.bullets).toHaveLength(5);
    expect(berill.bullets[0][0]).toMatchObject({ text: "Синхронизация: ", bold: true });

    expect(projects[3].notes).toEqual(["pet-проект", "в разработке"]);
  });

  it("keeps bullets whole and drops bullet glyphs", () => {
    expect(all).not.toContain("•");
    expect(all).not.toMatch(/\n\s*\n/);
  });
});
