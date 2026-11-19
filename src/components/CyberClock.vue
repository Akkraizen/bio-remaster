<script setup lang="ts">
import { computed } from "vue";
import { useNow } from "@vueuse/core";
import CyberOutline from "@components/CyberOutline.vue";
import DecryptText from "@components/DecryptText.vue";
import { useI18n } from "@/i18n";
import { vReveal } from "@/directives/reveal.ts";

const props = withDefaults(defineProps<{ timeZone?: string }>(), {
  timeZone: "Europe/Moscow"
});

const { locale, t } = useI18n();
const now = useNow({ interval: 1000 });

const timeFormat = computed(
  () =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: props.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
);

const dateFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      timeZone: props.timeZone,
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
);

const time = computed(() => {
  const parts = Object.fromEntries(
    timeFormat.value.formatToParts(now.value).map((part) => [part.type, part.value])
  );
  return {
    hours: parts.hour,
    minutes: parts.minute,
    seconds: parts.second,
    progress: Number(parts.second) / 59
  };
});

const date = computed(() => dateFormat.value.format(now.value).toUpperCase());

const visitorFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

function wallClock(date: Date, timeZone?: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    })
      .formatToParts(date)
      .map((part) => [part.type, Number(part.value)])
  );
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

const visitor = computed(() => {
  const diff = Math.round((wallClock(now.value) - wallClock(now.value, props.timeZone)) / 60000);
  const hours = Math.floor(Math.abs(diff) / 60);
  const minutes = Math.abs(diff) % 60;
  const sign = diff === 0 ? "±" : diff > 0 ? "+" : "−";
  return {
    time: visitorFormat.format(now.value),
    offset: `${sign}${hours}h${minutes ? ` ${minutes}m` : ""}`
  };
});
</script>

<template>
  <div v-reveal class="cyber-clock" data-no-scramble>
    <CyberOutline
      shape="diagonal-tr-bl"
      :corner-size="14"
      background-color="var(--c-bg)"
      hover-background-color="var(--c-bg)"
      :cursor-focus="false"
    >
      <div class="clock-inner">
        <header class="clock-header">
          <span class="clock-title">
            <span class="status-dot" aria-hidden="true"></span>
            <DecryptText :text="t('file.clockTitle')" />
          </span>
          <span class="clock-zone">{{ t("file.clockZone") }}</span>
        </header>

        <time class="clock-face" :datetime="now.toISOString()">
          <span class="clock-main">
            {{ time.hours }}<span class="clock-colon">:</span>{{ time.minutes }}
          </span>
          <span class="clock-seconds">{{ time.seconds }}</span>
        </time>

        <div class="clock-bar" aria-hidden="true">
          <span
            class="clock-bar-fill"
            :class="{ reset: time.progress === 0 }"
            :style="{ transform: `scaleX(${time.progress})` }"
          ></span>
        </div>

        <footer class="clock-date">{{ date }}</footer>

        <div class="clock-visitor">
          <span class="visitor-label">{{ t("file.clockVisitor") }}</span>
          <span class="visitor-value">
            {{ visitor.time }}
            <span class="visitor-offset">{{ visitor.offset }}</span>
          </span>
        </div>
      </div>
    </CyberOutline>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";
@use "@style/_mixins";

.cyber-clock {
  width: 100%;
  height: 100%;
  @include mixins.font-mono;
  font-variant-numeric: tabular-nums;
}

.clock-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  gap: 0.6rem;
  padding: 0.85rem 1rem 0.9rem;
  @include mixins.glass-effect(vars.$accent-color, 0.06);
}

.clock-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.clock-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: vars.$accent-color;
  box-shadow: 0 0 6px vars.$accent-color;
  animation: clock-pulse 2s ease-in-out infinite;
}

.clock-zone {
  padding: 1px 6px;
  font-weight: bold;
  color: vars.$on-accent-color;
  background: vars.$warning-color;
  white-space: nowrap;
}

.clock-face {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  line-height: 1;
}

.clock-main {
  font-size: 2.6rem;
  font-weight: bold;
  color: vars.$accent-color;
  letter-spacing: 2px;
  text-shadow:
    0 0 10px vars.alpha(vars.$accent-color, 0.55),
    0 0 24px vars.alpha(vars.$accent-color, 0.25);
}

.clock-seconds {
  margin-top: 0.2rem;
  padding: 2px 5px;
  font-size: 0.95rem;
  font-weight: bold;
  color: vars.$accent-color;
  border: 1px solid vars.alpha(vars.$accent-color, 0.5);
}

.clock-colon {
  animation: clock-blink 1s steps(1) infinite;
}

.clock-bar {
  position: relative;
  height: 4px;
  background: repeating-linear-gradient(
    to right,
    vars.alpha(vars.$accent-color, 0.2) 0 calc(100% / 12 - 2px),
    transparent calc(100% / 12 - 2px) calc(100% / 12)
  );
  overflow: hidden;
}

.clock-bar-fill {
  position: absolute;
  inset: 0;
  background: vars.$accent-color;
  box-shadow: 0 0 8px vars.$accent-color;
  transform-origin: left;
  transition: transform 1s linear;

  &.reset {
    transition: none;
  }
}

.clock-date {
  font-size: 0.7rem;
  letter-spacing: 1px;
  opacity: 0.6;
}

.clock-visitor {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  padding-top: 0.6rem;
  border-top: 1px dashed vars.alpha(vars.$accent-color, 0.3);
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.visitor-label {
  text-transform: uppercase;
  opacity: 0.6;
}

.visitor-value {
  font-weight: bold;
  color: vars.$accent-color;
}

.visitor-offset {
  margin-left: 0.3rem;
  padding: 0 4px;
  border: 1px solid vars.alpha(vars.$accent-color, 0.5);
}

@keyframes clock-blink {
  50% {
    opacity: 0.15;
  }
}

@keyframes clock-pulse {
  50% {
    opacity: 0.3;
  }
}

:root[data-motion="reduced"] {
  .clock-colon,
  .status-dot {
    animation: none;
  }

  .clock-bar-fill {
    transition: none;
  }
}
</style>
