<script setup lang="ts">
import { useDecrypt } from "@/hook/useDecrypt.ts";

const props = withDefaults(
  defineProps<{
    text: string;
    hover?: boolean;
  }>(),
  { hover: true }
);

const { display, replay } = useDecrypt(() => props.text);
</script>

<template>
  <span class="decrypt-text" @mouseenter="hover && replay()">
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true">{{ display }}</span>
  </span>
</template>
