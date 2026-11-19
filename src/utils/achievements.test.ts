import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/synthSounds.ts", () => ({
  playConfirm: vi.fn(),
  playStatic: vi.fn()
}));

async function freshModule(saved: string[] = []) {
  vi.resetModules();
  localStorage.clear();
  localStorage.setItem("locale", "en");
  if (saved.length) localStorage.setItem("achievements", JSON.stringify(saved));
  const achievements = await import("@/utils/achievements.ts");
  const eggs = await import("@/utils/easterEggs.ts");
  return { ...achievements, toast: eggs.toast };
}

describe("achievements", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("ignores unknown ids from storage", async () => {
    const { achievementCount } = await freshModule(["konami", "made-up"]);
    expect(achievementCount.value).toBe(1);
  });

  it("unlocks once, persists and announces it", async () => {
    const { unlockAchievement, hasAchievement, achievementCount, toast } = await freshModule();
    unlockAchievement("cat");
    unlockAchievement("cat");
    expect(hasAchievement("cat")).toBe(true);
    expect(achievementCount.value).toBe(1);
    expect(JSON.parse(localStorage.getItem("achievements")!)).toEqual(["cat"]);
    expect(toast.value?.text).toBe("ACHIEVEMENT: Meow");
  });

  it("computes ranks from the number of secrets", async () => {
    const { achievementIds, unlockAchievement, currentRank, nextRank } = await freshModule();
    expect(currentRank.value.label).toBe("SCRIPT_KIDDIE");
    expect(nextRank.value?.label).toBe("OPERATOR");
    achievementIds.slice(0, 8).forEach(unlockAchievement);
    expect(currentRank.value.label).toBe("NETRUNNER");
    achievementIds.forEach(unlockAchievement);
    expect(currentRank.value.label).toBe("ROOT");
    expect(nextRank.value).toBeNull();
  });

  it("unlocks secret themes by their requirement", async () => {
    const { achievementIds, unlockAchievement, isSecretThemeUnlocked, allUnlocked } = await freshModule();
    expect(isSecretThemeUnlocked("midnight")).toBe(false);
    unlockAchievement("nightowl");
    expect(isSecretThemeUnlocked("midnight")).toBe(true);
    expect(isSecretThemeUnlocked("root")).toBe(false);
    achievementIds.forEach(unlockAchievement);
    expect(allUnlocked.value).toBe(true);
    expect(isSecretThemeUnlocked("root")).toBe(true);
  });

  it("has a hint for every achievement", async () => {
    const { achievementIds, hints } = await freshModule();
    for (const id of achievementIds) expect(hints[id]).toBeTruthy();
  });
});
