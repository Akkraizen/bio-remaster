<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import CyberNavbar from "@components/CyberNavbar.vue";
import LoadingScreen from "@components/LoadingScreen.vue";
import CyberFooter from "@components/CyberFooter.vue";
import InitScreen from "@components/InitScreen.vue";
import GlitchOverlay from "@components/GlitchOverlay.vue";
import CyberCursor from "@components/CyberCursor.vue";
import {
  enableAmbient,
  playStatic,
  playTransitionSound
} from "@/utils/synthSounds.ts";
import { scrambleTextIn } from "@/utils/scrambleText.ts";
import { useI18n } from "@/i18n";
import { preferences } from "@/hook/usePreferences.ts";

const SESSION_STORAGE_KEY = "session_initialized";

function shouldSkipInit(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (sessionStorage.getItem(SESSION_STORAGE_KEY) === "true")
      return true;

    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      return true;
    }

    const legacyNav = (window.performance as unknown as { navigation?: { type?: number } })?.navigation;
    if (legacyNav && legacyNav.type === 1) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      return true;
    }
  } catch {
    // ignore sessionStorage errors in restricted environments
  }

  return false;
}

const skipIntro = preferences.setupCompleted && shouldSkipInit();
const isInit = ref(!skipIntro);
const isLoading = ref(false);

const { locale } = useI18n();
watch(locale, async () => {
  await nextTick();
  scrambleTextIn(document.body);
  playStatic();
});

if (skipIntro) enableAmbient();

function handleInitFinished() {
  isInit.value = false;
  isLoading.value = true;
}

function handleLoadingFinished() {
  isLoading.value = false;
  enableAmbient();
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}
</script>

<template>
  <transition
    name="glitch"
    mode="out-in"
    @before-enter="playTransitionSound()"
    @after-leave="playTransitionSound()"
  >
    <InitScreen v-if="isInit" @finished="handleInitFinished" />
    <LoadingScreen v-else-if="isLoading" @finished="handleLoadingFinished" />
    <div v-else class="app-container">
      <div class="grid-bg"></div>
      <div class="scanline"></div>
      <GlitchOverlay />

      <header class="cyber-navbar">
        <CyberNavbar />
      </header>

      <main class="content-wrapper">
        <router-view v-slot="{ Component, route }">
          <transition name="glitch" mode="out-in">
            <div :key="route.path" class="page-container">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>

      <footer class="cyber-footer">
        <CyberFooter />
      </footer>
    </div>
  </transition>

  <CyberCursor />
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  transition: filter 0.5s ease;
  min-height: 100vh;
}

.cyber-navbar {
  position: fixed;
  width: 100%;
  top: -1px;
  z-index: 1000;
}

.content-wrapper {
  margin-top: 64px;
  flex-grow: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 100vw;
}

.page-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.cyber-footer {
  margin-top: auto;
}
</style>
