<script setup lang="ts">
import { computed } from "vue";
import CyberBadge from "@components/CyberBadge.vue";
import DecryptText from "@components/DecryptText.vue";
import { getTimelineForLocale } from "@/model/timeline.ts";
import { rawTechnologies } from "@assets/technologies";
import { useI18n } from "@/i18n";
import { vReveal } from "@/directives/reveal.ts";
import { getProjectsForLocale } from "@/model/project.ts";
import { staticPages } from "@/config/seo.ts";

const { locale, t } = useI18n();
const entries = computed(() => getTimelineForLocale(locale.value));
const projectNames = computed(
  () => new Map(getProjectsForLocale(locale.value).map((project) => [project.id, project.name]))
);
const projectsPath = staticPages["Core.Projects"].path;
</script>

<template>
  <ol class="cyber-timeline">
    <li v-for="entry in entries" :id="`timeline-${entry.year}`" :key="entry.year" v-reveal class="timeline-entry">
      <span class="node" aria-hidden="true"></span>
      <div class="entry-year">
        <router-link
          v-if="entry.projects.length"
          :to="{ path: projectsPath, query: { year: entry.year } }"
          class="year-link"
          :title="t('timeline.showProjects', { year: entry.year })"
        >{{ entry.year }}</router-link>
        <template v-else>{{ entry.year }}</template>
      </div>
      <div class="entry-body">
        <h4 class="entry-title"><DecryptText :text="entry.title" /></h4>
        <p class="entry-text">{{ entry.text }}</p>
        <div v-if="entry.projects.length" class="entry-projects" data-cursor-group=".entry-project">
          <router-link
            v-for="id in entry.projects.filter((projectId) => projectNames.has(projectId))"
            :key="id"
            :to="`${projectsPath}/${id}`"
            class="entry-project"
          >&gt; {{ projectNames.get(id) }}</router-link>
        </div>
        <div class="entry-tags" data-cursor-group=".cyber-badge">
          <CyberBadge
            v-for="tag in entry.tags"
            :key="tag"
            :text="rawTechnologies[tag]?.name ?? tag"
            shape="rectangle"
            type="tag"
          />
        </div>
      </div>
    </li>
  </ol>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.cyber-timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 1.5rem;
  position: relative;
  border-left: 2px dashed vars.alpha(vars.$accent-color, 0.4);
}

.timeline-entry {
  position: relative;
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 1.5rem;
  padding: 0 0 2rem;

  &:last-child {
    padding-bottom: 0;
  }
}

.node {
  position: absolute;
  left: calc(-1.5rem - 7px);
  top: 0.45rem;
  width: 12px;
  height: 12px;
  background: vars.$bg-color;
  border: 2px solid vars.$accent-color;
  transform: rotate(45deg);
}

.timeline-entry:last-child .node {
  background: vars.$accent-color;
}

.entry-year {
  font-size: 1.6rem;
  font-weight: bold;
  color: vars.$accent-color;
  line-height: 1;
}

.year-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 2px solid vars.alpha(vars.$accent-color, 0.35);
  transition: border-color 0.15s steps(3);

  &:hover,
  &:focus-visible {
    border-bottom-color: vars.$accent-color;
    outline: none;
  }
}

.timeline-entry {
  scroll-margin-top: 110px;
}

.entry-projects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.6rem;
  margin: 0 0 0.75rem;
}

.entry-project {
  padding: 0.15rem 0.55rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.45);
  background: vars.alpha(vars.$accent-color, 0.06);
  color: vars.$accent-color;
  font-size: 0.75rem;
  font-weight: bold;
  text-decoration: none;
  transition: background 0.15s steps(3), color 0.15s steps(3);

  &:hover,
  &:focus-visible {
    background: vars.$accent-color;
    color: vars.$on-accent-color;
    outline: none;
  }
}

.entry-title {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  letter-spacing: 1px;
}

.entry-text {
  margin: 0 0 0.75rem;
  opacity: 0.85;
  line-height: 1.5;
}

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  :deep(.cyber-badge) {
    font-size: 0.75rem;
  }
}

@media (max-width: 600px) {
  .timeline-entry {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }

  .entry-year {
    font-size: 1.3rem;
  }
}
</style>
