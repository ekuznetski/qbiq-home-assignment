<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import { RefreshCw, SearchX, TriangleAlert } from "lucide-vue-next";
import EmptyState from "@/components/EmptyState.vue";
import ProductCard from "@/components/ProductCard.vue";
import ProductCardSkeleton from "@/components/ProductCardSkeleton.vue";
import ProductFilters from "@/components/ProductFilters.vue";
import { SORT_KEYS, useProductFilters, type SortKey } from "@/composables/useProductFilters";
import { useCatalogStore } from "@/stores/catalog";

const SKELETON_COUNT = 3;

const route = useRoute();
const router = useRouter();

const catalog = useCatalogStore();
const { products, loading, error } = storeToRefs(catalog);

const { query, categories, sortBy, availableCategories, filtered, reset } = useProductFilters(products);

function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && (SORT_KEYS as readonly string[]).includes(value);
}

function readQueryString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

watch(
  () => route.query,
  (q) => {
    const nextQuery = readQueryString(q.q);
    if (nextQuery !== query.value) query.value = nextQuery;

    const rawCats = readQueryString(q.cat);
    const nextCats = rawCats ? rawCats.split(",").filter(Boolean) : [];
    const currentCats = Array.from(categories.value).sort();
    if (nextCats.slice().sort().join(",") !== currentCats.join(",")) {
      categories.value = new Set(nextCats);
    }

    const rawSort = q.sort;
    const nextSort: SortKey = isSortKey(rawSort) ? rawSort : "name-asc";
    if (nextSort !== sortBy.value) sortBy.value = nextSort;
  },
  { immediate: true },
);

watch(
  [query, categories, sortBy],
  ([q, cats, sort]) => {
    const next: Record<string, string> = {};
    if (q) next.q = q;
    if (cats.size > 0) next.cat = Array.from(cats).join(",");
    if (sort !== "name-asc") next.sort = sort;

    const current = route.query;
    const sameQ = (current.q ?? "") === (next.q ?? "");
    const sameCat = (current.cat ?? "") === (next.cat ?? "");
    const sameSort = (current.sort ?? "") === (next.sort ?? "");
    if (sameQ && sameCat && sameSort) return;

    void router.replace({ query: next });
  },
  { deep: true },
);
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 sm:px-10">
    <header class="mb-10 flex flex-col gap-3">
      <div class="flex items-end justify-between gap-6">
        <div class="flex flex-col gap-1.5">
          <span class="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Catalog</span>
          <h1 class="text-5xl font-medium leading-[1.05] tracking-tighter">Curated digital tools</h1>
        </div>
      </div>
      <p class="max-w-xl text-base text-muted-color">
        Read, build, learn - handpicked software, courses, and books for makers.
      </p>
    </header>

    <ProductFilters
      v-model:query="query"
      v-model:categories="categories"
      v-model:sort-by="sortBy"
      :available-categories="availableCategories"
      :total-count="products.length"
      :filtered-count="filtered.length"
      :loading="loading"
      class="mb-6"
      @reset="reset"
    />

    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <ProductCardSkeleton v-for="i in SKELETON_COUNT" :key="i" />
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-500/40 bg-red-500/10 p-6" role="alert">
      <div class="flex items-center gap-2">
        <TriangleAlert class="size-5 text-red-400" aria-hidden="true" />
        <p class="font-semibold">Couldn't load products</p>
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
      v-else-if="filtered.length === 0"
      title="No products match your filters"
      description="Try a different search term or remove some category filters."
    >
      <template #icon>
        <SearchX class="size-8" aria-hidden="true" />
      </template>
      <Button rounded size="small" @click="reset">Reset filters</Button>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in filtered" :key="product.id" :product="product" />
    </div>
  </section>
</template>
