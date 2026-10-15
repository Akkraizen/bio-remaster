import type { Directive } from "vue";

const STAGGER_MS = 80;

type RevealCallback = () => void;
const callbacks = new WeakMap<Element, RevealCallback>();

let observer: IntersectionObserver | null = null;

function reveal(element: HTMLElement, delay = 0) {
  element.style.setProperty("--reveal-delay", `${delay}ms`);
  element.classList.add("revealed");
  callbacks.get(element)?.();
  callbacks.delete(element);
}

function getObserver(): IntersectionObserver | null {
  if (observer || typeof IntersectionObserver === "undefined") return observer;

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left
        );

      visible.forEach((entry, index) => {
        observer?.unobserve(entry.target);
        reveal(entry.target as HTMLElement, index * STAGGER_MS);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  return observer;
}

export const vReveal: Directive<HTMLElement, RevealCallback | undefined> = {
  mounted(element, binding) {
    if (binding.value) callbacks.set(element, binding.value);
    element.classList.add("reveal");

    const io = getObserver();
    if (io) io.observe(element);
    else reveal(element);
  },
  unmounted(element) {
    observer?.unobserve(element);
    callbacks.delete(element);
  }
};
