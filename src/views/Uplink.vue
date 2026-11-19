<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import CyberHero from "@components/CyberHero.vue";
import CyberCard from "@components/CyberCard.vue";
import CyberButton from "@components/CyberButton.vue";
import { useVersion } from "@/hook/useVersion";
import { useResponsive } from "@/hook/useResponsive";
import { useI18n } from "@/i18n";
import { formatRelativeTime } from "@/utils/relativeTime.ts";
import { unlockAchievement } from "@/utils/achievements.ts";
import { track } from "@/utils/analytics.ts";
import { playAlarm, playConfirm } from "@/utils/synthSounds.ts";
import {
  fetchGuestbook,
  sendTransmission,
  signGuestbook,
  type GuestbookEntry,
  type UplinkResult
} from "@/utils/uplink.ts";

const version = useVersion();
const { locale, t } = useI18n();
const { getResponsiveShape } = useResponsive();

const transmitShape = getResponsiveShape({ mobile: "top-corners", default: "top-left" });
const logShape = getResponsiveShape({ mobile: "bottom-corners", default: "bottom-right" });

const LIMITS = { name: 60, contact: 120, message: 2000, guestName: 32, guestMessage: 280 } as const;

type Status = "idle" | "sending" | "ok" | "invalid" | "rate_limited" | "unavailable" | "network";

const openedAt = Date.now();

const transmission = reactive({ name: "", contact: "", message: "", website: "" });
const transmissionStatus = ref<Status>("idle");
const transmissionField = ref<string | null>(null);

const guest = reactive({ name: "", message: "", website: "" });
const guestStatus = ref<Status>("idle");
const guestField = ref<string | null>(null);

const entries = ref<GuestbookEntry[]>([]);
const pending = ref<GuestbookEntry[]>([]);
const logState = ref<"loading" | "ready" | "offline">("loading");

const relative = (date: string) => formatRelativeTime(date, locale.value);

const statusText = (status: Status, field: string | null, success: string) => {
  if (status === "idle") return "";
  if (status === "sending") return t("uplink.status.sending");
  if (status === "ok") return success;
  if (status === "invalid") return t("uplink.status.invalid", { field: field ? t(`uplink.fields.${field}`) : "?" });
  return t(`uplink.status.${status}`);
};

const transmissionMessage = computed(() =>
  statusText(transmissionStatus.value, transmissionField.value, t("uplink.status.sent"))
);
const guestMessage = computed(() => statusText(guestStatus.value, guestField.value, t("uplink.status.queued")));

const canTransmit = computed(
  () => transmission.name.trim().length > 0 && transmission.message.trim().length >= 5 && transmissionStatus.value !== "sending"
);
const canSign = computed(
  () => guest.name.trim().length > 0 && guest.message.trim().length >= 2 && guestStatus.value !== "sending"
);

function settle(result: UplinkResult, status: typeof transmissionStatus, field: typeof transmissionField, kind: string) {
  if (result.ok) {
    status.value = "ok";
    field.value = null;
    playConfirm();
    unlockAchievement("signal");
    track("uplink", { kind });
    return true;
  }
  status.value = result.error;
  field.value = result.field ?? null;
  playAlarm(true);
  return false;
}

async function transmit() {
  if (!canTransmit.value) {
    transmissionStatus.value = "invalid";
    transmissionField.value = transmission.name.trim() ? "message" : "name";
    return;
  }
  transmissionStatus.value = "sending";
  const result = await sendTransmission({ ...transmission, elapsed: Date.now() - openedAt, locale: locale.value });
  if (settle(result, transmissionStatus, transmissionField, "contact")) {
    transmission.message = "";
  }
}

async function sign() {
  if (!canSign.value) {
    guestStatus.value = "invalid";
    guestField.value = guest.name.trim() ? "message" : "name";
    return;
  }
  guestStatus.value = "sending";
  const result = await signGuestbook({ ...guest, elapsed: Date.now() - openedAt });
  if (settle(result, guestStatus, guestField, "guestbook")) {
    pending.value.unshift({
      id: `pending-${Date.now()}`,
      name: guest.name.trim(),
      message: guest.message.trim(),
      createdAt: new Date().toISOString()
    });
    guest.message = "";
  }
}

onMounted(async () => {
  const result = await fetchGuestbook();
  if (result) {
    entries.value = result;
    logState.value = "ready";
  } else logState.value = "offline";
});
</script>

<template>
  <div class="view">
    <CyberHero :title="t('uplink.title')" :subtitle="t('uplink.subtitle', { version })" variant="medium" />

    <div class="uplink-grid">
      <CyberCard :title="t('uplink.transmitTitle')" :shape="transmitShape">
        <p class="intro">{{ t("uplink.transmitIntro") }}</p>
        <form class="uplink-form" novalidate @submit.prevent="transmit">
          <label class="field">
            <span class="field-label">{{ t("uplink.fields.name") }}</span>
            <input
              v-model="transmission.name"
              class="field-input"
              :class="{ invalid: transmissionField === 'name' }"
              name="name"
              autocomplete="name"
              :maxlength="LIMITS.name"
              required
            />
          </label>
          <label class="field">
            <span class="field-label">{{ t("uplink.fields.contact") }} <span class="optional">{{ t("uplink.optional") }}</span></span>
            <input
              v-model="transmission.contact"
              class="field-input"
              :class="{ invalid: transmissionField === 'contact' }"
              name="contact"
              autocomplete="email"
              :maxlength="LIMITS.contact"
              :placeholder="t('uplink.contactPlaceholder')"
            />
          </label>
          <label class="field">
            <span class="field-label">
              {{ t("uplink.fields.message") }}
              <span class="counter">{{ transmission.message.length }}/{{ LIMITS.message }}</span>
            </span>
            <textarea
              v-model="transmission.message"
              class="field-input"
              :class="{ invalid: transmissionField === 'message' }"
              name="message"
              rows="7"
              :maxlength="LIMITS.message"
              required
            />
          </label>
          <input v-model="transmission.website" class="trap" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <div class="form-footer">
            <p class="status" :class="transmissionStatus" role="status" aria-live="polite">{{ transmissionMessage }}</p>
            <CyberButton variant="solid" shape="bottom-right" :corner-size="10" :disabled="transmissionStatus === 'sending'">
              {{ t("uplink.send") }}
            </CyberButton>
          </div>
        </form>
      </CyberCard>

      <CyberCard :title="t('uplink.logTitle')" :shape="logShape">
        <p class="intro">{{ t("uplink.logIntro") }}</p>
        <form class="uplink-form" novalidate @submit.prevent="sign">
          <label class="field">
            <span class="field-label">{{ t("uplink.fields.name") }}</span>
            <input
              v-model="guest.name"
              class="field-input"
              :class="{ invalid: guestField === 'name' }"
              name="guest-name"
              autocomplete="nickname"
              :maxlength="LIMITS.guestName"
              required
            />
          </label>
          <label class="field">
            <span class="field-label">
              {{ t("uplink.fields.message") }}
              <span class="counter">{{ guest.message.length }}/{{ LIMITS.guestMessage }}</span>
            </span>
            <textarea
              v-model="guest.message"
              class="field-input"
              :class="{ invalid: guestField === 'message' }"
              name="guest-message"
              rows="3"
              :maxlength="LIMITS.guestMessage"
              required
            />
          </label>
          <input v-model="guest.website" class="trap" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <div class="form-footer">
            <p class="status" :class="guestStatus" role="status" aria-live="polite">{{ guestMessage }}</p>
            <CyberButton variant="outline" shape="bottom-right" :corner-size="10" :disabled="guestStatus === 'sending'">
              {{ t("uplink.sign") }}
            </CyberButton>
          </div>
        </form>

        <ol class="log" :aria-busy="logState === 'loading'">
          <li v-for="entry in pending" :key="entry.id" class="log-entry is-pending">
            <header class="log-head">
              <span class="log-name">{{ entry.name }}</span>
              <span class="log-meta">{{ t("uplink.pending") }}</span>
            </header>
            <p class="log-message">{{ entry.message }}</p>
          </li>
          <li v-for="entry in entries" :key="entry.id" class="log-entry">
            <header class="log-head">
              <span class="log-name">{{ entry.name }}</span>
              <time class="log-meta" :datetime="entry.createdAt">{{ relative(entry.createdAt) }}</time>
            </header>
            <p class="log-message">{{ entry.message }}</p>
          </li>
          <li v-if="logState === 'loading'" class="log-empty">{{ t("uplink.loading") }}</li>
          <li v-else-if="logState === 'offline'" class="log-empty">{{ t("uplink.offline") }}</li>
          <li v-else-if="!entries.length && !pending.length" class="log-empty">{{ t("uplink.empty") }}</li>
        </ol>
      </CyberCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@style/_vars";

.uplink-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.intro {
  margin: 0 0 1.25rem;
  font-size: 0.85rem;
  line-height: 1.6;
  opacity: 0.8;
}

.uplink-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: vars.$accent-color;
}

.optional,
.counter {
  color: vars.$text-color;
  opacity: 0.5;
  text-transform: none;
  letter-spacing: 0;
}

.field-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.75rem;
  border: 1px solid vars.alpha(vars.$accent-color, 0.35);
  border-left-width: 3px;
  background: vars.alpha(vars.$accent-color, 0.04);
  color: vars.$text-color;
  font: inherit;
  font-size: 0.9rem;
  caret-color: vars.$accent-color;
  resize: vertical;
  transition: border-color 0.15s steps(3), background 0.15s steps(3);

  &::placeholder {
    color: vars.$text-color;
    opacity: 0.35;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: vars.$accent-color;
    background: vars.alpha(vars.$accent-color, 0.08);
  }

  &.invalid {
    border-color: vars.$warning-color;
  }
}

.trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.status {
  flex: 1;
  min-width: 12rem;
  margin: 0;
  font-size: 0.8rem;
  min-height: 1.2em;

  &.sending {
    animation: blink 0.8s steps(2) infinite;
  }

  &.ok {
    color: vars.$accent-color;
  }

  &.invalid,
  &.rate_limited,
  &.unavailable,
  &.network {
    color: vars.$warning-color;
  }
}

@keyframes blink {
  50% {
    opacity: 0.4;
  }
}

.log {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 460px;
  margin: 1.5rem 0 0;
  padding: 1rem 0 0;
  overflow-y: auto;
  border-top: 1px dashed vars.alpha(vars.$accent-color, 0.35);
  list-style: none;
  overscroll-behavior: contain;
}

.log-entry {
  padding: 0.6rem 0.75rem;
  border-left: 2px solid vars.alpha(vars.$accent-color, 0.5);
  background: vars.alpha(vars.$accent-color, 0.03);

  &.is-pending {
    border-left-style: dashed;
    opacity: 0.7;
  }
}

.log-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.3rem;
  font-size: 0.75rem;
}

.log-name {
  color: vars.$accent-color;
  font-weight: bold;
  overflow-wrap: anywhere;
}

.log-meta {
  flex-shrink: 0;
  opacity: 0.55;
}

.log-message {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.log-empty {
  font-size: 0.8rem;
  opacity: 0.6;
}
</style>
