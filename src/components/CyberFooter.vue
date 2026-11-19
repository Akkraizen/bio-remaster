<script setup lang="ts">
import { useVersion } from "@/hook/useVersion";
import { useI18n } from "@/i18n";
import { terminalAvailable } from "@/hook/useOverlays.ts";
import { allUnlocked } from "@/utils/achievements.ts";

const { t } = useI18n();
</script>
<template>
  <div class="cyber-footer">
    <p v-if="terminalAvailable" class="hints">{{ t("footer.hints") }}</p>
    <p>
      {{ "[C] " + new Date().getFullYear() + " AKKRAIZEN / " + useVersion() }}
      <span v-if="allUnlocked" class="root-badge">{{ t("footerRoot") }}</span>
    </p>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.root-badge {
  margin-left: 0.5rem;
  padding: 0 0.45rem;
  background: vars.$accent-color;
  color: vars.$on-accent-color;
  font-weight: bold;
  letter-spacing: 1px;
}

.cyber-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem 1.5rem;
  padding: 1rem;
  text-align: center;
  font-size: 0.7rem;
  opacity: 0.6;

  p {
    margin: 0;
  }
}
</style>
