import { computed, ref, toValue, type MaybeRefOrGetter } from "vue";
import { refDebounced } from "@vueuse/core";
import type { Product } from "@/types/product";

export type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc";

const SEARCH_DEBOUNCE_MS = 200;

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "price-asc", label: "Price (low → high)" },
  { value: "price-desc", label: "Price (high → low)" },
];

export const SORT_KEYS: ReadonlyArray<SortKey> = SORT_OPTIONS.map((e) => e.value);

const DEFAULT_SORT: SortKey = SORT_KEYS[0];

const COMPARATORS: Record<SortKey, (a: Product, b: Product) => number> = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

export function useProductFilters(products: MaybeRefOrGetter<Product[]>) {
  const query = ref<string>("");
  const debouncedQuery = refDebounced(query, SEARCH_DEBOUNCE_MS);
  const categories = ref<Set<string>>(new Set());
  const sortBy = ref<SortKey>(DEFAULT_SORT);

  const availableCategories = computed<string[]>(() => {
    const set = new Set<string>();
    for (const product of toValue(products)) set.add(product.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  const filtered = computed<Product[]>(() => {
    const needle = debouncedQuery.value.trim().toLowerCase();
    const activeCategories = categories.value;

    const matches = toValue(products).filter((product) => {
      if (needle && !product.name.toLowerCase().includes(needle)) return false;
      if (activeCategories.size > 0 && !activeCategories.has(product.category)) return false;
      return true;
    });

    return matches.sort(COMPARATORS[sortBy.value]);
  });

  function reset(): void {
    query.value = "";
    categories.value = new Set();
    sortBy.value = DEFAULT_SORT;
  }

  return { query, categories, sortBy, availableCategories, filtered, reset };
}
