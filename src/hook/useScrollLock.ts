import { onScopeDispose, watch, type Ref } from "vue";

const locks = new Set<symbol>();

function sync() {
  const root = document.documentElement;
  if (locks.size) {
    if (!root.classList.contains("overlay-open")) {
      const gap = window.innerWidth - root.clientWidth;
      root.style.setProperty("--scrollbar-gap", `${Math.max(gap, 0)}px`);
      root.classList.add("overlay-open");
    }
  } else {
    root.classList.remove("overlay-open");
    root.style.removeProperty("--scrollbar-gap");
  }
}

export function lockScroll(source: Ref<boolean> | (() => boolean)) {
  const key = Symbol("scroll-lock");

  const stop = watch(
    source,
    (locked) => {
      if (locked) locks.add(key);
      else locks.delete(key);
      sync();
    },
    { immediate: true }
  );

  const release = () => {
    stop();
    locks.delete(key);
    sync();
  };

  onScopeDispose(release, true);
  return release;
}
