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
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
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
  font-size: 1rem;
  color: vars.$accent-color;
  margin-top: 1rem;
}
</style>
