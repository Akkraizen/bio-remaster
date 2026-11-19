<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import CyberOutline from "@components/CyberOutline.vue";
import { useRoute } from "vue-router";
import TerminalSnake from "@components/TerminalSnake.vue";
import { complete, execute, promptPath, syncCwd, type TerminalLine } from "@/commands/terminal.ts";
import { unlockAchievement } from "@/utils/achievements.ts";
import { terminalOpen } from "@/hook/useOverlays.ts";
import { useVersion } from "@/hook/useVersion";
import { useI18n } from "@/i18n";
import { playTypeTick } from "@/utils/synthSounds.ts";

const { t } = useI18n();
const version = useVersion();
const route = useRoute();

const SNAKE_KEY = "snake-best";
const SNAKE_GOAL = 15;

const lines = ref<TerminalLine[]>([]);
const input = ref("");
const busy = ref(false);
const playing = ref(false);
const history: string[] = [];
let historyIndex = 0;

const inputElement = ref<HTMLInputElement | null>(null);
const screen = ref<HTMLElement | null>(null);

const context = {
  clear: () => (lines.value = []),
  close: () => (terminalOpen.value = false),
  startGame: () => {
    playing.value = true;
    scrollToBottom();
  }
};

function readBest() {
  try {
    return Number(localStorage.getItem(SNAKE_KEY)) || 0;
  } catch {
    return 0;
  }
}

async function finishGame(score: number) {
  playing.value = false;
  const best = readBest();
  if (score > best)
    try {
      localStorage.setItem(SNAKE_KEY, String(score));
    } catch {}
  lines.value.push(
    { text: `GAME OVER. score ${score}`, kind: "accent" },
    { text: score > best ? `new record! previous best ${best}` : `best ${best}`, kind: "muted" }
  );
  if (score >= SNAKE_GOAL) unlockAchievement("snake");
  else lines.value.push({ text: `// rumour says something happens at ${SNAKE_GOAL}`, kind: "muted" });
  scrollToBottom();
  setTimeout(() => inputElement.value?.focus(), 60);
}

async function scrollToBottom() {
  await nextTick();
  if (screen.value) screen.value.scrollTop = screen.value.scrollHeight;
}

watch(terminalOpen, async (open) => {
  if (!open) {
    playing.value = false;
    return;
  }
  syncCwd(route.path);
  if (!lines.value.length)
    lines.value.push({ text: t("terminal.welcome", { version }), kind: "accent" });
  await nextTick();
  inputElement.value?.focus();
  scrollToBottom();
});

async function submit() {
  if (busy.value) return;
  const command = input.value;
  input.value = "";
  lines.value.push({ text: command, kind: "input", prompt: promptPath.value });

  if (command.trim()) {
    history.push(command);
    historyIndex = history.length;
  }

  busy.value = true;
  try {
    lines.value.push(...(await execute(command, context)));
  } finally {
    busy.value = false;
    scrollToBottom();
    await nextTick();
    inputElement.value?.focus();
  }
}

function browseHistory(step: number) {
  if (!history.length) return;
  historyIndex = Math.min(Math.max(historyIndex + step, 0), history.length);
  input.value = history[historyIndex] ?? "";
}

function autocomplete() {
  const result = complete(input.value);
  if (result.options.length && result.value === input.value) {
    lines.value.push(
      { text: input.value, kind: "input", prompt: promptPath.value },
      { text: result.options.join("  "), kind: "muted" }
    );
    scrollToBottom();
  }
  input.value = result.value;
}
</script>

<template>
  <Teleport to="body">
    <transition name="terminal">
      <div v-if="terminalOpen" class="terminal-backdrop" @mousedown.self="terminalOpen = false">
        <div class="terminal" role="dialog" aria-modal="true" :aria-label="t('terminal.title', { path: promptPath })">
          <CyberOutline
            shape="top-corners"
            :corner-size="16"
            background-color="var(--c-bg)"
            hover-background-color="var(--c-bg)"
            :cursor-focus="false"
          >
            <div class="terminal-inner" @click="inputElement?.focus()">
              <header class="terminal-header">
                <span>{{ t("terminal.title", { path: promptPath }) }}</span>
                <button class="close" type="button" aria-label="Close" @click="terminalOpen = false">[x]</button>
              </header>

              <div ref="screen" class="terminal-screen" aria-live="polite">
                <p v-for="(line, index) in lines" :key="index" class="line" :class="line.kind">
                  <span v-if="line.kind === 'input'" class="prompt">{{ line.prompt ?? "~" }} &gt;</span>{{ line.text }}
                </p>
                <p v-if="busy" class="line muted">...</p>

                <TerminalSnake v-if="playing" @finish="finishGame" />
                <form v-else class="input-row" @submit.prevent="submit">
                  <span class="prompt" aria-hidden="true">{{ promptPath }} &gt;</span>
                  <input
                    ref="inputElement"
                    v-model="input"
                    class="terminal-input"
                    type="text"
                    spellcheck="false"
                    autocomplete="off"
                    autocapitalize="off"
                    aria-label="Command"
                    @input="playTypeTick()"
                    @keydown.up.prevent="browseHistory(-1)"
                    @keydown.down.prevent="browseHistory(1)"
                    @keydown.tab.prevent="autocomplete"
                  />
                </form>
              </div>
            </div>
          </CyberOutline>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.terminal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: vars.$overlay-dim;
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 0 16px;
}

.terminal {
  width: min(900px, 100%);
}

.terminal-inner {
  display: flex;
  flex-direction: column;
  height: min(55vh, 520px);
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1.25rem;
  font-size: 0.8rem;
  color: vars.$accent-color;
  border-bottom: 1px solid vars.alpha(vars.$accent-color, 0.3);

  .close {
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
}

.terminal-screen {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1.25rem 1rem;
  font-size: 0.9rem;
  overscroll-behavior: contain;
}

.line {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;

  &.input {
    margin-top: 0.4rem;
  }

  &.accent {
    color: vars.$accent-color;
  }

  &.error {
    color: vars.$warning-color;
  }

  &.muted {
    opacity: 0.65;
  }
}

.prompt {
  color: vars.$accent-color;
  margin-right: 0.6rem;
  font-weight: bold;
}

.input-row {
  display: flex;
  align-items: center;
  margin-top: 0.4rem;
}

.terminal-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: vars.$text-color;
  font: inherit;
  caret-color: vars.$accent-color;
}

.terminal-enter-active,
.terminal-leave-active {
  transition: opacity 0.2s ease;

  .terminal {
    transition: transform 0.25s steps(5);
  }
}

.terminal-enter-from,
.terminal-leave-to {
  opacity: 0;

  .terminal {
    transform: translateY(40%);
  }
}

@media (max-width: 600px) {
  .terminal-backdrop {
    padding: 0;
  }

  .terminal-inner {
    height: 70vh;
  }

  .terminal-screen {
    font-size: 0.8rem;
  }
}
</style>
