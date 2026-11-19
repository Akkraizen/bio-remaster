import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/router", () => ({ default: { push: vi.fn() } }));
vi.mock("@/utils/synthSounds.ts", () => ({
  playAlarm: vi.fn(),
  playConfirm: vi.fn(),
  playStatic: vi.fn(),
  playRoulette: vi.fn()
}));
vi.mock("@/utils/glitchFx.ts", () => ({ triggerGlitch: vi.fn() }));

const context = { clear: vi.fn(), close: vi.fn() };

async function load(saved: string[] = []) {
  vi.resetModules();
  localStorage.clear();
  localStorage.setItem("locale", "en");
  localStorage.setItem("achievements", JSON.stringify(saved));
  const terminal = await import("@/commands/terminal.ts");
  const router = (await import("@/router")).default;
  const achievements = await import("@/utils/achievements.ts");
  return { ...terminal, router, ...achievements };
}

const texts = (lines: { text: string }[]) => lines.map((line) => line.text);
const run = async (execute: (input: string, ctx: typeof context) => unknown, input: string) =>
  texts((await execute(input, context)) as { text: string }[]);

describe("terminal", () => {
  beforeEach(() => vi.useFakeTimers());

  it("lists public commands in help", async () => {
    const { execute } = await load();
    const help = await run(execute, "help");
    expect(help.some((line) => line.startsWith("hint"))).toBe(true);
    expect(help.some((line) => line.startsWith("cv"))).toBe(true);
  });

  it("reports unknown commands", async () => {
    const { execute } = await load();
    expect((await run(execute, "definitely-not-a-command"))[0]).toContain("definitely-not-a-command");
  });

  it("shows clearance in whoami", async () => {
    const { execute } = await load(["konami", "sudo", "rmrf", "hisoka"]);
    const output = await run(execute, "whoami");
    expect(output).toContain("visitor clearance: OPERATOR [4/18]");
    expect(output).toContain("next: NETRUNNER at 8 secrets");
  });

  it("denies hints below the threshold and gives one above it", async () => {
    const denied = await load(["konami"]);
    expect((await run(denied.execute, "hint"))[0]).toContain("access denied");

    const allowed = await load(["konami", "sudo", "rmrf", "hisoka", "matrix", "teapot", "cat", "vim"]);
    const output = await run(allowed.execute, "hint");
    expect(output[0]).toContain("10 secrets remain");
    expect(Object.values(allowed.hints)).toContain(output[1]);
  });

  it("unlocks secrets from secret commands", async () => {
    const { execute, hasAchievement } = await load();
    await run(execute, "coffee");
    expect(hasAchievement("teapot")).toBe(true);
  });

  it("navigates with cd and cv", async () => {
    const { execute, router } = await load();
    await run(execute, "cd projects/002");
    expect(router.push).toHaveBeenCalledWith("/core/projects/002");
    await run(execute, "cv");
    expect(router.push).toHaveBeenCalledWith("/core/cv");
    expect((await run(execute, "cd nowhere"))[0]).toContain("no such page");
  });

  it("offers l33t only after polyglot", async () => {
    const locked = await load();
    expect((await run(locked.execute, "lang l33t"))[0]).toBe("usage: lang [en|ru]");

    const unlocked = await load(["polyglot"]);
    expect((await run(unlocked.execute, "lang l33t"))[0]).toBe("l4ng 537 70 l337");
  });

  it("walks the file tree with cd, ls, pwd and cat", async () => {
    const { execute, router } = await load();
    expect(await run(execute, "pwd")).toEqual(["~"]);
    expect((await run(execute, "ls")).some((line) => line.startsWith("projects/"))).toBe(true);
    await run(execute, "cd projects/berill");
    expect(router.push).toHaveBeenCalledWith("/core/projects/001");
    expect(await run(execute, "pwd")).toEqual(["~/projects/berill"]);
    expect(await run(execute, "ls")).toEqual(["README.md", "stack.txt", "links.txt"]);
    expect((await run(execute, "cat README.md"))[0]).toBe("# Berill");
    expect(await run(execute, "cat")).toContain("( o.o )");
    await run(execute, "cd ../..");
    expect(await run(execute, "pwd")).toEqual(["~"]);
    expect((await run(execute, "cat nope.txt"))[0]).toContain("no such file");
    expect((await run(execute, "cd readme.txt"))[0]).toContain("not a directory");
  });

  it("prints manual pages", async () => {
    const { execute } = await load();
    const page = await run(execute, "man cd");
    expect(page[0]).toBe("NAME");
    expect(page[3]).toContain("cd [path]");
    expect((await run(execute, "man sudo"))[0]).toBe("no manual entry for sudo");
  });

  it("completes commands and arguments", async () => {
    const { complete, execute } = await load();
    expect(complete("wh")).toEqual({ value: "whoami ", options: [] });
    expect(complete("cd pro")).toEqual({ value: "cd projects/", options: [] });
    expect(complete("cd projects/be").value).toBe("cd projects/berill/");
    expect(complete("open wav").value).toBe("open wavedot ");
    expect(complete("sound o").options).toEqual(["on", "off"]);
    await run(execute, "cd projects/berill");
    expect(complete("cat RE").value).toBe("cat README.md ");
  });

  it("starts the game through the context", async () => {
    const { execute } = await load();
    const startGame = vi.fn();
    await execute("snake", { ...context, startGame });
    expect(startGame).toHaveBeenCalled();
  });
});
