import { ref } from "vue";
import { defineStore } from "pinia";
import { fetchProducts } from "@/data/products";
import type { Product } from "@/types/product";

export const useCatalogStore = defineStore("catalog", () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function productById(id: string): Product | undefined {
    return products.value.find((p) => p.id === id);
  }

  async function load(): Promise<void> {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      products.value = await fetchProducts();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load products";
      products.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, load, productById };
});
