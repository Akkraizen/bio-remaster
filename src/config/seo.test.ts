import { describe, expect, it } from "vitest";
import { absoluteUrl, metaTags, ogImagePath, projectMeta, staticPages } from "@/config/seo.ts";

describe("ogImagePath", () => {
  it("turns a route path into a flat file name", () => {
    expect(ogImagePath("/core/file")).toBe("/og/core-file.png");
    expect(ogImagePath("/core/projects/002/")).toBe("/og/core-projects-002.png");
    expect(ogImagePath("/")).toBe("/og/index.png");
  });
});

describe("page meta", () => {
  it("gives indexed pages and projects a large generated card", () => {
    expect(staticPages["Core.File"].image).toBe("/og/core-file.png");
    const meta = projectMeta({ id: "005", name: "Bot", description: "A bot" });
    expect(meta).toMatchObject({ path: "/core/projects/005", image: "/og/core-projects-005.png", largeImage: true });
  });

  it("falls back to the avatar for pages without a card", () => {
    const tags = Object.fromEntries(metaTags(staticPages["Core.NotFound"]).map(([selector, , value]) => [selector, value]));
    expect(tags['meta[property="og:image"]']).toBe(absoluteUrl("/avatar.jpg"));
    expect(tags['meta[property="twitter:card"]']).toBe("summary");
  });
});
