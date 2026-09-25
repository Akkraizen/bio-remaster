<script setup lang="ts">
import { computed } from "vue";
import CyberHero from "@components/CyberHero.vue";
import Project from "@components/Project.vue";
import { getProjectsForLocale } from "@/model/project";
import { useVersion } from "@/hook/useVersion";
import { useI18n } from "@/i18n";

const version = useVersion();
const { locale, t } = useI18n();
const currentProjects = computed(() => getProjectsForLocale(locale.value));
</script>

<template>
  <main class="view">
    <CyberHero
      :title="t('projects.title')"
      :subtitle="t('projects.subtitle', { count: currentProjects.length, version })"
      variant="medium"
    />

    <div class="projects-list">
      <Project
        v-for="project in currentProjects"
        :key="project.id"
        v-bind="project"
        class="project-item"
      />
    </div>
  </main>
</template>

<style scoped lang="scss">
.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.project-item {
  height: 100%;
}
</style>
