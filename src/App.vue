<script setup lang="ts">
import { ref } from "vue";
import CyberNavbar from "@components/CyberNavbar.vue";
import LoadingScreen from "@components/LoadingScreen.vue";
import CyberFooter from "@components/CyberFooter.vue";

const isLoading = ref(true);
</script>

<template>
  <transition name="glitch" mode="out-in">
    <LoadingScreen v-if="isLoading" @finished="isLoading = false" />
    <div v-else class="app-container">
      <div class="grid-bg"></div>
      <div class="scanline"></div>

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
