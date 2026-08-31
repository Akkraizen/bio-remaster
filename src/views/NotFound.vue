<script setup lang="ts">
import { useRouter } from "vue-router";
import CyberHero from "@components/CyberHero.vue";
import CyberButton from "@components/CyberButton.vue";
import CyberCard from "@components/CyberCard.vue";

const router = useRouter();

const goHome = () => {
  router.push("/core/entrypoint");
};
</script>

<template>
  <main class="view not-found">
    <CyberHero
      title="Error.404"
      subtitle="REQUESTED COORDINATES NOT FOUND IN THE GRID"
      variant="medium"
    />

    <div class="cyber-card-content-container">
      <CyberCard title="System.Alert">
        <div class="alert-content">
          <p class="warning-text">
            ACCESS DENIED: The resource you are looking for has been moved, deleted, or never existed.
          </p>
          <div class="actions">
            <CyberButton @click="goHome" variant="solid">
              Return to Entrypoint
            </CyberButton>
          </div>
        </div>
      </CyberCard>
    </div>
  </main>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cyber-card-content-container {
  max-width: 600px;
  margin: 2rem auto;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.warning-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--accent-color);
  letter-spacing: 1px;
}

.actions {
  display: flex;
  justify-content: center;
}
</style>
