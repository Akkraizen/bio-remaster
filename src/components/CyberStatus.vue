<script setup lang="ts">
import { computed } from "vue";
import { useNow } from "@vueuse/core";
import CyberCard from "@components/CyberCard.vue";
import { profiles, useLiveStats } from "@/hook/useLiveStats.ts";
import { useI18n } from "@/i18n";
import { formatRelativeTime } from "@/utils/relativeTime.ts";

const SESSION_START = Date.parse("2022-05-27T16:49:56Z");

const { locale, t } = useI18n();
const stats = useLiveStats();
const now = useNow({ interval: 1000 });

const uptime = computed(() => {
  const total = Math.floor((now.value.getTime() - SESSION_START) / 1000);
  const days = Math.floor(total / 86400);
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    years: Math.floor(days / 365),
    days: days % 365,
    clock: `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
  };
});

const focus = computed(() => {
  const events = stats.github.data?.events ?? [];
  const event = events.find((item) => item.kind === "pushed") ?? events[0];
  if (!event) return null;
  return {
    repo: event.repo.split("/")[1] ?? event.repo,
    url: `https://github.com/${event.repo}`,
    kind: t(`activity.${event.kind}`),
    when: formatRelativeTime(event.date, locale.value)
  };
});

const display = (value: number | null | undefined) => (value == null ? "--" : String(value));

const metrics = computed(() => [
  { id: "repos", label: t("file.statusRepos"), value: display(stats.github.data?.repos) },
  { id: "stars", label: t("file.statusStars"), value: display(stats.github.data?.stars) },
  { id: "lichess", label: "Lichess", value: display(stats.chess.data?.lichessBlitz) },
  {
    id: "codeforces",
    label: "Codeforces",
    value:
      stats.codeforces.status === "ready"
        ? (stats.codeforces.data?.rating?.toString() ?? t("file.statusUnrated"))
        : "--"
  }
]);

const loading = computed(() => stats.github.status === "loading" || stats.github.status === "idle");
</script>

<template>
  <CyberCard :title="t('file.statusTitle')" shape="bottom-left" class="cyber-status">
    <div class="status-inner" data-no-scramble>
      <div class="focus-row">
        <span class="focus-label">
          <span class="status-dot" :class="{ offline: stats.github.status === 'error' }" aria-hidden="true"></span>
          {{ t("file.statusFocus") }}
        </span>
        <span v-if="focus" class="focus-value">
          <a :href="focus.url" target="_blank" rel="noopener">{{ focus.repo }}</a>
          <span class="focus-meta">· {{ focus.kind }} {{ focus.when }}</span>
        </span>
        <span v-else-if="loading" class="focus-value muted blink">{{ t("activity.loading") }}</span>
        <span v-else class="focus-value error">{{ t("activity.offline") }}</span>
      </div>

      <div class="metrics" data-cursor-group=".metric">
        <div class="metric uptime" data-cursor-focus>
          <span class="metric-label">{{ t("file.statusUptime") }}</span>
          <span class="metric-value">
            {{ uptime.years }}<small>y</small> {{ uptime.days }}<small>d</small>
            <span class="uptime-clock">{{ uptime.clock }}</span>
          </span>
        </div>
        <a
          v-for="metric in metrics"
          :key="metric.id"
          class="metric"
          :href="
            metric.id === 'lichess'
              ? `https://lichess.org/@/${profiles.lichess}`
              : metric.id === 'codeforces'
                ? `https://codeforces.com/profile/${profiles.codeforces}`
                : `https://github.com/${profiles.github}`
          "
          target="_blank"
          rel="noopener"
        >
          <span class="metric-label">{{ metric.label }}</span>
          <span class="metric-value">{{ metric.value }}</span>
        </a>
      </div>
    </div>
  </CyberCard>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cyber-status {
  font-variant-numeric: tabular-nums;
}

.status-inner {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.focus-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem 1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px dashed vars.alpha(vars.$accent-color, 0.3);
}

.focus-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.7;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: vars.$accent-color;
  box-shadow: 0 0 6px vars.$accent-color;
  animation: status-pulse 1.6s ease-in-out infinite;

  &.offline {
    background: vars.$warning-color;
    box-shadow: 0 0 6px vars.$warning-color;
  }
}

.focus-value {
  font-weight: bold;

  a {
    @include mixins.cyber-link;
  }

  &.muted {
    opacity: 0.6;
  }

  &.error {
    color: vars.$warning-color;
  }

  &.blink {
    animation: status-pulse 1s steps(2) infinite;
  }
}

.focus-meta {
  margin-left: 0.25rem;
  font-weight: normal;
  font-size: 0.85rem;
  opacity: 0.6;
}

.metrics {
  display: grid;
  grid-template-columns: minmax(160px, 1.6fr) repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  padding-left: 0.75rem;
  border-left: 2px solid vars.alpha(vars.$accent-color, 0.35);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s ease;

  &:is(a):hover {
    border-left-color: vars.$accent-color;

    .metric-value {
      text-shadow: 0 0 10px vars.alpha(vars.$accent-color, 0.6);
    }
  }

  &.uptime {
    border-left-color: vars.$warning-color;
  }
}

.metric-label {
  font-size: 0.65rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-value {
  font-size: 1.15rem;
  font-weight: bold;
  color: vars.$accent-color;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  small {
    font-size: 0.7em;
    opacity: 0.7;
    margin-left: 1px;
  }
}

.uptime-clock {
  margin-left: 0.35rem;
  font-size: 0.8em;
  opacity: 0.75;
}

@keyframes status-pulse {
  50% {
    opacity: 0.3;
  }
}

:root[data-motion="reduced"] {
  .status-dot,
  .focus-value.blink {
    animation: none;
  }
}

@container (max-width: 620px) {
  .metrics {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  }

  .metric.uptime {
    grid-column: 1 / -1;
  }
}
</style>
