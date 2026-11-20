import { onScopeDispose, ref, watch, type Ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { playCloseSweep, playOpenSweep } from "@/utils/synthSounds.ts";
import { lockScroll } from "@/hook/useScrollLock.ts";

export const paletteOpen = ref(false);
export const terminalOpen = ref(false);
export const overlaysReady = ref(false);
export const hasKeyboard = useMediaQuery("(hover: hover) and (pointer: fine)");
export const isTouch = useMediaQuery("(pointer: coarse)");

const exclusiveOverlays = new Set<Ref<boolean>>();

export function registerExclusiveOverlay(state: Ref<boolean>) {
  exclusiveOverlays.add(state);
  const stop = watch(state, (open) => {
    if (!open) return;
    for (const other of exclusiveOverlays) if (other !== state) other.value = false;
  });
  onScopeDispose(() => {
    stop();
    exclusiveOverlays.delete(state);
  }, true);
}

registerExclusiveOverlay(paletteOpen);
registerExclusiveOverlay(terminalOpen);

watch(paletteOpen, (open) => (open ? playOpenSweep : playCloseSweep)());
watch(terminalOpen, (open) => (open ? playOpenSweep : playCloseSweep)());

lockScroll(() => paletteOpen.value || terminalOpen.value);

export const openPalette = () => (paletteOpen.value = true);
export const openTerminal = () => {
  terminalOpen.value = true;
};

export function closeOverlays() {
  paletteOpen.value = false;
  terminalOpen.value = false;
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function installOverlayHotkeys() {
  window.addEventListener("keydown", (event) => {
    if (!overlaysReady.value) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      paletteOpen.value = !paletteOpen.value;
      return;
    }

    if (event.code === "Backquote" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (isTyping(event.target) && !terminalOpen.value) return;
      event.preventDefault();
      terminalOpen.value = !terminalOpen.value;
      return;
    }

    if (event.key === "Escape" && (paletteOpen.value || terminalOpen.value)) {
      event.preventDefault();
      closeOverlays();
    }
  });
}
