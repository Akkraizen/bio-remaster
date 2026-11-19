import { computed, ref } from "vue";
import { currentLocale, leetMode, setLeet, t, type Locale } from "@/i18n";
import { getProjectsForLocale } from "@/model/project.ts";
import socials from "@assets/socials";
import { type ThemePreference } from "@/hook/useTheme.ts";
import { loadLiveStats, useLiveStats } from "@/hook/useLiveStats.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";
import { playAlarm } from "@/utils/synthSounds.ts";
import { runOverdrive, toggleOverclock } from "@/utils/easterEggs.ts";
import {
  HINT_THRESHOLD,
  achievementCount,
  achievementIds,
  allUnlocked,
  currentRank,
  hasAchievement,
  hints,
  missingAchievements,
  nextRank,
  unlockAchievement
} from "@/utils/achievements.ts";
import { startFinale } from "@/hook/useFinale.ts";
import { startScreensaver } from "@/hook/useScreensaver.ts";
import {
  applyTheme,
  availableThemes,
  navigate,
  openSocial,
  pages,
  setSound,
  switchLanguage
} from "@/commands";
import {
  buildTree,
  childOf,
  formatPath,
  pathForRoute,
  projectSlug,
  resolve,
  splitPath,
  type DirNode,
  type VfsNode
} from "@/commands/vfs.ts";

export type LineKind = "input" | "output" | "accent" | "error" | "muted";

export interface TerminalLine {
  text: string;
  kind: LineKind;
  prompt?: string;
}

export interface TerminalContext {
  clear: () => void;
  close: () => void;
  startGame?: () => void;
}

type Output = TerminalLine[] | Promise<TerminalLine[]>;

const out = (text: string, kind: LineKind = "output"): TerminalLine => ({ text, kind });
const pad = (value: string, width: number) => value.padEnd(width, " ");

const publicCommands = [
  "help",
  "man",
  "whoami",
  "ls",
  "cd",
  "pwd",
  "cat",
  "projects",
  "open",
  "socials",
  "stats",
  "theme",
  "lang",
  "sound",
  "date",
  "cv",
  "hint",
  "snake",
  "clear",
  "exit"
] as const;

type PublicCommand = (typeof publicCommands)[number];

const secretCommands = ["sudo", "rm", "hisoka", "matrix", "coffee", "konami", "vim", "exit()", "overclock", "afk", "finale"];

export const completions: string[] = [...publicCommands];

const synopsis: Record<PublicCommand, string> = {
  help: "help",
  man: "man <command>",
  whoami: "whoami",
  ls: "ls [path]",
  cd: "cd [path]   (cd .., cd ~, cd projects/berill)",
  pwd: "pwd",
  cat: "cat <file|dir>   (cat cv, cat readme.txt)",
  projects: "projects",
  open: "open <project|link>   (open berill, open github)",
  socials: "socials",
  stats: "stats",
  theme: "theme [name|random]",
  lang: "lang [en|ru]",
  sound: "sound [on|off]",
  date: "date",
  cv: "cv",
  hint: "hint",
  snake: "snake   (arrows / WASD / hjkl, q to quit)",
  clear: "clear",
  exit: "exit"
};

const cwd = ref<string[]>([]);
export const promptPath = computed(() => formatPath(cwd.value));

const tree = (locale: Locale): DirNode =>
  buildTree(locale, pages, async () => (await stats()).map((line) => line.text));

export function syncCwd(route: string) {
  cwd.value = pathForRoute(tree(currentLocale.value), route);
}

function lookup(target: string, locale: Locale) {
  return resolve(tree(locale), splitPath(target, cwd.value), locale);
}

function help(): TerminalLine[] {
  return [
    ...publicCommands.map((name) => out(`${pad(name, 10)} ${t(`terminal.help.${name}`)}`)),
    out("", "muted"),
    out("// some commands are not listed", "muted")
  ];
}

function whoami(): TerminalLine[] {
  return [
    out("Akkraizen aka kiNgchev", "accent"),
    out("Kotlin, Go & Rust enjoyer. Bots, servers, scripts and SPA."),
    out("Moscow, UTC+3. Loves chess and cats. Ich lerne Deutsch."),
    out("", "muted"),
    ...rank()
  ];
}

function rank(): TerminalLine[] {
  const lines = [
    out(`visitor clearance: ${currentRank.value.label} [${achievementCount.value}/${achievementIds.length}]`, "accent")
  ];
  const next = nextRank.value;
  if (next) lines.push(out(`next: ${next.label} at ${next.from} secrets`, "muted"));
  return lines;
}

function hint(): TerminalLine[] {
  if (achievementCount.value < HINT_THRESHOLD)
    return [
      out(`hint: access denied. clearance ${HINT_THRESHOLD}/${achievementIds.length} required`, "error"),
      out(`current: ${achievementCount.value}/${achievementIds.length}`, "muted")
    ];
  const missing = missingAchievements();
  if (!missing.length) return [out("nothing left to hide. you have seen it all.", "accent")];
  const pick = missing[Math.floor(Math.random() * missing.length)];
  return [
    out(`// intercepted fragment (${missing.length} secrets remain)`, "muted"),
    out(hints[pick], "accent")
  ];
}

function listProjects(locale: Locale): TerminalLine[] {
  return getProjectsForLocale(locale).map((project) =>
    out(`${pad(projectSlug(project) + "/", 20)} ${project.id}  ${project.stack.join(", ")}`)
  );
}

function ls(target: string | undefined, locale: Locale): TerminalLine[] {
  const found = lookup(target ?? ".", locale);
  if (!found) return [out(`ls: cannot access '${target}': no such file or directory`, "error")];
  if (found.node.kind === "file") return [out(found.parts[found.parts.length - 1])];
  if (found.node.route === pages.projects) return listProjects(locale);

  return Object.entries(found.node.children()).map(([name, node]) =>
    node.kind === "dir" ? out(`${pad(name + "/", 20)} ${node.route ?? ""}`, "accent") : out(name)
  );
}

function cd(target: string | undefined, locale: Locale): TerminalLine[] {
  const found = lookup(target ?? "~", locale);
  if (!found) return [out(`cd: no such page: ${target}`, "error")];
  if (found.node.kind !== "dir") return [out(`cd: not a directory: ${target}`, "error")];
  cwd.value = found.parts;
  if (found.node.route) navigate(found.node.route);
  return [out(found.node.route ?? formatPath(found.parts), "muted")];
}

async function cat(target: string, locale: Locale): Promise<TerminalLine[]> {
  const found = lookup(target, locale) ?? (target.toLowerCase() === "cv" ? lookup("~/cv", locale) : null);
  if (!found) return [out(`cat: ${target}: no such file or directory`, "error")];
  let node: VfsNode = found.node;
  if (node.kind === "dir") {
    const index = node.index ? childOf(node, node.index, locale) : null;
    if (!index) return [out(`cat: ${target}: is a directory`, "error")];
    node = index.node;
  }
  if (node.kind !== "file") return [out(`cat: ${target}: is a directory`, "error")];
  return (await node.read()).map((line) => out(line, line.startsWith("#") ? "accent" : "output"));
}

function man(command: string | undefined): TerminalLine[] {
  if (!command) return [out("what manual page do you want? try 'man man'", "error")];
  const name = command.toLowerCase() as PublicCommand;
  if (!(name in synopsis)) return [out(`no manual entry for ${command}`, "error")];
  return [
    out("NAME", "accent"),
    out(`    ${name} - ${t(`terminal.help.${name}`)}`),
    out("SYNOPSIS", "accent"),
    out(`    ${synopsis[name]}`)
  ];
}

function pathCandidates(partial: string, locale: Locale, filesToo: boolean): string[] {
  const slash = partial.lastIndexOf("/");
  const base = slash >= 0 ? partial.slice(0, slash + 1) : "";
  const rest = partial.slice(slash + 1).toLowerCase();
  const dir = lookup(base || ".", locale);
  if (!dir || dir.node.kind !== "dir") return [];
  return Object.entries(dir.node.children())
    .filter(([name, node]) => name.toLowerCase().startsWith(rest) && (filesToo || node.kind === "dir"))
    .map(([name, node]) => `${base}${name}${node.kind === "dir" ? "/" : ""}`);
}

function argumentCandidates(command: string, partial: string, locale: Locale): string[] {
  const starts = (values: string[]) => values.filter((value) => value.startsWith(partial.toLowerCase()));
  switch (command) {
    case "cd":
    case "ls":
      return pathCandidates(partial, locale, false);
    case "cat":
      return [...pathCandidates(partial, locale, true), ...starts(["cv"])];
    case "open":
      return starts([...getProjectsForLocale(locale).map(projectSlug), ...Object.keys(socials)]);
    case "theme":
      return starts(availableThemes());
    case "lang":
      return starts(hasAchievement("polyglot") ? ["en", "ru", "l33t"] : ["en", "ru"]);
    case "sound":
      return starts(["on", "off"]);
    case "man":
      return starts([...publicCommands]);
  }
  return [];
}

export interface Completion {
  value: string;
  options: string[];
}

export function complete(input: string): Completion {
  const tokens = input.split(" ");
  const partial = tokens[tokens.length - 1];
  const candidates =
    tokens.length === 1
      ? completions.filter((name) => name.startsWith(partial.toLowerCase()))
      : [...new Set(argumentCandidates(tokens[0].toLowerCase(), partial, currentLocale.value))];

  if (!candidates.length) return { value: input, options: [] };
  const head = tokens.slice(0, -1).join(" ");
  const join = (value: string) => (head ? `${head} ${value}` : value);
  if (candidates.length === 1) {
    const [only] = candidates;
    return { value: join(only.endsWith("/") ? only : `${only} `), options: [] };
  }

  let prefix = candidates[0];
  for (const candidate of candidates)
    while (!candidate.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
  return { value: join(prefix.length > partial.length ? prefix : partial), options: candidates };
}

function open(target: string | undefined, locale: Locale): TerminalLine[] {
  if (!target) return [out("usage: open <project id|name|link>", "error")];
  const query = target.toLowerCase();

  const project = getProjectsForLocale(locale).find(
    (item) => item.id === query.padStart(3, "0") || item.name.toLowerCase() === query || projectSlug(item) === query
  );
  if (project) {
    navigate(`${pages.projects}/${project.id}`);
    return [out(`opening ${project.name}...`, "accent")];
  }

  if (openSocial(query)) return [out(`uplink to ${socials[query].name} established`, "accent")];
  return [out(`open: nothing found for '${target}'`, "error")];
}

async function stats(): Promise<TerminalLine[]> {
  const data = useLiveStats();
  await loadLiveStats();
  const lines: TerminalLine[] = [];
  const value = (number: number | null | undefined) => (number == null ? "--" : String(number));

  if (data.github.data) {
    const github = data.github.data;
    lines.push(out("[github]", "accent"));
    lines.push(out(`repos ${github.repos} · stars ${github.stars} · followers ${github.followers}`));
    lines.push(out(`langs ${github.languages.join(", ")}`));
  } else lines.push(out("[github] link lost", "error"));

  if (data.chess.data) {
    const chess = data.chess.data;
    lines.push(out("[chess]", "accent"));
    lines.push(out(`lichess blitz ${value(chess.lichessBlitz)} · chess.com blitz ${value(chess.chessBlitz)} (best ${value(chess.chessBest)})`));
  } else lines.push(out("[chess] link lost", "error"));

  if (data.codeforces.data) {
    const codeforces = data.codeforces.data;
    lines.push(out("[codeforces]", "accent"));
    lines.push(out(codeforces.rating == null ? "unrated" : `${codeforces.rating} (${codeforces.rank})`));
  } else lines.push(out("[codeforces] link lost", "error"));

  return lines;
}

function theme(name: string | undefined): TerminalLine[] {
  const options: string[] = availableThemes();
  if (!name) return [out(`themes: ${options.join(", ")}`)];
  if (!options.includes(name)) return [out(`theme: unknown theme '${name}'`, "error")];
  applyTheme(name as ThemePreference);
  return [out(`theme set to ${name}`, "accent")];
}

function secret(command: string, args: string[], context: TerminalContext): TerminalLine[] | null {
  switch (command) {
    case "sudo":
      unlockAchievement("sudo");
      playAlarm(true);
      return [out("akkraizen is not in the sudoers file. This incident will be reported.", "error")];
    case "rm":
      if (args.join(" ").includes("-rf")) {
        triggerGlitch("strong");
        playAlarm();
        unlockAchievement("rmrf");
        return [out("rm: permission denied. Nice try though.", "error")];
      }
      return [out("rm: missing operand", "error")];
    case "hisoka":
      unlockAchievement("hisoka");
      return [
        out("♠ ♥ ♣ ♦", "accent"),
        out("A true magician never runs out of tricks."),
        out("hint: ↑ ↑ ↓ ↓ ← → ← → B A", "muted"),
        out("hint: some words work even outside the terminal", "muted")
      ];
    case "konami":
      runOverdrive();
      return [out(t("secrets.konami"), "accent")];
    case "matrix":
      applyTheme("matrix");
      unlockAchievement("matrix");
      return [out("Wake up, Neo...", "accent")];
    case "coffee":
      unlockAchievement("teapot");
      return [out("418 I'm a teapot", "error")];
    case "vim":
      unlockAchievement("vim");
      return [out("You are now trapped. Just kidding: type 'exit'.", "muted")];
    case "overclock":
      toggleOverclock();
      return [out("// clock multiplier unlocked", "accent")];
    case "afk":
      context.close();
      setTimeout(startScreensaver, 300);
      return [];
    case "finale":
      if (!allUnlocked.value) return null;
      context.close();
      setTimeout(startFinale, 300);
      return [];
    case "exit()":
      context.close();
      return [];
  }
  return null;
}

export function execute(input: string, context: TerminalContext): Output {
  const [rawCommand = "", ...args] = input.trim().split(/\s+/);
  const command = rawCommand.toLowerCase();
  const locale = currentLocale.value;

  switch (command) {
    case "":
      return [];
    case "help":
      return help();
    case "whoami":
      return whoami();
    case "man":
      return man(args[0]);
    case "ls":
      return ls(args[0], locale);
    case "cd":
      return cd(args[0], locale);
    case "pwd":
      return [out(promptPath.value)];
    case "cat":
      if (!args.length) {
        unlockAchievement("cat");
        return [out(" /\\_/\\", "accent"), out("( o.o )", "accent"), out(" > ^ <", "accent")];
      }
      return cat(args.join(" "), locale);
    case "projects":
      return listProjects(locale);
    case "open":
      return open(args.join(" ") || undefined, locale);
    case "snake":
      if (!context.startGame) return [out("snake: no display attached", "error")];
      context.startGame();
      return [];
    case "socials":
      return Object.entries(socials).map(([key, social]) => out(`${pad(key, 12)} ${social.link}`));
    case "stats":
      return stats();
    case "theme":
      return theme(args[0]?.toLowerCase());
    case "lang": {
      const target = args[0]?.toLowerCase();
      const leetAllowed = hasAchievement("polyglot");
      if (target === "l33t" && leetAllowed) {
        setLeet();
        return [out("l4ng 537 70 l337", "accent")];
      }
      if (target && target !== "en" && target !== "ru")
        return [out(`usage: lang [en|ru${leetAllowed ? "|l33t" : ""}]`, "error")];
      switchLanguage(target as Locale | undefined);
      return [out(`lang set to ${leetMode.value ? "l33t" : currentLocale.value}`, "accent")];
    }
    case "sound": {
      const target = args[0]?.toLowerCase();
      if (target && target !== "on" && target !== "off") return [out("usage: sound [on|off]", "error")];
      setSound(target ? target === "on" : true);
      return [out(`sound ${target ?? "on"}`, "accent")];
    }
    case "hint":
      return hint();
    case "cv":
      navigate(pages.cv);
      return [out(pages.cv, "muted")];
    case "date":
      return [out(new Date().toString())];
    case "clear":
      context.clear();
      return [];
    case "exit":
      context.close();
      return [];
  }

  if (secretCommands.includes(command)) {
    const result = secret(command, args, context);
    if (result) return result;
  }

  return [out(t("terminal.unknown", { command: rawCommand }), "error")];
}
