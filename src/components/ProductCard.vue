<script setup lang="ts">
import { RouterLink } from "vue-router";
import ProductThumb from "@/components/ProductThumb.vue";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/format";

defineProps<{ product: Product }>();
</script>

<template>
  <RouterLink
    :to="{ name: 'product-details', params: { id: product.id } }"
    class="group flex flex-col overflow-hidden rounded-lg border border-surface bg-surface-0 transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:bg-surface-900"
  >
    <ProductThumb :src="product.thumbnailUrl" :alt="product.name" />
    <div class="flex flex-1 flex-col gap-2 p-4">
      <span class="text-xs uppercase tracking-wider text-muted-color">{{ product.category }}</span>
      <h3 class="text-base font-semibold leading-tight">{{ product.name }}</h3>
      <p class="line-clamp-2 text-sm text-muted-color">{{ product.shortDescription }}</p>
      <p class="mt-auto pt-2 text-lg font-semibold">{{ formatPrice(product.price) }}</p>
    </div>
  </RouterLink>
</template>
