import { createRouter, createWebHistory } from "vue-router";
import Entrypoint from "@views/Entrypoint.vue";
import File from "@views/File.vue";
import Projects from "@views/Projects.vue";
import ProjectDetail from "@views/ProjectDetail.vue";
import Test from "@views/Test.vue";
import NotFound from "@views/NotFound.vue";
import { playTransitionSound } from "@/utils/playTransitionSound.ts";

const routes = [
  {
    path: "/",
    redirect: "/core/entrypoint"
  },
  {
    path: "/core/entrypoint",
    name: "Core.Entrypoint",
    component: Entrypoint,
    meta: {
      title: "Entrypoint | Akkraizen",
      description:
        "Welcome to the digital realm of Akkraizen. Session was initialized."
    }
  },
  {
    path: "/core/file",
    name: "Core.File",
    component: File,
    meta: {
      title: "File | Akkraizen",
      description: "Personal identification and technical profile of Akkraizen."
    }
  },
  {
    path: "/core/projects",
    name: "Core.Projects",
    component: Projects,
    meta: {
      title: "List | Akkraizen",
      description: "Portfolio of digital experiments and projects."
    }
  },
  {
    path: "/core/projects/:id",
    name: "Core.ProjectDetail",
    component: ProjectDetail,
    meta: {
      title: "Detail | Akkraizen",
      description: "Detailed information about the selected project."
    }
  },
  {
    path: "/test",
    name: "Core.Test",
    component: Test,
    meta: {
      title: "Test | Akkraizen",
      description: "Component playground and UI stress tests."
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Core.NotFound",
    component: NotFound,
    meta: {
      title: "404 | Akkraizen",
      description: "The requested page was not found."
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const title = to.meta.title as string | undefined;
  const description = to.meta.description as string | undefined;

  if (title) {
    document.title = title;
  }

  if (description) {
    const selectors = ['meta[name="description"]', 'meta[property="og:description"]'];
    for (const selector of selectors) {
      document.querySelector(selector)?.setAttribute("content", description);
    }
  }
});

router.afterEach((to, from) => {
  if (to.path !== from.path) {
    playTransitionSound()
  }
});

export default router;