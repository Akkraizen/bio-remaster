<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import NavLink from "@components/NavLink.vue";
import CyberBadge from "@components/CyberBadge.vue";
import CyberOutline from "@components/CyberOutline.vue";
import CyberHero from "@components/CyberHero.vue";
import { playClickSound, playTransitionSound } from "@/utils/playTransitionSound.ts";
import { useI18n } from "@/i18n";

const route = useRoute();
const { locale, toggleLocale, t } = useI18n();

const isMenuOpen = ref(false);

const navLinks = computed(() => [
  { path: "/core/entrypoint", label: t("nav.entrypoint") },
  { path: "/core/file", label: t("nav.file") },
  { path: "/core/projects", label: t("nav.projects") }
]);

const handleBadgeClick = () => {
  playClickSound();
  toggleLocale();
};

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
      backgroundColor="black"
      hover-background-color="black"
    >
      <div class="cyber-navbar-main">
        <CyberBadge
          :text="locale.toUpperCase()"
          type="status"
          shape="diagonal-tr-bl"
          active
          interactive
          @click="handleBadgeClick"
        />

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
      @before-enter="playTransitionSound()"
      @after-leave="playTransitionSound()"
    >
      <div v-if="isMenuOpen" class="mobile-menu">
        <div class="mobile-menu-content">
          <div class="menu-header">
            <CyberHero
              title=""
              :subtitle="t('nav.systemNavLinking')"
              variant="small"
            />
          </div>
          <nav class="mobile-nav">
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
            <p>{{ t("nav.authGranted") }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
@use "@style/_vars";

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
  gap: 2rem;
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
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding-bottom: 5px;
  font-size: 0.8rem;
  color: vars.$accent-color;
  border-bottom: 1px solid rgba(vars.$accent-color, 0.3);
}

.mobile-nav {
  width: 100%;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
}

.menu-footer {
  margin-top: 2rem;
  font-size: 0.7rem;
  opacity: 0.5;
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

@media (max-width: 1024px) {
  // Планшеты и мобильные: показываем переключатель вместо горизонтального меню
  .desktop-only {
    display: none !important;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>