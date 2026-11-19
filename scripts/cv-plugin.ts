import { readdir } from "node:fs/promises";
import * as path from "node:path";
import type { Plugin } from "vite";
import { parseCvPdf } from "./cv-pdf.ts";
import type { CvEntry } from "../src/model/cv.ts";

const MODULE_ID = "virtual:cv";
const RESOLVED_ID = `\0${MODULE_ID}`;
const FILE_PATTERN = /^resume-([a-z]{2})\.pdf$/;
export const CV_PUBLIC_DIR = "cv";

export async function loadCvEntries(publicDir: string): Promise<CvEntry[]> {
  const dir = path.join(publicDir, CV_PUBLIC_DIR);
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }

  const entries: CvEntry[] = [];
  for (const file of files.sort()) {
    const match = file.match(FILE_PATTERN);
    if (!match) continue;
    entries.push({
      locale: match[1],
      file: `/${CV_PUBLIC_DIR}/${file}`,
      document: await parseCvPdf(path.join(dir, file))
    });
  }
  return entries;
}

export function cvPlugin(): Plugin {
  let publicDir = "";

  return {
    name: "cv-pdf",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const entries = await loadCvEntries(publicDir);
      return `export const cvEntries = ${JSON.stringify(entries)};`;
    },
    configureServer(server) {
      const dir = path.resolve(publicDir, CV_PUBLIC_DIR);
      server.watcher.add(dir);
      const refresh = (file: string) => {
        if (!path.resolve(file).startsWith(dir) || !file.endsWith(".pdf")) return;
        const module = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    }
  };
}
