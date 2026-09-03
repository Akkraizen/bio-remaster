<script setup lang="ts">
import CyberHero from "@components/CyberHero.vue";
import Project from "@components/Project.vue";
import { projects } from "@/model/project";
import { useVersion } from "@/hook/useVersion";

const version = useVersion();
</script>

<template>
  <main class="view">
    <CyberHero
      title="~/Core/Projects/"
      :subtitle="`DATABASE ENTRIES: ${projects.length} | SYSTEM VERSION ${version}`"
      variant="medium"
    />

    <div class="projects-list">
      <Project
        v-for="project in projects"
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
