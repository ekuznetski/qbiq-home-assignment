<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ArrowRight, Lock, Minus, Plus, ShoppingCart, Trash2 } from "lucide-vue-next";
import BackToProductsLink from "@/components/BackToProductsLink.vue";
import EmptyState from "@/components/EmptyState.vue";
import ProductThumb from "@/components/ProductThumb.vue";
import { useCartStore } from "@/stores/cart";
import { useCatalogStore } from "@/stores/catalog";
import { formatPrice } from "@/utils/format";

const cart = useCartStore();
const catalog = useCatalogStore();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const { items, count, lineItems, totalPrice } = storeToRefs(cart);
const { loading: catalogLoading } = storeToRefs(catalog);

function confirmClear(event: MouseEvent): void {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Remove all items from your cart?",
    rejectProps: { label: "Cancel", severity: "secondary", variant: "outlined", size: "small" },
    acceptProps: { label: "Clear cart", severity: "danger", size: "small" },
    accept: () => {
      cart.clear();
      toast.add({ severity: "info", summary: "Cart cleared", life: 1800 });
    },
  });
}

async function checkout(): Promise<void> {
  await router.push("/");
  cart.clear();
  toast.add({
    severity: "success",
    summary: "Checkout simulated",
    detail: "Mock checkout - no real payment was processed.",
    life: 2500,
  });
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 sm:px-10">
    <template v-if="count === 0 && !(catalogLoading && items.length > 0)">
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalog and add a few digital tools to get started."
      >
        <template #icon>
          <ShoppingCart class="size-10" aria-hidden="true" />
        </template>
        <BackToProductsLink variant="button" />
      </EmptyState>
    </template>

    <template v-else>
      <BackToProductsLink class="mb-6" label="Continue shopping" />

      <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <span class="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Your cart</span>
          <h1 class="text-4xl font-medium leading-[1.05] tracking-tighter sm:text-5xl">
            {{ count }} {{ count === 1 ? "item" : "items" }}
          </h1>
        </div>
        <button
          v-if="count > 0"
          type="button"
          class="inline-flex items-center gap-1.5 text-sm text-muted-color underline-offset-4 hover:text-color hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          @click="confirmClear"
        >
          <Trash2 class="size-3.5" aria-hidden="true" />
          Clear cart
        </button>
      </header>

      <div class="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul class="flex flex-col gap-3">
          <template v-if="catalogLoading && lineItems.length === 0">
            <li
              v-for="i in items.length"
              :key="`skeleton-${i}`"
              class="flex items-center gap-5 rounded-xl border border-surface bg-surface-0 p-4 dark:bg-surface-900"
            >
              <Skeleton width="6rem" height="6rem" border-radius="0.5rem" class="shrink-0" />
              <div class="flex flex-1 flex-col gap-2">
                <Skeleton width="6rem" height="0.75rem" />
                <Skeleton width="60%" height="1.25rem" />
                <Skeleton width="8rem" height="0.875rem" />
              </div>
              <Skeleton width="6rem" height="2.5rem" border-radius="9999px" />
              <Skeleton width="4rem" height="1.5rem" />
            </li>
          </template>

          <li
            v-for="line in lineItems"
            :key="line.product.id"
            class="flex flex-col gap-3 rounded-xl border border-surface bg-surface-0 p-4 sm:flex-row sm:items-center sm:gap-5 dark:bg-surface-900"
          >
            <div class="flex items-start gap-4 sm:contents">
              <RouterLink
                :to="{ name: 'product-details', params: { id: line.product.id } }"
                class="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <ProductThumb :src="line.product.thumbnailUrl" :alt="line.product.name" shape="square" />
              </RouterLink>

              <div class="flex flex-1 flex-col gap-1">
                <span class="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-color">
                  {{ line.product.category }}
                </span>
                <RouterLink
                  :to="{ name: 'product-details', params: { id: line.product.id } }"
                  class="font-medium tracking-tight hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {{ line.product.name }}
                </RouterLink>
                <span class="font-mono text-sm text-muted-color">{{ formatPrice(line.product.price) }} each</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 sm:contents">
              <div
                class="inline-flex items-center rounded-full border border-surface bg-surface-50 dark:bg-surface-950"
                role="group"
                :aria-label="`Quantity for ${line.product.name}`"
              >
                <button
                  type="button"
                  class="inline-flex size-8 items-center justify-center rounded-full text-muted-color transition-colors hover:text-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  :aria-label="`Decrease quantity of ${line.product.name}`"
                  @click="cart.decrement(line.product.id)"
                >
                  <Minus class="size-3.5" aria-hidden="true" />
                </button>
                <span class="w-9 text-center font-mono text-sm tabular-nums" aria-live="polite">{{ line.qty }}</span>
                <button
                  type="button"
                  class="inline-flex size-8 items-center justify-center rounded-full text-muted-color transition-colors hover:text-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  :aria-label="`Increase quantity of ${line.product.name}`"
                  @click="cart.increment(line.product.id)"
                >
                  <Plus class="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <p class="font-mono text-lg font-semibold tabular-nums sm:w-24 sm:shrink-0 sm:text-right">
                {{ formatPrice(line.lineTotal) }}
              </p>

              <button
                type="button"
                class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-color transition-colors hover:bg-surface-100 hover:text-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-surface-800"
                :aria-label="`Remove ${line.product.name} from cart`"
                @click="cart.removeItem(line.product.id)"
              >
                <Trash2 class="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>

        <aside class="self-start lg:sticky lg:top-24">
          <div
            class="flex flex-col gap-5 rounded-2xl border border-surface bg-surface-0 p-6 dark:bg-surface-900"
            aria-label="Order summary"
          >
            <h2 class="text-lg font-medium tracking-tight">Order summary</h2>

            <div class="flex flex-col gap-3 border-t border-surface pt-4 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-color">Items</span>
                <span class="font-mono tabular-nums">{{ count }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-color">Subtotal</span>
                <span class="font-mono tabular-nums">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-surface pt-4">
              <span class="text-base font-medium">Total</span>
              <span class="font-mono text-2xl font-semibold tabular-nums">{{ formatPrice(totalPrice) }}</span>
            </div>

            <Button rounded size="large" :disabled="count === 0" @click="checkout">
              <span class="inline-flex w-full items-center justify-between gap-3">
                <span class="inline-flex items-center gap-2">
                  <Lock class="size-4" aria-hidden="true" />
                  Checkout
                </span>
                <ArrowRight class="size-4" aria-hidden="true" />
              </span>
            </Button>

            <p class="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-color">
              Mock checkout - no real payment
            </p>
          </div>
        </aside>
      </div>
    </template>
  </section>
</template>
