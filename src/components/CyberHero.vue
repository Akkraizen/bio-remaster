<script setup lang="ts">
import GlitchText from "@components/GlitchText.vue";

defineProps<{
  title: string;
  subtitle: string;
  variant: "very-large" | "large" | "medium" | "small";
}>();
</script>

<template>
  <section class="hero-section">
    <GlitchText v-if="title" :text="title" tag="h1" :variant="variant" />
    <p v-if="subtitle" class="subtitle" :class="variant || 'medium'">
      {{ subtitle }}
    </p>
  </section>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.hero-section {
  text-align: left;
  border-left: 5px solid vars.$accent-color;
  padding-left: 2rem;
}

.subtitle {
  color: vars.$accent-color;
  margin-top: 1rem;

  &.very-large {
    font-size: 2rem;
    line-height: 1;

    @media (max-width: 1024px) {
      font-size: 1.5rem;
    }

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }

    @media (max-width: 370px) {
      font-size: 1rem;
    }
  }

  &.large {
    font-size: 1.5rem;
    line-height: 1;

    @media (max-width: 1024px) {
      font-size: 1.25rem;
    }

    @media (max-width: 768px) {
      font-size: 1rem;
    }

    @media (max-width: 370px) {
      font-size: 0.8rem;
    }
  }

  &.medium {
    font-size: 1.3rem;

    @media (max-width: 1024px) {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      font-size: 0.8rem;
    }

    @media (max-width: 370px) {
      font-size: 0.6rem;
    }
  }

  &.small {
    font-size: 0.8rem;

    @media (max-width: 370px) {
      font-size: 0.6rem;
    }
  }
}
</style>
