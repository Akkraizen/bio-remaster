import { ref } from "vue";

export const finaleActive = ref(false);

export const startFinale = () => {
  finaleActive.value = true;
};
