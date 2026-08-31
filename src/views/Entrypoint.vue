<script setup lang="ts">
import CyberHero from "@components/CyberHero.vue";
import { useVersion } from "@/hook/useVersion";

const version = useVersion();
</script>

<template>
  <main class="view">
    <CyberHero
      title="AKKRAIZEN"
      :subtitle="`A true magician never runs out of tricks. ${version}`"
      variant="very-large"
    />
  </main>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.view {
  height: 80vh;
  justify-content: center;
}

@media (max-width: 1200px) {
  .view {
    height: 100%;
    justify-content: start;
  }
}

.bar-container {
  height: 20px;
  background: #222;
  margin: 1rem 0;
  border: 1px solid vars.$text-color;

  .bar {
    height: 100%;
    background: vars.$accent-color;
  }
}
</style>
