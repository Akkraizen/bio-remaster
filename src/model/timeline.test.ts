import { describe, expect, it } from "vitest";
import { getProjectYears, timelineYears } from "@/model/timeline.ts";
import { rawProjects } from "@/model/project.ts";

describe("timeline links", () => {
  it("only references existing projects", () => {
    const ids = new Set(rawProjects.map((project) => project.id));
    for (const id of getProjectYears().keys()) expect(ids.has(id)).toBe(true);
  });

  it("lists years for a project in timeline order", () => {
    expect(getProjectYears().get("002")).toEqual(["2025", "2026"]);
    expect(timelineYears).toEqual([...timelineYears].sort());
  });
});
