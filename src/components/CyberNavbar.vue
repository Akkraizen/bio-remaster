<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import NavLink from "@components/NavLink.vue";
import CyberSettings from "@components/CyberSettings.vue";
import CyberOutline from "@components/CyberOutline.vue";
import { playCloseSweep, playOpenSweep } from "@/utils/synthSounds.ts";
import { useI18n } from "@/i18n";
import CyberBadge from "@components/CyberBadge.vue";
import { openTerminal, registerExclusiveOverlay, terminalOpen } from "@/hook/useOverlays.ts";
import { lockScroll } from "@/hook/useScrollLock.ts";

const route = useRoute();
const { t } = useI18n();

const isMenuOpen = ref(false);

lockScroll(isMenuOpen);
registerExclusiveOverlay(isMenuOpen);

const navLinks = computed(() => [
  { path: "/core/entrypoint", label: t("nav.entrypoint") },
  { path: "/core/file", label: t("nav.file") },
  { path: "/core/projects", label: t("nav.projects") },
  { path: "/core/activity", label: t("nav.activity") },
  { path: "/core/uplink", label: t("nav.uplink") }
]);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

watch(
  () => route.path,
  () => {
    closeMenu();
  }
);
</script>

<template>
  <div class="cyber-navbar-container" :class="{ 'menu-open': isMenuOpen }">
    <CyberOutline
      shape="bottom-corners-no-top"
      :corner-size="20"
      backgroundColor="var(--c-bg)"
      hover-background-color="var(--c-bg)"
      :cursor-focus="false"
    >
      <div
        class="cyber-navbar-main"
        data-cursor-group=".cyber-badge, .router-link-container, .menu-toggle"
      >
        <div class="system-controls">
          <CyberSettings />
          <CyberBadge
            text=">_"
            :title="t('terminal.open')"
            :aria-label="t('terminal.open')"
            type="info"
            shape="diagonal-tl-br"
            :active="terminalOpen"
            interactive
            @click="openTerminal"
          />
        </div>

        <div class="toggle-container">
          <CyberOutline shape="diagonal-tl-br" :corner-size="10">
            <button
              class="menu-toggle"
              @click="toggleMenu"
              aria-label="Toggle navigation"
            >
              <span class="toggle-text">{{
                isMenuOpen ? t("nav.close") : t("nav.menu")
              }}</span>
              <div class="toggle-icon">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
              </div>
            </button>
          </CyberOutline>
        </div>

        <nav class="navbar-nav desktop-only">
          <NavLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            :label="link.label"
          />
        </nav>
      </div>
    </CyberOutline>

    <transition
      name="mobile-menu"
      @before-enter="playOpenSweep()"
      @before-leave="playCloseSweep()"
    >
      <div v-if="isMenuOpen" class="mobile-menu">
        <div class="mobile-menu-content">
          <div class="menu-header">
            <span class="menu-prompt">{{ t("nav.systemNavLinking") }}</span>
            <span class="menu-count">[{{ String(navLinks.length).padStart(2, "0") }}]</span>
          </div>
          <nav class="mobile-nav" data-cursor-group=".router-link-container">
            <NavLink
              v-for="(link, index) in navLinks"
              :key="link.path"
              :to="link.path"
              :label="link.label"
              :index="index"
              is-mobile
              @click="closeMenu"
            />
          </nav>
          <div class="menu-footer">
            <div class="hazard" aria-hidden="true"></div>
            <div class="menu-status">
              <span><i class="status-dot"></i>{{ t("nav.authGranted") }}</span>
              <span class="menu-location">{{ route.path }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
@use "@style/_vars";
@use "@style/_mixins";

.cyber-navbar-container {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.cyber-navbar-main {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  position: relative;
}

.system-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-container {
  position: relative;
  display: flex;
}

.menu-toggle {
  display: none;
  background: transparent;
  color: vars.$text-color;
  cursor: pointer;
  align-items: center;
  gap: 10px;
  padding: 0.4rem 0.8rem;
  position: relative;
  overflow: hidden;
  border: none;

  .toggle-text {
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 1px;
    z-index: 1;
  }

  .toggle-icon {
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 1;

    .bar {
      width: 18px;
      height: 2px;
      background: vars.$accent-color;
      transition: all 0.3s;
    }
  }

  &:hover {
    background: vars.$accent-color;
    color: vars.$bg-color;

    .bar {
      background: vars.$bg-color;
    }
  }
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-menu {
  top: 63px;
  position: fixed;
  left: 0;
  width: 100%;
  height: 100%;
  background: vars.$bg-color;
  display: flex;
  z-index: 900;
}

.mobile-menu-content {
  padding: 1.25rem 1rem calc(63px + 1rem);
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: vars.$bg-color;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0 0.25rem 0.6rem;
  border-bottom: 1px solid vars.alpha(vars.$accent-color, 0.35);
  color: vars.$accent-color;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.menu-prompt {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::after {
    content: "_";
    animation: blink 1s steps(2) infinite;
  }
}

.menu-count {
  flex-shrink: 0;
  color: vars.$text-color;
  opacity: 0.5;
}

.mobile-nav {
  width: 100%;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  margin-top: 0.5rem;
}

.menu-footer {
  margin-top: auto;
  padding-top: 1.5rem;
}

.hazard {
  height: 6px;
  @include mixins.cyberpunk-stripes(vars.$accent-color, 0.6, 5px);
}

.menu-status {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.45);
  border-top: none;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.status-dot {
  width: 6px;
  height: 6px;
  background: vars.$accent-color;
  animation: blink 1s steps(2) infinite;
}

.menu-location {
  color: vars.$accent-color;
}

.mobile-menu-enter-active {
  animation: cyber-glitch-in 0.4s steps(1) forwards;
}

.mobile-menu-leave-active {
  animation: cyber-glitch-out 0.3s steps(1) forwards;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

@media (max-width: 1000px) {
  // Tablets and mobile: show the toggle instead of the horizontal menu
  .desktop-only {
    display: none !important;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>