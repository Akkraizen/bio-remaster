<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import CyberOutline from "@components/CyberOutline.vue";
import { getCommands, type Command, type CommandGroup } from "@/commands";
import { paletteOpen } from "@/hook/useOverlays.ts";
import { useI18n } from "@/i18n";
import { playHoverTick } from "@/utils/synthSounds.ts";

const { locale, t } = useI18n();

const query = ref("");
const activeIndex = ref(0);
const input = ref<HTMLInputElement | null>(null);
const list = ref<HTMLElement | null>(null);

const groupOrder: CommandGroup[] = ["navigation", "projects", "theme", "system", "links"];

function score(command: Command, tokens: string[]): number {
  const label = command.label.toLowerCase();
  const haystack = `${label} ${command.keywords.toLowerCase()}`;
  let total = 0;
  for (const token of tokens) {
    if (label.startsWith(token)) total += 3;
    else if (label.includes(token)) total += 2;
    else if (haystack.includes(token)) total += 1;
    else return 0;
  }
  return total;
}

const results = computed(() => {
  const commands = getCommands(locale.value);
  const tokens = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return commands;

  return commands
    .map((command) => ({ command, value: score(command, tokens) }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((entry) => entry.command);
});

const sections = computed(() => {
  const grouped = groupOrder
    .map((group) => ({
      group,
      items: results.value.filter((command) => command.group === group)
    }))
    .filter((section) => section.items.length);

  let index = 0;
  return grouped.map((section) => ({
    ...section,
    items: section.items.map((command) => ({ command, index: index++ }))
  }));
});

const flat = computed(() => sections.value.flatMap((section) => section.items.map((item) => item.command)));

watch(query, () => (activeIndex.value = 0));

watch(paletteOpen, async (open) => {
  if (!open) return;
  query.value = "";
  activeIndex.value = 0;
  await nextTick();
  input.value?.focus();
});

async function move(step: number) {
  const count = flat.value.length;
  if (!count) return;
  activeIndex.value = (activeIndex.value + step + count) % count;
  playHoverTick();
  await nextTick();
  list.value
    ?.querySelector<HTMLElement>(`[data-index="${activeIndex.value}"]`)
    ?.scrollIntoView({ block: "nearest" });
}

function run(command?: Command) {
  if (!command) return;
  paletteOpen.value = false;
  command.run();
}
</script>

<template>
  <Teleport to="body">
    <transition name="overlay">
      <div v-if="paletteOpen" class="palette-backdrop" @mousedown.self="paletteOpen = false">
        <div class="palette" role="dialog" aria-modal="true" :aria-label="t('palette.placeholder')">
          <CyberOutline
            shape="rectangle"
            :corner-size="16"
            background-color="var(--c-bg)"
            hover-background-color="var(--c-bg)"
            :cursor-focus="false"
          >
            <div class="palette-inner">
              <div class="palette-input-row">
                <span class="prompt" aria-hidden="true">&gt;</span>
                <input
                  ref="input"
                  v-model="query"
                  class="palette-input"
                  type="text"
                  spellcheck="false"
                  autocomplete="off"
                  :placeholder="t('palette.placeholder')"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  :aria-activedescendant="flat.length ? `palette-item-${activeIndex}` : undefined"
                  @keydown.down.prevent="move(1)"
                  @keydown.up.prevent="move(-1)"
                  @keydown.enter.prevent="run(flat[activeIndex])"
                />
                <kbd class="esc">ESC</kbd>
              </div>

              <div id="palette-list" ref="list" class="palette-list" role="listbox">
                <p v-if="!flat.length" class="empty">{{ t("palette.empty") }}</p>
                <section v-for="section in sections" :key="section.group" class="palette-section">
                  <h4 class="section-title">{{ t(`palette.groups.${section.group}`) }}</h4>
                  <button
                    v-for="{ command, index } in section.items"
                    :id="`palette-item-${index}`"
                    :key="command.id"
                    :data-index="index"
                    class="palette-item"
                    :class="{ active: index === activeIndex }"
                    role="option"
                    :aria-selected="index === activeIndex"
                    type="button"
                    @mousemove="activeIndex = index"
                    @click="run(command)"
                  >
                    <span class="label">{{ command.label }}</span>
                    <span v-if="command.hint" class="hint">{{ command.hint }}</span>
                  </button>
                </section>
              </div>

              <p class="palette-footer">{{ t("palette.hint") }}</p>
            </div>
          </CyberOutline>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: vars.$overlay-dim;
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh 16px 16px;
  box-sizing: border-box;
}

.palette {
  width: min(640px, 100%);
}

.palette-inner {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

.palette-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid vars.alpha(vars.$accent-color, 0.3);
}

.prompt {
  color: vars.$accent-color;
  font-weight: bold;
}

.palette-input {
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
}

kbd {
  font-family: inherit;
  font-size: 0.7rem;
  padding: 2px 6px;
  border: 1px solid vars.alpha(vars.$accent-color, 0.5);
  color: vars.$accent-color;
}

.palette-list {
  overflow-y: auto;
  padding: 0.5rem 0;
  overscroll-behavior: contain;
}

.empty {
  padding: 1.5rem 1.25rem;
  color: vars.$warning-color;
  margin: 0;
}

.section-title {
  margin: 0.5rem 1.25rem 0.25rem;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.65;
}

.palette-item {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 1.25rem;
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  color: vars.$text-color;
  font: inherit;
  text-align: left;
  cursor: pointer;

  .hint {
    font-size: 0.75rem;
    opacity: 0.65;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45%;
  }

  &.active {
    background: vars.alpha(vars.$accent-color, 0.12);
    border-left-color: vars.$accent-color;
    color: vars.$accent-color;

    .hint {
      opacity: 0.8;
    }
  }
}

.palette-footer {
  margin: 0;
  padding: 0.6rem 1.25rem;
  font-size: 0.7rem;
  opacity: 0.65;
  border-top: 1px solid vars.alpha(vars.$accent-color, 0.3);
}

.overlay-enter-active {
  animation: cyber-glitch-in 0.3s steps(1) forwards;
}

.overlay-leave-active {
  animation: cyber-glitch-out 0.2s steps(1) forwards;
}

@media (max-width: 600px) {
  .palette-backdrop {
    padding-top: 80px;
  }

  .esc {
    display: none;
  }
}
</style>
