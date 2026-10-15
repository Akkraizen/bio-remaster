<script setup lang="ts">
import { useDecrypt } from "@/hook/useDecrypt.ts";

const props = defineProps<{
  text: string;
  tag?: string;
  variant?: "very-large" | "large" | "medium" | "small";
  chaotic?: boolean;
}>();

const { display, replay } = useDecrypt(
  () => props.text,
  props.chaotic
    ? { duration: 1500, hoverDuration: 800, chaotic: true }
    : { duration: 900 }
);
</script>

<template>
  <component
    :is="tag || 'div'"
    class="glitch-text"
    :class="variant || 'medium'"
    :data-text="display"
    @mouseenter="replay()"
  >
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true">{{ display }}</span>
  </component>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_animations";

.glitch-text {
  @include animations.glitch-base();
  display: inline-block;
  text-decoration: none;
  color: vars.$text-color;

  &.very-large {
    font-size: 8rem;
    line-height: 1;

    @media (max-width: 1024px) {
      font-size: 6rem;
    }

    @media (max-width: 768px) {
      font-size: 3.5rem;
    }

    @media (max-width: 370px) {
      font-size: 3rem;
    }
  }

  &.large {
    font-size: 6rem;
    line-height: 1;

    @media (max-width: 1024px) {
      font-size: 4.5rem;
    }

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }

    @media (max-width: 370px) {
      font-size: 1.5rem;
    }
  }

  &.medium {
    font-size: 2rem;

    @media (max-width: 1024px) {
      font-size: 1.8rem;
    }

    &::before {
      clip-path: inset(80% 0 0 0);
      animation-duration: 3s;
    }
    &::after {
      clip-path: inset(0 0 80% 0);
      animation-duration: 2s;
    }

    @media (max-width: 768px) {
      font-size: 1.6rem;
    }

    @media (max-width: 370px) {
      font-size: 1rem;
    }
  }

  &.small {
    font-size: 1.2rem;

    @media (max-width: 370px) {
      font-size: 0.8rem;
    }
  }
}
</style>
