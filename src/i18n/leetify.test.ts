import { describe, expect, it } from "vitest";
import { leetify } from "@/i18n";

describe("leetify", () => {
  it("replaces letters with digits regardless of case", () => {
    expect(leetify("Clearance")).toBe("Cl34r4nc3");
    expect(leetify("SETTINGS")).toBe("53771NG5");
  });

  it("keeps characters without a mapping", () => {
    expect(leetify("ByZ 42 · ?")).toBe("ByZ 42 · ?");
  });

  it("does not touch html tags, entities or placeholders", () => {
    expect(leetify("<a href='site'>text</a> &amp; {count}")).toBe("<a href='site'>73x7</a> &amp; {count}");
  });
});
