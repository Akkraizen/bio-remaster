<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "@/i18n";
import type { ContributionDay, ContributionStats } from "@/hook/useLiveStats.ts";
import { summarize, toWeeks } from "@/utils/contributions.ts";

const props = defineProps<{ data: ContributionStats }>();

const { locale, t } = useI18n();

const weeks = computed(() => toWeeks(props.data.days));
const summary = computed(() => summarize(props.data.days));
const hovered = ref<ContributionDay | null>(null);
const scroller = ref<HTMLElement | null>(null);
const root = ref<HTMLElement | null>(null);
const tooltip = ref<{ x: number; y: number; below: boolean } | null>(null);

const TOOLTIP_HALF_WIDTH = 90;

function showDay(day: ContributionDay | null, event: MouseEvent) {
  hovered.value = day;
  if (!day || !root.value) {
    tooltip.value = null;
    return;
  }
  const cell = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const box = root.value.getBoundingClientRect();
  const center = cell.left + cell.width / 2 - box.left;
  const top = cell.top - box.top;
  tooltip.value = {
    x: Math.min(Math.max(center, TOOLTIP_HALF_WIDTH), box.width - TOOLTIP_HALF_WIDTH),
    y: top < 60 ? top + cell.height + 8 : top - 8,
    below: top < 60
  };
}

function hideDay() {
  hovered.value = null;
  tooltip.value = null;
}

const dateFormat = computed(
  () => new Intl.DateTimeFormat(locale.value, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
);
const monthFormat = computed(() => new Intl.DateTimeFormat(locale.value, { month: "short", timeZone: "UTC" }));

const formatDate = (date: string) => dateFormat.value.format(new Date(`${date}T00:00:00Z`));

const months = computed(() => {
  const labels: { index: number; label: string }[] = [];
  let last = -1;
  weeks.value.forEach((week, index) => {
    const first = week.find((day) => day && Number(day.date.slice(8)) <= 7);
    if (!first) return;
    const month = Number(first.date.slice(5, 7));
    if (month === last) return;
    last = month;
    if (index > weeks.value.length - 3) return;
    labels.push({ index, label: monthFormat.value.format(new Date(`${first.date}T00:00:00Z`)) });
  });
  return labels;
});

const caption = computed(() =>
  hovered.value
    ? t("activity.heatmapDay", { count: hovered.value.count, date: formatDate(hovered.value.date) })
    : t("activity.heatmapTotal", { count: props.data.total })
);

watch(
  weeks,
  async () => {
    await nextTick();
    if (scroller.value) scroller.value.scrollLeft = scroller.value.scrollWidth;
  },
  { immediate: true }
);
</script>

<template>
  <div ref="root" class="heatmap">
    <div class="heatmap-stats">
      <div class="stat">
        <span class="stat-value">{{ data.total }}</span>
        <span class="stat-label">{{ t("activity.heatmapContributions") }}</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ summary.activeDays }}</span>
        <span class="stat-label">{{ t("activity.heatmapActiveDays") }}</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ summary.current }}</span>
        <span class="stat-label">{{ t("activity.heatmapStreak") }}</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ summary.longest }}</span>
        <span class="stat-label">{{ t("activity.heatmapLongest") }}</span>
      </div>
    </div>

    <div ref="scroller" class="heatmap-scroll">
      <div class="heatmap-board" :style="{ '--weeks': weeks.length }">
        <div class="months" aria-hidden="true">
          <span
            v-for="month in months"
            :key="month.index"
            class="month"
            :style="{ gridColumn: `${month.index + 1} / span 3` }"
          >{{ month.label }}</span>
        </div>
        <div class="grid" role="img" :aria-label="t('activity.heatmapTotal', { count: data.total })" @mouseleave="hideDay">
          <template v-for="(week, weekIndex) in weeks" :key="weekIndex">
            <span
              v-for="(day, dayIndex) in week"
              :key="`${weekIndex}-${dayIndex}`"
              class="cell"
              :class="day ? `level-${day.level}` : 'empty'"
              @mouseenter="showDay(day, $event)"
            ></span>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="hovered && tooltip"
      class="heatmap-tooltip"
      :class="{ below: tooltip.below }"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      aria-hidden="true"
    >
      <span class="tooltip-count">{{ hovered.count }}</span>
      <span class="tooltip-date">{{ formatDate(hovered.date) }}</span>
    </div>

    <div class="heatmap-footer">
      <p class="caption" aria-live="polite">&gt; {{ caption }}</p>
      <div class="legend" aria-hidden="true">
        <span>{{ t("activity.heatmapLess") }}</span>
        <span v-for="level in 5" :key="level" class="cell" :class="`level-${level - 1}`"></span>
        <span>{{ t("activity.heatmapMore") }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.heatmap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.heatmap-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid vars.$accent-color;
  background: vars.alpha(vars.$accent-color, 0.05);
}

.stat-value {
  color: vars.$accent-color;
  font-size: 1.4rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.65rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.7;
}

.heatmap-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: vars.$accent-color transparent;
}

.heatmap-board {
  min-width: calc(var(--weeks) * 13px);
}

.months,
.grid {
  display: grid;
  grid-template-columns: repeat(var(--weeks), minmax(10px, 1fr));
  column-gap: 3px;
}

.months {
  margin-bottom: 0.35rem;
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.65;
  white-space: nowrap;
}

.grid {
  grid-template-rows: repeat(7, auto);
  grid-auto-flow: column;
  row-gap: 3px;
}

.cell {
  display: block;
  aspect-ratio: 1;
  min-width: 10px;
  background: vars.alpha(vars.$accent-color, 0.07);

  &.empty {
    background: transparent;
  }

  &.level-1 {
    background: vars.alpha(vars.$accent-color, 0.3);
  }

  &.level-2 {
    background: vars.alpha(vars.$accent-color, 0.55);
  }

  &.level-3 {
    background: vars.alpha(vars.$accent-color, 0.8);
  }

  &.level-4 {
    background: vars.$accent-color;
    box-shadow: 0 0 6px vars.alpha(vars.$accent-color, 0.5);
  }

  &:not(.empty):hover {
    outline: 1px solid vars.$accent-color;
    outline-offset: 1px;
    box-shadow: 0 0 8px vars.alpha(vars.$accent-color, 0.6);
  }
}

.heatmap-tooltip {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.6);
  border-left: 3px solid vars.$accent-color;
  background: vars.$bg-color;
  box-shadow: 0 0 12px vars.alpha(vars.$accent-color, 0.25);
  font-size: 0.7rem;
  letter-spacing: 1px;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, -100%);

  &.below {
    transform: translate(-50%, 0);
  }

  .tooltip-count {
    color: vars.$accent-color;
    font-size: 0.85rem;
    font-weight: bold;
  }

  .tooltip-date {
    text-transform: uppercase;
    opacity: 0.8;
  }
}

.heatmap-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem;
}

.caption {
  margin: 0;
  font-size: 0.75rem;
  color: vars.$accent-color;
}

.legend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.75;

  .cell {
    width: 10px;
  }

  span:first-child {
    margin-right: 0.3rem;
  }

  span:last-child {
    margin-left: 0.3rem;
  }
}

@media (max-width: 600px) {
  .heatmap-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
