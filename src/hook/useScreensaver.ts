import { ref } from "vue";

export const screensaverActive = ref(false);

export const startScreensaver = () => {
  screensaverActive.value = true;
};
