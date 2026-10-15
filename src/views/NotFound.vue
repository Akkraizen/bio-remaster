<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import CyberHero from "@components/CyberHero.vue";
import CyberButton from "@components/CyberButton.vue";
import CyberCard from "@components/CyberCard.vue";
import { playAlarm, playStatic } from "@/utils/synthSounds.ts";
import { triggerGlitch } from "@/utils/glitchFx.ts";
import { reducedMotion } from "@/hook/usePreferences.ts";

const router = useRouter();

let glitchTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleGlitch = () => {
  glitchTimer = setTimeout(() => {
    if (!document.hidden && !reducedMotion()) {
      triggerGlitch(Math.random() < 0.3 ? "strong" : "ambient");
      playStatic();
    }
    scheduleGlitch();
  }, 2500 + Math.random() * 3000);
};

onMounted(() => {
  playAlarm();
  scheduleGlitch();
});

onBeforeUnmount(() => {
  if (glitchTimer) clearTimeout(glitchTimer);
});

const goHome = () => {
  router.push("/core/entrypoint");
};
</script>

<template>
  <main class="view not-found">
    <CyberHero
      title="Error.404"
      subtitle="REQUESTED COORDINATES NOT FOUND IN THE GRID"
      variant="medium"
    />

    <div class="cyber-card-content-container">
      <CyberCard title="System.Alert" is-warning>
        <div class="alert-content">
          <p class="warning-text">
            ACCESS DENIED: The resource you are looking for has been moved, deleted, or never existed.
          </p>
          <div class="actions">
            <CyberButton @click="goHome" variant="solid">
              Return to Entrypoint
            </CyberButton>
          </div>
        </div>
      </CyberCard>
    </div>
  </main>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cyber-card-content-container {
  max-width: 600px;
  margin: 2rem auto;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

// Everything on the error page uses the theme's warning color
.not-found {
  :deep(.hero-section) {
    border-left-color: var(--c-warning);
  }

  :deep(.subtitle) {
    color: var(--c-warning);
  }

  // Faster, more aggressive glitch on the title
  :deep(.glitch-text)::before {
    animation-duration: 0.9s;
  }

  :deep(.glitch-text)::after {
    animation-duration: 0.7s;
  }
}

.warning-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--c-warning);
  letter-spacing: 1px;
}

.actions {
  display: flex;
  justify-content: center;
}
</style>
