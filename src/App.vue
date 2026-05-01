<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { useTitle } from "@vueuse/core";
import ConfirmPopup from "primevue/confirmpopup";
import Toast from "primevue/toast";
import AppHeader from "@/components/AppHeader.vue";
import { useCatalogStore } from "@/stores/catalog";

const route = useRoute();

const APP_NAME = "Home task";
const pageTitle = computed(() => (route.meta.title ? `${route.meta.title} | ${APP_NAME}` : APP_NAME));
useTitle(pageTitle);

void useCatalogStore().load();
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-contrast"
  >
    Skip to main content
  </a>

  <AppHeader />

  <main id="main-content" tabindex="-1">
    <RouterView v-slot="{ Component, route: r }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="r.path" />
      </Transition>
    </RouterView>
  </main>

  <Toast position="bottom-right" />
  <ConfirmPopup aria-label="Confirmation" />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
