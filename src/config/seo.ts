export const siteUrl = "https://akkraizen.dev";
export const siteName = "Akkraizen";
export const defaultImage = "/avatar.jpg";

export const ogImagePath = (path: string) =>
  `/og/${path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "index"}.png`;

const withOgImage = <T extends { path: string }>(page: T) => ({
  ...page,
  image: ogImagePath(page.path),
  largeImage: true
});

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  image?: string;
  largeImage?: boolean;
}

export const staticPages = {
  "Core.Entrypoint": withOgImage({
    path: "/core/entrypoint",
    title: "Entrypoint | Akkraizen",
    description: "Welcome to the digital realm of Akkraizen. Session was initialized."
  }),
  "Core.File": withOgImage({
    path: "/core/file",
    title: "File | Akkraizen",
    description: "Personal identification and technical profile of Akkraizen."
  }),
  "Core.Projects": withOgImage({
    path: "/core/projects",
    title: "Projects | Akkraizen",
    description: "Portfolio of digital experiments and projects."
  }),
  "Core.Activity": withOgImage({
    path: "/core/activity",
    title: "Activity | Akkraizen",
    description: "Live GitHub activity, chess ratings, Codeforces and hobbies of Akkraizen."
  }),
  "Core.CV": withOgImage({
    path: "/core/cv",
    title: "CV | Akkraizen",
    description: "Printable CV of Akkraizen: Kotlin, Go and Rust developer. Skills, projects and timeline."
  }),
  "Core.Uplink": withOgImage({
    path: "/core/uplink",
    title: "Uplink | Akkraizen",
    description: "Contact Akkraizen directly or sign the guestbook."
  }),
  "Core.Test": {
    path: "/test",
    title: "Test | Akkraizen",
    description: "Component playground and UI stress tests."
  },
  "Core.NotFound": {
    path: "/404",
    title: "404 | Akkraizen",
    description: "The requested page was not found."
  }
} satisfies Record<string, PageMeta>;

export const indexedPages: PageMeta[] = [
  staticPages["Core.Entrypoint"],
  staticPages["Core.File"],
  staticPages["Core.Projects"],
  staticPages["Core.Activity"],
  staticPages["Core.CV"],
  staticPages["Core.Uplink"]
];

export function projectMeta(project: {
  id: string;
  name: string;
  description: string;
  image?: string;
}): PageMeta {
  return {
    path: `/core/projects/${project.id}`,
    title: `${project.name} | Akkraizen`,
    description: project.description,
    image: ogImagePath(`/core/projects/${project.id}`),
    largeImage: true
  };
}

export const absoluteUrl = (path: string) => new URL(path, siteUrl).href;

export function metaTags(meta: PageMeta): Array<[selector: string, attribute: string, value: string]> {
  const url = absoluteUrl(meta.path);
  const image = absoluteUrl(meta.image ?? defaultImage);
  const card = meta.largeImage ? "summary_large_image" : "summary";

  return [
    ['meta[name="description"]', "content", meta.description],
    ['link[rel="canonical"]', "href", url],
    ['meta[property="og:url"]', "content", url],
    ['meta[property="og:title"]', "content", meta.title],
    ['meta[property="og:description"]', "content", meta.description],
    ['meta[property="og:image"]', "content", image],
    ['meta[property="twitter:card"]', "content", card],
    ['meta[property="twitter:url"]', "content", url],
    ['meta[property="twitter:title"]', "content", meta.title],
    ['meta[property="twitter:description"]', "content", meta.description],
    ['meta[property="twitter:image"]', "content", image]
  ];
}
