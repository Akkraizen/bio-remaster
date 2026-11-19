import { currentLocale } from "@/i18n";
import { preferences } from "@/hook/usePreferences.ts";
import { useTheme } from "@/hook/useTheme.ts";
import { rawProjects } from "@/model/project.ts";
import { rawTechnologies } from "@assets/technologies";
import socials from "@assets/socials";

export type BootLineStatus = "kernel" | "ok" | "info" | "warn";

export interface BootLine {
  status: BootLineStatus;
  text: string;
}

const kernel = (text: string): BootLine => ({ status: "kernel", text });
const ok = (text: string): BootLine => ({ status: "ok", text });
const info = (text: string): BootLine => ({ status: "info", text });
const warn = (text: string): BootLine => ({ status: "warn", text });

function timestamps(count: number): string[] {
  let time = 0;
  return Array.from({ length: count }, (_, index) => {
    time += index < 6 ? Math.random() * 0.004 : 0.02 + Math.random() * 0.12;
    return `[${time.toFixed(6).padStart(12, " ")}]`;
  });
}

export function createBootLog(version: string): BootLine[] {
  const { theme } = useTheme();
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const width = window.screen.width;
  const height = window.screen.height;

  const lines: BootLine[] = [
    kernel(`Linux version 6.12.0-akkraizen (akkraizen@core) (kotlinc 2.1, rustc 1.83) #${version}`),
    kernel("Command line: BOOT_IMAGE=/vmlinuz-akkraizen root=/dev/grid ro quiet splash"),
    kernel(`smpboot: Allowing ${cores} CPUs, 0 hotplug CPUs`),
    kernel(memory ? `Memory: ${memory * 1024}M available` : "Memory: available"),
    kernel(`fb0: cyberfb frame buffer device ${width}x${height}`),
    kernel(`locale: ${currentLocale.value === "ru" ? "ru_RU" : "en_US"}.UTF-8`),
    info("systemd[1]: Detected architecture x86-64."),
    info("systemd[1]: Hostname set to <akkraizen>."),
    ok("Reached target Local File Systems."),
    ok("Mounted /core/entrypoint."),
    ok("Mounted /core/file."),
    ok(`Mounted /core/projects (${rawProjects.length} entries).`),
    ok("Mounted /core/activity."),
    ok(`Loaded ${Object.keys(rawTechnologies).length} technology modules.`),
    ok(`Started theme-daemon: palette ${theme.value}.`),
    preferences.soundEnabled
      ? ok(`Started audio.service: volume ${Math.round(preferences.volume * 100)}%.`)
      : warn("audio.service: muted by user config."),
    preferences.motion === "reduced"
      ? warn("glitch.service: reduced motion, effects limited.")
      : ok("Started glitch.service."),
    ok(`Established uplink to ${Object.keys(socials).length} remote nodes.`),
    ok("Started Hisoka trick manager."),
    ok("Reached target Graphical Interface."),
    info(`akkraizen-shell ${version} ready.`)
  ];

  const stamps = timestamps(lines.length);
  return lines.map((line, index) =>
    line.status === "kernel" || line.status === "info"
      ? { ...line, text: `${stamps[index]} ${line.text}` }
      : line
  );
}
