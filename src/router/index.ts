import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import Entrypoint from "@views/Entrypoint.vue";
import { playTransitionSound } from "@/utils/synthSounds.ts";
import { metaTags, projectMeta, staticPages, type PageMeta } from "@/config/seo.ts";
import { getProjectsForLocale } from "@/model/project.ts";
import { currentLocale } from "@/i18n";
import { enterScreen } from "@/hook/useOutlineDraw.ts";
import { installViewTransitions } from "@/utils/viewTransitions.ts";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: staticPages["Core.Entrypoint"].path
  },
  {
    path: staticPages["Core.Entrypoint"].path,
    name: "Core.Entrypoint",
    component: Entrypoint
  },
  {
    path: staticPages["Core.File"].path,
    name: "Core.File",
    component: () => import("@views/File.vue")
  },
  {
    path: staticPages["Core.Projects"].path,
    name: "Core.Projects",
    component: () => import("@views/Projects.vue")
  },
  {
    path: "/core/projects/:id",
    name: "Core.ProjectDetail",
    component: () => import("@views/ProjectDetail.vue")
  },
  {
    path: staticPages["Core.Activity"].path,
    name: "Core.Activity",
    component: () => import("@views/Activity.vue")
  },
  {
    path: staticPages["Core.CV"].path,
    name: "Core.CV",
    component: () => import("@views/CV.vue")
  },
  {
    path: staticPages["Core.Uplink"].path,
    name: "Core.Uplink",
    component: () => import("@views/Uplink.vue")
  },
  ...(import.meta.env.DEV
    ? [
        {
          path: staticPages["Core.Test"].path,
          name: "Core.Test",
          component: () => import("@views/Test.vue")
        }
      ]
    : []),
  {
    path: "/:pathMatch(.*)*",
    name: "Core.NotFound",
    component: () => import("@views/NotFound.vue")
  }
];

const HASH_SCROLL_DELAY_MS = 700;

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (!to.hash) return to.path !== from.path ? { top: 0 } : false;
    return new Promise((resolve) =>
      setTimeout(() => resolve({ el: to.hash, top: 90, behavior: "smooth" }), HASH_SCROLL_DELAY_MS)
    );
  }
});

installViewTransitions(router);

function resolveMeta(name: string, path: string, id: unknown): PageMeta {
  if (name === "Core.ProjectDetail") {
    const project = getProjectsForLocale(currentLocale.value).find((p) => p.id === id);
    if (project) return projectMeta(project);
  }

  const page = staticPages[name as keyof typeof staticPages] ?? staticPages["Core.NotFound"];
  return { ...page, path };
}

function applyMeta(meta: PageMeta) {
  document.title = meta.title;
  for (const [selector, attribute, value] of metaTags(meta))
    document.querySelector(selector)?.setAttribute(attribute, value);
}

router.beforeEach((to) => {
  applyMeta(resolveMeta(String(to.name), to.path, to.params.id));
});

router.afterEach((to, from) => {
  if (to.path !== from.path) enterScreen(to.path);
  if (to.path !== from.path) {
    playTransitionSound()
  }
});

export default router;
