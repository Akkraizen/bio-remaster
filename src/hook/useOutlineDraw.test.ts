import { beforeEach, describe, expect, it, vi } from "vitest";

describe("outline draw-in", () => {
  let draw: typeof import("@/hook/useOutlineDraw.ts");

  beforeEach(async () => {
    vi.resetModules();
    draw = await import("@/hook/useOutlineDraw.ts");
  });

  it("draws on the first visit of every screen only", () => {
    draw.enterScreen("/core/file");
    expect(draw.isOutlineDrawAllowed()).toBe(true);
    draw.enterScreen("/core/projects");
    expect(draw.isOutlineDrawAllowed()).toBe(true);
    draw.enterScreen("/core/file");
    expect(draw.isOutlineDrawAllowed()).toBe(false);
    draw.enterScreen("/core/projects/002");
    expect(draw.isOutlineDrawAllowed()).toBe(true);
    draw.enterScreen("/core/projects");
    expect(draw.isOutlineDrawAllowed()).toBe(false);
  });
});
