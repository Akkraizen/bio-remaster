<script setup lang="ts">
import { useVersion } from "@/hook/useVersion";
</script>
<template>
  <div class="cyber-footer">
    <p>
      {{ "[C] " + new Date().getFullYear() + " AKKRAIZEN / " + useVersion() }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.cyber-footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.7rem;
  opacity: 0.6;
}
</style>
