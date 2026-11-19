import { computed, nextTick } from "vue";
import type { Router } from "vue-router";
import { isReducedMotion } from "@/hook/usePreferences.ts";

const supported = typeof document !== "undefined" && typeof document.startViewTransition === "function";

export const viewTransitionsEnabled = computed(() => supported && !isReducedMotion.value);

export function installViewTransitions(router: Router) {
  let finish: (() => void) | null = null;

  const release = () => {
    const done = finish;
    finish = null;
    done?.();
  };

  router.beforeResolve((to, from) => {
    if (!viewTransitionsEnabled.value || document.hidden || !from.matched.length || to.path === from.path) return;

    return new Promise<void>((resolve) => {
      const transition = document.startViewTransition(
        () =>
          new Promise<void>((done) => {
            finish = done;
            resolve();
          })
      );
      transition.ready.catch(() => resolve());
    });
  });

  router.afterEach(async () => {
    if (!finish) return;
    await nextTick();
    release();
  });

  router.onError(release);
}
