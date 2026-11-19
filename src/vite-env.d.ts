/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_UMAMI_SRC?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_DOMAINS?: string;
}

declare module "virtual:cv" {
  import type { CvEntry } from "@/model/cv.ts";
  export const cvEntries: CvEntry[];
}

declare module "virtual:github-repos" {
  import type { RepoInfo } from "@/model/repo.ts";
  export const repos: Record<string, RepoInfo>;
}

declare module "*&imagetools" {
  const src: string;
  export default src;
}
