<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import CyberOutline from "@components/CyberOutline.vue";
import CyberButton from "@components/CyberButton.vue";
import { useI18n } from "@/i18n";
import { finaleActive } from "@/hook/useFinale.ts";
import { lockScroll } from "@/hook/useScrollLock.ts";
import { reducedMotion } from "@/hook/usePreferences.ts";
import { setThemePreference } from "@/hook/useTheme.ts";
import { achievementIds } from "@/utils/achievements.ts";
import { track } from "@/utils/analytics.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";
import { playAlarm, playConfirm, playStatic } from "@/utils/synthSounds.ts";

const LINE_MS = 650;

const { t } = useI18n();

const lines = computed(() => [
  t("finale.line1"),
  t("finale.line2", { total: achievementIds.length }),
  t("finale.line3"),
  t("finale.line4")
]);

const shown = ref(0);
const revealed = ref(false);
let timers: ReturnType<typeof setTimeout>[] = [];

lockScroll(finaleActive);

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function play() {
  track("finale");
  clearTimers();
  shown.value = 0;
  revealed.value = false;
  playAlarm();
  triggerGlitch("strong");

  if (reducedMotion()) {
    shown.value = lines.value.length;
    revealed.value = true;
    return;
  }

  lines.value.forEach((_, index) => {
    timers.push(
      setTimeout(() => {
        shown.value = index + 1;
        playStatic();
        if (index % 2 === 1) triggerGlitch("ambient");
      }, LINE_MS * (index + 1))
    );
  });
  timers.push(
    setTimeout(() => {
      revealed.value = true;
      triggerGlitch("strong");
      playConfirm();
    }, LINE_MS * (lines.value.length + 1.5))
  );
}

function close() {
  clearTimers();
  finaleActive.value = false;
}

function applyRoot() {
  setThemePreference("root");
  triggerGlitch("strong");
  playConfirm();
  close();
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && revealed.value) close();
};

watch(finaleActive, (active) => {
  if (active) {
    play();
    window.addEventListener("keydown", onKeydown);
  } else window.removeEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  clearTimers();
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <transition name="finale">
      <div v-if="finaleActive" class="finale" role="dialog" aria-modal="true" :aria-label="t('finale.title')">
        <div class="finale-log" aria-live="polite">
          <p v-for="(line, index) in lines.slice(0, shown)" :key="index" class="log-line">
            <span class="prompt">&gt;</span> {{ line }}
          </p>
        </div>

        <transition name="finale-card">
          <div v-if="revealed" class="finale-card">
            <CyberOutline
              shape="diagonal-tl-br"
              :corner-size="20"
              background-color="var(--c-bg)"
              hover-background-color="var(--c-bg)"
              :cursor-focus="false"
            >
              <div class="card-body">
                <p class="badge">ROOT_ACCESS_GRANTED</p>
                <h2 class="title">{{ t("finale.title") }}</h2>
                <p class="thanks">{{ t("finale.thanks") }}</p>
                <p class="signature">— Akkraizen</p>
                <p class="reward">{{ t("finale.reward") }}</p>
                <div class="actions" data-cursor-group=".cyber-button-container">
                  <CyberButton variant="solid" shape="diagonal-tl-br" :corner-size="8" full-width @click="applyRoot">
                    {{ t("finale.applyRoot") }}
                  </CyberButton>
                  <CyberButton shape="diagonal-tl-br" :corner-size="8" full-width @click="close">
                    {{ t("finale.close") }}
                  </CyberButton>
                </div>
              </div>
            </CyberOutline>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.finale {
  position: fixed;
  inset: 0;
  z-index: 9600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem 16px;
  background: vars.alpha(vars.$bg-color, 0.96);
  overflow-y: auto;
}

.finale-log {
  width: min(560px, 100%);
}

.log-line {
  margin: 0.3rem 0;
  color: vars.$accent-color;
  letter-spacing: 1px;
  animation: cyber-glitch-in 0.3s steps(1);

  .prompt {
    color: vars.$warning-color;
  }
}

.finale-card {
  width: min(560px, 100%);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
}

.badge {
  margin: 0;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  background: vars.$accent-color;
  color: vars.$on-accent-color;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.title {
  margin: 0;
  color: vars.$accent-color;
  font-size: 1.6rem;
  letter-spacing: 2px;
}

.thanks {
  margin: 0;
  line-height: 1.6;
}

.signature {
  margin: 0;
  align-self: flex-end;
  color: vars.$accent-color;
}

.reward {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.75;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;

  :deep(.cyber-button) {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .actions {
    grid-template-columns: 1fr;
  }
}

.finale-enter-active {
  animation: cyber-glitch-in 0.5s steps(1) forwards;
}

.finale-leave-active {
  animation: cyber-glitch-out 0.3s steps(1) forwards;
}

.finale-card-enter-active {
  animation: cyber-glitch-in 0.4s steps(1) forwards;
}
</style>
