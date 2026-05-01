<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useTitle } from "@vueuse/core";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import Tag from "primevue/tag";
import { useToast } from "primevue/usetoast";
import { CircleAlert, RefreshCw, ShoppingCart, TriangleAlert } from "lucide-vue-next";
import BackToProductsLink from "@/components/BackToProductsLink.vue";
import EmptyState from "@/components/EmptyState.vue";
import ProductThumb from "@/components/ProductThumb.vue";
import ReviewList from "@/components/ReviewList.vue";
import { useCartStore } from "@/stores/cart";
import { useCatalogStore } from "@/stores/catalog";
import { formatPrice } from "@/utils/format";

const props = defineProps<{ id: string }>();

const cart = useCartStore();
const catalog = useCatalogStore();
const toast = useToast();

const { loading, error } = storeToRefs(catalog);
const product = computed(() => catalog.productById(props.id) ?? null);

const pageTitle = computed(() => (product.value ? `${product.value.name} | Home task` : "Product | Home task"));
useTitle(pageTitle);

function addToCart(): void {
  if (!product.value) return;
  cart.addItem(product.value.id);
  toast.add({
    severity: "success",
    summary: "Added to cart",
    detail: product.value.name,
    life: 2000,
  });
}
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6 lg:pb-12">
    <BackToProductsLink class="mb-6" />

    <div v-if="loading" class="grid gap-8 md:grid-cols-2" aria-busy="true">
      <div class="aspect-square w-full max-w-140">
        <Skeleton height="100%" border-radius="0.5rem" />
      </div>
      <div class="flex flex-col gap-3">
        <Skeleton width="30%" height="1.25rem" />
        <Skeleton width="80%" height="2rem" />
        <Skeleton width="40%" height="1.5rem" />
        <Skeleton width="100%" height="0.875rem" class="mt-2" />
        <Skeleton width="60%" height="0.875rem" />
        <Skeleton width="10rem" height="2.5rem" class="mt-4" />
      </div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-500/40 bg-red-500/10 p-6" role="alert">
      <div class="flex items-center gap-2">
        <TriangleAlert class="size-5 text-red-400" aria-hidden="true" />
        <p class="font-semibold">Couldn't load product</p>
      </div>
      <p class="mt-1 text-sm text-muted-color">{{ error }}</p>
      <Button rounded size="small" class="mt-4" @click="catalog.load()">
        <span class="inline-flex items-center gap-1.5">
          <RefreshCw class="size-3.5" />
          Retry
        </span>
      </Button>
    </div>

    <EmptyState
      v-else-if="!product"
      title="Product not found"
      :description="`No product with id '${props.id}' exists in the catalog.`"
    >
      <template #icon>
        <CircleAlert class="size-8" aria-hidden="true" />
      </template>
      <BackToProductsLink variant="button" label="Browse products" />
    </EmptyState>

    <div v-else>
      <div class="grid gap-8 md:grid-cols-2 md:items-start">
        <ProductThumb :src="product.thumbnailUrl" :alt="product.name" shape="hero" />
        <div class="flex flex-col gap-4">
          <Tag
            :value="product.category"
            severity="secondary"
            rounded
            class="self-start"
            :pt="{ root: { class: 'px-4 py-1.5' } }"
          />
          <h1 class="text-3xl font-semibold tracking-tight">{{ product.name }}</h1>
          <p class="text-2xl font-semibold">{{ formatPrice(product.price) }}</p>
          <p class="text-base text-muted-color">{{ product.shortDescription }}</p>
          <Button rounded size="large" class="hidden self-start lg:inline-flex" @click="addToCart">
            <span class="inline-flex items-center gap-2">
              <ShoppingCart class="size-5" />
              Add to cart
            </span>
          </Button>
        </div>
      </div>

      <section class="mt-10">
        <h2 class="text-xl font-semibold">Description</h2>
        <p class="mt-3 text-base leading-relaxed text-muted-color">{{ product.longDescription }}</p>
      </section>

      <ReviewList :reviews="product.reviews" class="mt-10" />

      <div
        class="fixed inset-x-0 bottom-0 z-20 border-t border-surface bg-surface-50/95 px-6 py-4 backdrop-blur lg:hidden dark:bg-surface-950/95"
      >
        <Button rounded size="large" class="w-full" @click="addToCart">
          <span class="inline-flex items-center justify-center gap-2">
            <ShoppingCart class="size-5" />
            Add to cart · {{ formatPrice(product.price) }}
          </span>
        </Button>
      </div>
    </div>
  </section>
</template>
