import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";

const UPDATE_CHECK_MS = 30 * 60 * 1000;

export const updateAvailable = ref(false);

let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;

export function installPwaUpdates() {
  if (!("serviceWorker" in navigator)) return;
  applyUpdate = registerSW({
    onNeedRefresh() {
      updateAvailable.value = true;
    },
    onRegisteredSW(_, registration) {
      if (!registration) return;
      setInterval(() => {
        if (!navigator.onLine || document.hidden) return;
        registration.update().catch(() => {});
      }, UPDATE_CHECK_MS);
    }
  });
}

export function reloadToUpdate() {
  updateAvailable.value = false;
  applyUpdate?.(true);
}

export function dismissUpdate() {
  updateAvailable.value = false;
}
