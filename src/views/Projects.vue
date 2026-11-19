<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CyberHero from "@components/CyberHero.vue";
import CyberOutline from "@components/CyberOutline.vue";
import Project from "@components/Project.vue";
import { getProjectsForLocale } from "@/model/project";
import { rawTechnologies } from "@assets/technologies";
import { useVersion } from "@/hook/useVersion";
import { useI18n } from "@/i18n";
import { playHoverTick } from "@/utils/synthSounds.ts";
import { hasAchievement } from "@/utils/achievements.ts";
import { getProjectYears, timelineYears } from "@/model/timeline.ts";
import { countStack, filterProjects, tokenize, type ProjectFeature } from "@/utils/projectSearch.ts";

type Feature = ProjectFeature;

const version = useVersion();
const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();

const currentProjects = computed(() => getProjectsForLocale(locale.value));

const readList = (value: unknown) =>
  typeof value === "string" && value ? value.split(",").filter(Boolean) : [];

const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const selectedStack = ref<string[]>(readList(route.query.stack));
const selectedFeatures = ref<Feature[]>(
  readList(route.query.has).filter((item): item is Feature => item === "demo" || item === "source")
);
const projectYears = getProjectYears();
const yearOptions = timelineYears.filter((year) => [...projectYears.values()].some((years) => years.includes(year)));
const selectedYears = ref<string[]>(readList(route.query.year).filter((year) => yearOptions.includes(year)));
const input = ref<HTMLInputElement | null>(null);

const techName = (id: string) => rawTechnologies[id]?.name ?? id;

const stackOptions = computed(() => countStack(currentProjects.value, techName));

const features = computed(() => [
  { id: "demo" as Feature, label: t("projects.filterDemo") },
  { id: "source" as Feature, label: t("projects.filterSource") }
]);

const tokens = computed(() => tokenize(query.value));

const filteredProjects = computed(() =>
  filterProjects(
    currentProjects.value,
    { query: query.value, stack: selectedStack.value, features: selectedFeatures.value, years: selectedYears.value },
    techName,
    projectYears
  )
);

const showSecretProject = computed(() => hasAchievement("archivist") && !hasFilters.value);

const hasFilters = computed(
  () =>
    !!tokens.value.length ||
    !!selectedStack.value.length ||
    !!selectedFeatures.value.length ||
    !!selectedYears.value.length
);

function toggle<T>(list: T[], value: T) {
  playHoverTick();
  const index = list.indexOf(value);
  if (index === -1) list.push(value);
  else list.splice(index, 1);
}

function reset() {
  playHoverTick();
  query.value = "";
  selectedStack.value = [];
  selectedFeatures.value = [];
  selectedYears.value = [];
  input.value?.focus();
}

watch(
  [query, selectedStack, selectedFeatures, selectedYears],
  () => {
    const next: Record<string, string> = {};
    const trimmed = query.value.trim();
    if (trimmed) next.q = trimmed;
    if (selectedStack.value.length) next.stack = selectedStack.value.join(",");
    if (selectedFeatures.value.length) next.has = selectedFeatures.value.join(",");
    if (selectedYears.value.length) next.year = selectedYears.value.join(",");
    router.replace({ query: next });
  },
  { deep: true }
);

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target as HTMLElement | null;
  if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
  event.preventDefault();
  input.value?.focus();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="view">
    <CyberHero
      :title="t('projects.title')"
      :subtitle="t('projects.subtitle', { count: currentProjects.length, version })"
      variant="medium"
    />

    <section class="project-search" data-no-scramble>
      <CyberOutline
        shape="diagonal-tl-br"
        :corner-size="14"
        background-color="var(--c-bg)"
        hover-background-color="var(--c-bg)"
        :cursor-focus="false"
      >
        <label class="search-row">
          <span class="prompt" aria-hidden="true">&gt;</span>
          <input
            ref="input"
            v-model="query"
            class="search-input"
            type="search"
            spellcheck="false"
            autocomplete="off"
            :placeholder="t('projects.searchPlaceholder')"
            :aria-label="t('projects.searchPlaceholder')"
            @keydown.esc="query = ''"
          />
          <kbd class="search-hint">/</kbd>
        </label>
      </CyberOutline>

      <div class="filters">
        <div class="filter-group" data-cursor-group=".chip">
          <span class="filter-label">{{ t("projects.filterStack") }}</span>
          <button
            v-for="option in stackOptions"
            :key="option.id"
            type="button"
            class="chip"
            :class="{ active: selectedStack.includes(option.id) }"
            :aria-pressed="selectedStack.includes(option.id)"
            @click="toggle(selectedStack, option.id)"
          >
            {{ option.name }}<span class="chip-count">{{ option.count }}</span>
          </button>
        </div>

        <div class="filter-group" data-cursor-group=".chip">
          <span class="filter-label">{{ t("projects.filterHas") }}</span>
          <button
            v-for="feature in features"
            :key="feature.id"
            type="button"
            class="chip"
            :class="{ active: selectedFeatures.includes(feature.id) }"
            :aria-pressed="selectedFeatures.includes(feature.id)"
            @click="toggle(selectedFeatures, feature.id)"
          >
            {{ feature.label }}
          </button>
        </div>

        <div class="filter-group" data-cursor-group=".chip">
          <span class="filter-label">{{ t("timeline.yearLabel") }}</span>
          <button
            v-for="year in yearOptions"
            :key="year"
            type="button"
            class="chip"
            :class="{ active: selectedYears.includes(year) }"
            :aria-pressed="selectedYears.includes(year)"
            @click="toggle(selectedYears, year)"
          >
            {{ year }}
          </button>
        </div>
      </div>

      <div class="search-status">
        <span>
          {{ t("projects.searchResults", { shown: filteredProjects.length, total: currentProjects.length }) }}
        </span>
        <button v-if="hasFilters" type="button" class="reset" @click="reset">
          {{ t("projects.searchReset") }}
        </button>
      </div>
    </section>

    <div v-if="filteredProjects.length" class="projects-list" data-cursor-group=".project-item">
      <Project
        v-for="project in filteredProjects"
        :key="project.id"
        v-bind="project"
        class="project-item"
      />
      <CyberOutline
        v-if="showSecretProject"
        class="secret-project"
        shape="diagonal-tl-br"
        :corner-size="20"
        stroke-dasharray="6 4"
        :cursor-focus="false"
      >
        <article class="secret-body">
          <p class="secret-badge">{{ t("secretProject.badge") }}</p>
          <h3 class="secret-name">{{ t("secretProject.name") }}</h3>
          <p class="secret-status">{{ t("secretProject.status") }}</p>
          <p class="secret-description">{{ t("secretProject.description") }}</p>
          <p class="secret-redacted" aria-hidden="true">████████ ███ ██████████ ████</p>
        </article>
      </CyberOutline>
    </div>
    <p v-else class="empty">{{ t("projects.searchEmpty") }}</p>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.project-search {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: -1rem;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  cursor: text;
}

.prompt {
  color: vars.$accent-color;
  font-weight: bold;
}

.search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: vars.$text-color;
  font: inherit;
  font-size: 1rem;

  &::placeholder {
    color: vars.alpha(vars.$text-color, 0.4);
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
}

.search-hint {
  font-family: inherit;
  font-size: 0.7rem;
  padding: 2px 7px;
  border: 1px solid vars.alpha(vars.$accent-color, 0.5);
  color: vars.$accent-color;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  margin-right: 0.25rem;
  padding-left: 0.75rem;
  border-left: 2px solid vars.$warning-color;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.7;
}

.chip {
  --cut: 6px;
  --chip-border: #{vars.alpha(vars.$accent-color, 0.45)};
  --chip-fill: #{vars.alpha(vars.$accent-color, 0.06)};
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  background: var(--chip-border);
  border: none;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  color: vars.$text-color;
  font: inherit;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    inset: 1px;
    z-index: -1;
    background: linear-gradient(var(--chip-fill), var(--chip-fill)), vars.$bg-color;
    clip-path: polygon(
      calc(var(--cut) - 0.6px) 0,
      100% 0,
      100% calc(100% - var(--cut) + 0.6px),
      calc(100% - var(--cut) + 0.6px) 100%,
      0 100%,
      0 calc(var(--cut) - 0.6px)
    );
  }

  &:hover {
    --chip-fill: #{vars.alpha(vars.$accent-color, 0.18)};
  }

  &.active {
    --chip-border: #{vars.$accent-color};
    --chip-fill: #{vars.$accent-color};
    color: vars.$on-accent-color;

    .chip-count {
      opacity: 0.7;
    }
  }

  &:focus-visible {
    outline: none;
    --chip-border: #{vars.$accent-color};
  }
}

.chip-count {
  font-size: 0.65rem;
  opacity: 0.65;
}

.search-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.8;
}

.reset {
  padding: 0;
  background: none;
  border: none;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  @include mixins.cyber-link;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.project-item {
  height: 100%;
}

.secret-project {
  height: 100%;
}

.secret-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
}

.secret-badge {
  margin: 0;
  align-self: flex-start;
  padding: 0.15rem 0.5rem;
  background: vars.$warning-color;
  color: vars.$bg-color;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.secret-name {
  margin: 0;
  color: vars.$accent-color;
  font-size: 1.4rem;
  letter-spacing: 2px;
}

.secret-status {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: vars.$warning-color;
}

.secret-description {
  margin: 0;
  line-height: 1.6;
}

.secret-redacted {
  margin: auto 0 0;
  color: vars.alpha(vars.$text-color, 0.3);
  letter-spacing: 1px;
}

.empty {
  margin: 0;
  padding: 2rem 0;
  text-align: center;
  color: vars.$warning-color;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .search-hint {
    display: none;
  }

  .filters {
    flex-direction: column;
  }
}
</style>
