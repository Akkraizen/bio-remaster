<script setup lang="ts">
import CyberOutline from "@components/CyberOutline.vue";
import { useI18n } from "@/i18n";
import { dismissUpdate, reloadToUpdate, updateAvailable } from "@/hook/usePwaUpdate.ts";
import { playConfirm } from "@/utils/synthSounds.ts";

const { t } = useI18n();

const reload = () => {
  playConfirm();
  reloadToUpdate();
};
</script>

<template>
  <Teleport to="body">
    <transition name="update">
      <div v-if="updateAvailable" class="cyber-update" role="status">
        <CyberOutline
          shape="diagonal-tl-br"
          :corner-size="10"
          background-color="var(--c-bg)"
          hover-background-color="var(--c-bg)"
          :cursor-focus="false"
        >
          <div class="update-body">
            <span class="update-dot" aria-hidden="true"></span>
            <span class="update-text">{{ t("update.available") }}</span>
            <button type="button" class="update-action primary" @click="reload">{{ t("update.reload") }}</button>
            <button type="button" class="update-action" @click="dismissUpdate">{{ t("update.later") }}</button>
          </div>
        </CyberOutline>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cyber-update {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 8400;
  max-width: calc(100vw - 32px);
}

.update-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.update-dot {
  width: 8px;
  height: 8px;
  background: vars.$accent-color;
  animation: update-blink 1.2s steps(2) infinite;
}

.update-text {
  color: vars.$accent-color;
  font-weight: bold;
}

.update-action {
  padding: 0;
  border: none;
  font: inherit;
  text-transform: uppercase;
  cursor: pointer;
  @include mixins.cyber-link;

  &:not(.primary) {
    opacity: 0.75;
  }
}

@keyframes update-blink {
  50% {
    opacity: 0.2;
  }
}

.update-enter-active {
  animation: cyber-glitch-in 0.3s steps(1) forwards;
}

.update-leave-active {
  animation: cyber-glitch-out 0.2s steps(1) forwards;
}

@media (max-width: 768px) {
  .cyber-update {
    right: 16px;
    left: 16px;
    bottom: 16px;
  }
}
</style>
