import { describe, expect, it } from "vitest";
import type { Project } from "@/model/project.ts";
import { countStack, filterProjects, tokenize } from "@/utils/projectSearch.ts";

const project = (overrides: Partial<Project>): Project => ({
  id: "000",
  name: "Sample",
  description: "",
  fullDescription: "",
  stack: [],
  ...overrides
});

const projects = [
  project({ id: "001", name: "Berill", description: "Local-first workspace", stack: ["kotlin", "docker"], source: "s", demo: "d" }),
  project({ id: "002", name: "Wavedot", description: "Music player", stack: ["kotlin"], source: "s" }),
  project({ id: "003", name: "Reverse", description: "Discord bot", stack: ["python"] })
];

const names = (list: Project[]) => list.map((item) => item.name);
const techName = (id: string) => ({ kotlin: "Kotlin", docker: "Docker", python: "Python" })[id] ?? id;

describe("tokenize", () => {
  it("lowercases and splits on whitespace", () => {
    expect(tokenize("  Music   PLAYER ")).toEqual(["music", "player"]);
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("filterProjects", () => {
  it("returns everything without filters", () => {
    expect(filterProjects(projects, { query: "", stack: [], features: [] })).toHaveLength(3);
  });

  it("matches all query tokens against name, description and stack names", () => {
    expect(names(filterProjects(projects, { query: "music", stack: [], features: [] }, techName))).toEqual(["Wavedot"]);
    expect(names(filterProjects(projects, { query: "kotlin docker", stack: [], features: [] }, techName))).toEqual(["Berill"]);
    expect(filterProjects(projects, { query: "kotlin python", stack: [], features: [] }, techName)).toHaveLength(0);
  });

  it("matches any selected stack item", () => {
    expect(names(filterProjects(projects, { query: "", stack: ["docker", "python"], features: [] }))).toEqual(["Berill", "Reverse"]);
  });

  it("requires every selected feature", () => {
    expect(names(filterProjects(projects, { query: "", stack: [], features: ["source"] }))).toEqual(["Berill", "Wavedot"]);
    expect(names(filterProjects(projects, { query: "", stack: [], features: ["source", "demo"] }))).toEqual(["Berill"]);
  });
});

describe("filterProjects by year", () => {
  it("keeps projects mentioned in any selected timeline year", () => {
    const years = new Map([
      ["001", ["2026"]],
      ["002", ["2025", "2026"]]
    ]);
    const filter = { query: "", stack: [], features: [], years: ["2025"] };
    expect(names(filterProjects(projects, filter, techName, years))).toEqual(["Wavedot"]);
    expect(names(filterProjects(projects, { ...filter, years: ["2026"] }, techName, years))).toEqual(["Berill", "Wavedot"]);
    expect(filterProjects(projects, { ...filter, years: ["2022"] }, techName, years)).toHaveLength(0);
  });
});

describe("countStack", () => {
  it("counts usage and sorts by count, then by name", () => {
    expect(countStack(projects, techName)).toEqual([
      { id: "kotlin", name: "Kotlin", count: 2 },
      { id: "docker", name: "Docker", count: 1 },
      { id: "python", name: "Python", count: 1 }
    ]);
  });
});
