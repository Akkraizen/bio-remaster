import { defineConfig, runnerImport, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { imagetools } from "vite-imagetools";
import { renderOgImage, type OgCard } from "./scripts/og-image.ts";
import { cvPlugin, loadCvEntries } from "./scripts/cv-plugin.ts";
import { githubPlugin } from "./scripts/github-plugin.ts";
import { apiDevPlugin } from "./scripts/api-dev.ts";
import type { CvDocument, CvRun } from "./src/model/cv.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import packageJson from "./package.json";
import { bootConfig } from "./src/config/boot.ts";
import {
  absoluteUrl,
  indexedPages,
  metaTags,
  ogImagePath,
  projectMeta,
  siteName,
  siteUrl,
  staticPages,
  type PageMeta
} from "./src/config/seo.ts";

const BOOT_CONFIG_PLACEHOLDER = "__BOOT_CONFIG__";

const alias = {
  "@": path.resolve(__dirname, "./src"),
  "@style": path.resolve(__dirname, "./src/common/style"),
  "@assets": path.resolve(__dirname, "./src/assets/"),
  "@components": path.resolve(__dirname, "./src/components"),
  "@views": path.resolve(__dirname, "./src/views")
};

function bootConfigPlugin(): Plugin {
  return {
    name: "boot-config",
    transformIndexHtml(html) {
      if (!html.includes(BOOT_CONFIG_PLACEHOLDER))
        throw new Error(
          `index.html is missing the ${BOOT_CONFIG_PLACEHOLDER} placeholder`
        );
      return html.replace(BOOT_CONFIG_PLACEHOLDER, JSON.stringify(bootConfig));
    }
  };
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function renderMeta(html: string, meta: PageMeta): string {
  let result = html.replace(
    /<title>[^<]*<\/title>/,
    () => `<title>${escapeHtml(meta.title)}</title>`
  );

  for (const [selector, attribute, value] of metaTags(meta)) {
    const [, tag, key, keyValue] = selector.match(/^(\w+)\[([\w-]+)="([^"]+)"\]$/)!;
    const element = new RegExp(`<${tag}\\s[^>]*\\b${key}="${keyValue}"[^>]*>`);
    if (!element.test(result))
      throw new Error(`index.html is missing ${selector}`);
    result = result.replace(element, (match) =>
      match.replace(
        new RegExp(`\\s${attribute}="[^"]*"`),
        () => ` ${attribute}="${escapeHtml(value)}"`
      )
    );
  }

  return result;
}

interface PrerenderProject {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  source?: string;
  demo?: string;
  image?: string;
  stack: string[];
}

interface ProjectModule {
  getProjectsForLocale(locale: "en"): PrerenderProject[];
}

interface PrerenderData {
  locale: {
    entrypoint: { subtitle: string };
    file: { biographyText: string; nicknames: readonly string[]; locationValue: string };
  };
  socials: Record<string, { name: string; link: string }>;
  techName: (id: string) => string;
  projects: PrerenderProject[];
  cv: CvDocument | null;
}

function runsToHtml(runs: CvRun[]) {
  return runs
    .map((run) => {
      const text = run.bold ? `<strong>${escapeHtml(run.text)}</strong>` : escapeHtml(run.text);
      return run.href ? `<a href="${escapeHtml(run.href)}">${text}</a>` : text;
    })
    .join("");
}

function cvToHtml(cv: CvDocument) {
  const sections = cv.sections
    .map((section) => {
      const blocks = section.blocks
        .map((block) => {
          if (block.type === "list") return `<ul>${block.items.map((item) => `<li>${runsToHtml(item)}</li>`).join("")}</ul>`;
          if (block.type === "subheading") return `<h3>${runsToHtml(block.runs)}</h3>`;
          return `<p>${runsToHtml(block.runs)}</p>`;
        })
        .join("");
      return `<h2>${escapeHtml(section.title)}</h2>${blocks}`;
    })
    .join("\n");
  return `<h1>${escapeHtml(cv.title)}</h1>\n<p>${runsToHtml(cv.contacts)}</p>\n${sections}`;
}

const unescapeI18n = (value: string) => value.replace(/\{'([^']*)'\}/g, "$1");

function link(href: string, text: string, external = false) {
  const attributes = external ? ' target="_blank" rel="noopener"' : "";
  return `<a href="${escapeHtml(href)}"${attributes}>${escapeHtml(text)}</a>`;
}

function renderStaticContent(meta: PageMeta, data: PrerenderData): string {
  const nav = indexedPages.map((page) => `<li>${link(page.path, page.title.split(" | ")[0])}</li>`).join("");
  const socials = Object.values(data.socials)
    .map((social) => `<li>${link(social.link, social.name, true)}</li>`)
    .join("");
  const projectList = data.projects
    .map(
      (project) =>
        `<li>${link(`/core/projects/${project.id}`, project.name)}: ${escapeHtml(project.description)}</li>`
    )
    .join("");

  let body: string;
  if (meta.path === staticPages["Core.File"].path)
    body = `<h1>${escapeHtml(siteName)}</h1>
<p>${unescapeI18n(data.locale.file.biographyText.trim())}</p>
<p>Also known as: ${data.locale.file.nicknames.slice(0, -1).map(escapeHtml).join(", ")}. Location: ${escapeHtml(data.locale.file.locationValue)}.</p>
<h2>Links</h2><ul>${socials}</ul>`;
  else if (meta.path === staticPages["Core.Projects"].path)
    body = `<h1>Projects</h1><p>${escapeHtml(meta.description)}</p><ul>${projectList}</ul>`;
  else if (meta.path === staticPages["Core.CV"].path)
    body = data.cv ? cvToHtml(data.cv) : `<h1>${escapeHtml(siteName)}: CV</h1><ul>${socials}</ul>`;
  else if (meta.path === staticPages["Core.Uplink"].path)
    body = `<h1>Uplink</h1><p>${escapeHtml(meta.description)}</p><ul>${socials}</ul>`;
  else if (meta.path === staticPages["Core.Activity"].path)
    body = `<h1>Activity</h1><p>${escapeHtml(meta.description)}</p><ul>${socials}</ul>`;
  else {
    const project = data.projects.find((item) => meta.path === `/core/projects/${item.id}`);
    body = project
      ? `<h1>${escapeHtml(project.name)}</h1>
<p>${escapeHtml(project.fullDescription)}</p>
<p>Stack: ${project.stack.map((id) => escapeHtml(data.techName(id))).join(", ")}</p>
<ul>${project.source ? `<li>${link(project.source, "Source code", true)}</li>` : ""}${project.demo ? `<li>${link(project.demo, "Live demo", true)}</li>` : ""}<li>${link(staticPages["Core.Projects"].path, "All projects")}</li></ul>`
      : `<h1>${escapeHtml(siteName)}</h1><p>${escapeHtml(unescapeI18n(data.locale.entrypoint.subtitle))}</p><p>${escapeHtml(meta.description)}</p><h2>Projects</h2><ul>${projectList}</ul>`;
  }

  return `<div class="prerender"><nav><ul>${nav}</ul></nav><main>${body}</main></div>`;
}

function personSchema(data: PrerenderData): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteName,
    alternateName: data.locale.file.nicknames.slice(1, -1),
    url: siteUrl,
    image: absoluteUrl("/avatar.jpg"),
    address: { "@type": "PostalAddress", addressLocality: "Moscow", addressCountry: "RU" },
    sameAs: Object.values(data.socials).map((social) => social.link)
  };
  return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\u003c")}</script>`;
}

function renderPage(template: string, meta: PageMeta, data: PrerenderData): string {
  return renderMeta(template, meta)
    .replace("</head>", () => `    ${personSchema(data)}
  </head>`)
    .replace('<div id="app"></div>', () => `<div id="app">${renderStaticContent(meta, data)}</div>`);
}

function seoPagesPlugin(): Plugin {
  let outDir = "";
  let publicDir = "";

  return {
    name: "seo-pages",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      publicDir = config.publicDir;
    },
    writeBundle: {
      sequential: true,
      order: "pre",
      async handler() {
        const runnerConfig = { configFile: false as const, resolve: { alias }, logLevel: "silent" as const };
        const { module: projectModule } = await runnerImport<ProjectModule>(
          "/src/model/project.ts",
          runnerConfig
        );

        const { module: localeModule } = await runnerImport<{ default: PrerenderData["locale"] }>(
          "/src/i18n/locales/en.ts",
          runnerConfig
        );
        const { module: socialModule } = await runnerImport<{ default: PrerenderData["socials"] }>(
          "/src/assets/socials/index.ts",
          runnerConfig
        );
        const { module: techModule } = await runnerImport<{
          rawTechnologies: Record<string, { name: string } | undefined>;
        }>("/src/assets/technologies/index.ts", runnerConfig);

        const projects = projectModule.getProjectsForLocale("en");
        const data: PrerenderData = {
          locale: localeModule.default,
          socials: socialModule.default,
          techName: (id) => techModule.rawTechnologies[id]?.name ?? id,
          projects,
          cv: (await loadCvEntries(publicDir)).find((entry) => entry.locale === "ru")?.document ?? null
        };

        const projectPages = projects.map((project) => projectMeta(project));

        const stackCounts = new Map<string, number>();
        for (const project of projects)
          for (const id of project.stack) stackCounts.set(id, (stackCounts.get(id) ?? 0) + 1);
        const topStack = [...stackCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => data.techName(id));

        const pageCards: Array<[PageMeta, OgCard]> = [
          [staticPages["Core.Entrypoint"], { kicker: "CORE.ENTRYPOINT", title: siteName, description: unescapeI18n(data.locale.entrypoint.subtitle) }],
          [staticPages["Core.File"], { kicker: "CORE.FILE", title: siteName, description: staticPages["Core.File"].description, tags: topStack }],
          [staticPages["Core.Projects"], { kicker: "CORE.PROJECTS", title: "Projects", description: `${projects.length} projects. ${staticPages["Core.Projects"].description}` }],
          [staticPages["Core.Activity"], { kicker: "CORE.ACTIVITY", title: "Activity", description: staticPages["Core.Activity"].description }],
          [staticPages["Core.Uplink"], { kicker: "CORE.UPLINK", title: "Uplink", description: staticPages["Core.Uplink"].description }],
          [
            staticPages["Core.CV"],
            {
              kicker: "CORE.CV",
              title: "Curriculum vitae",
              description: data.cv ? [data.cv.title, data.cv.subtitle].filter(Boolean).join(" — ") : staticPages["Core.CV"].description,
              tags: topStack
            }
          ],
          ...projects.map((project): [PageMeta, OgCard] => [
            projectMeta(project),
            {
              kicker: `PROJECT ${project.id}`,
              title: project.name,
              description: project.description,
              tags: project.stack.map(data.techName)
            }
          ])
        ];

        const avatarPath = path.join(publicDir, "avatar.jpg");
        await mkdir(path.join(outDir, "og"), { recursive: true });
        await Promise.all(
          pageCards.map(async ([page, card]) =>
            writeFile(path.join(outDir, ogImagePath(page.path)), await renderOgImage(card, avatarPath))
          )
        );

        const template = await readFile(path.join(outDir, "index.html"), "utf8");
        const pages = [...indexedPages, ...projectPages];

        await writeFile(
          path.join(outDir, "index.html"),
          renderPage(template, staticPages["Core.Entrypoint"], data)
        );

        for (const page of pages) {
          const target = path.join(outDir, page.path, "index.html");
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, renderPage(template, page, data));
        }

        const urls = pages
          .map((page) => `  <url><loc>${absoluteUrl(page.path)}</loc></url>`)
          .join("\n");
        await writeFile(
          path.join(outDir, "sitemap.xml"),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
        );
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    imagetools(),
    cvPlugin(),
    githubPlugin(),
    apiDevPlugin(),
    bootConfigPlugin(),
    seoPagesPlugin(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: "Akkraizen | Bio",
        short_name: "Akkraizen",
        description: "Akkraizen's personal biography.",
        start_url: staticPages["Core.Entrypoint"].path,
        display: "standalone",
        theme_color: "#c6ff33",
        background_color: "#050505",
        icons: [
          { src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,webp,wav,webmanifest}"],
        globIgnores: ["og/**"],
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/\.[a-z0-9]+$/i, /^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://cdn.jsdelivr.net" &&
              url.pathname.startsWith("/gh/JetBrains/JetBrainsMono/"),
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "vue-i18n", "@vueuse/core"]
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  }
});
