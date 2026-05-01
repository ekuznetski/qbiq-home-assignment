<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import OverlayBadge from "primevue/overlaybadge";
import { ShoppingBag, ShoppingCart } from "lucide-vue-next";
import { useCartStore } from "@/stores/cart";

const cart = useCartStore();
const { count } = storeToRefs(cart);

const cartAriaLabel = computed(() => (count.value === 0 ? "Cart, empty" : `Cart, ${count.value} items`));
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-surface bg-surface-50/80 backdrop-blur dark:bg-surface-950/80">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
      <RouterLink
        to="/"
        class="flex items-center gap-2 text-base font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ShoppingBag class="size-5 text-primary" aria-hidden="true" />
        <span>Home task</span>
      </RouterLink>

      <nav class="flex items-center gap-1 sm:gap-2" aria-label="Main">
        <RouterLink
          to="/cart"
          :aria-label="cartAriaLabel"
          class="rounded px-3 py-1.5 text-sm hover:bg-surface-100 dark:hover:bg-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          active-class="text-primary"
        >
          <OverlayBadge
            v-if="count > 0"
            :value="count"
            severity="contrast"
            :pt="{
              pcBadge: {
                root: { class: 'h-5 min-w-5 p-0 text-[11px] font-semibold', 'data-testid': 'cart-count' },
              },
            }"
          >
            <ShoppingCart class="size-5" aria-hidden="true" />
          </OverlayBadge>
          <ShoppingCart v-else class="size-5" aria-hidden="true" />
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
