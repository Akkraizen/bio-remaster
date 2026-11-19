<script setup lang="ts">
import { computed } from "vue";
import { profiles, useLiveStats } from "@/hook/useLiveStats.ts";
import { useI18n } from "@/i18n";

const { t } = useI18n();
const stats = useLiveStats();

const languages = computed(() => {
  const list = stats.github.data?.languageShare ?? [];
  const top = list[0]?.share ?? 1;
  return list.map((language) => ({
    ...language,
    percent: Math.round(language.share * 100),
    fill: language.share / top
  }));
});
</script>

<template>
  <div class="stack-languages" data-no-scramble>
    <header class="lang-header">
      <span class="lang-title">
        <span class="lang-dot" :class="{ offline: stats.github.status === 'error' }" aria-hidden="true"></span>
        {{ t("file.langTitle") }}
      </span>
      <a class="lang-source" :href="`https://github.com/${profiles.github}?tab=repositories`" target="_blank" rel="noopener">
        GitHub
      </a>
    </header>

    <ul v-if="languages.length" class="lang-list">
      <li v-for="language in languages" :key="language.name" class="lang-row" :title="`${language.repos} ${t('file.langRepos')}`">
        <span class="lang-name">{{ language.name }}</span>
        <span class="lang-percent">{{ language.percent }}%</span>
        <span class="lang-bar" aria-hidden="true">
          <span class="lang-bar-fill" :style="{ transform: `scaleX(${language.fill})` }"></span>
        </span>
      </li>
    </ul>
    <p v-else-if="stats.github.status === 'error'" class="lang-status error">{{ t("activity.offline") }}</p>
    <p v-else class="lang-status blink">{{ t("activity.loading") }}</p>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.stack-languages {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  padding-top: 0.75rem;
  border-top: 1px dashed vars.alpha(vars.$accent-color, 0.3);
  font-variant-numeric: tabular-nums;
}

.lang-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.lang-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: bold;
  opacity: 0.8;
}

.lang-dot {
  width: 6px;
  height: 6px;
  background: vars.$accent-color;
  box-shadow: 0 0 6px vars.$accent-color;

  &.offline {
    background: vars.$warning-color;
    box-shadow: 0 0 6px vars.$warning-color;
  }
}

.lang-source {
  @include mixins.cyber-link;
}

.lang-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lang-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.2rem 0.5rem;
  font-size: 0.7rem;
}

.lang-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lang-percent {
  color: vars.$accent-color;
  font-weight: bold;
}

.lang-bar {
  grid-column: 1 / -1;
  position: relative;
  height: 4px;
  background: repeating-linear-gradient(
    to right,
    vars.alpha(vars.$accent-color, 0.18) 0 calc(100% / 10 - 2px),
    transparent calc(100% / 10 - 2px) calc(100% / 10)
  );
  overflow: hidden;
}

.lang-bar-fill {
  position: absolute;
  inset: 0;
  background: vars.$accent-color;
  box-shadow: 0 0 6px vars.$accent-color;
  transform-origin: left;
  transition: transform 0.6s ease;
}

.lang-status {
  margin: 0;
  font-size: 0.75rem;
  color: vars.$accent-color;

  &.error {
    color: vars.$warning-color;
  }

  &.blink {
    animation: lang-blink 1s steps(2) infinite;
  }
}

@keyframes lang-blink {
  50% {
    opacity: 0.3;
  }
}

:root[data-motion="reduced"] {
  .lang-status.blink {
    animation: none;
  }

  .lang-bar-fill {
    transition: none;
  }
}
</style>
