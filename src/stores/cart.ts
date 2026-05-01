import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useCatalogStore } from "@/stores/catalog";
import type { Product } from "@/types/product";

export interface CartItem {
  productId: string;
  qty: number;
}

export interface LineItem {
  product: Product;
  qty: number;
  lineTotal: number;
}

export const useCartStore = defineStore(
  "cart",
  () => {
    const catalog = useCatalogStore();
    const items = ref<CartItem[]>([]);

    const lineItems = computed<LineItem[]>(() => {
      const result: LineItem[] = [];
      for (const item of items.value) {
        const product = catalog.productById(item.productId);
        if (!product) continue;
        result.push({ product, qty: item.qty, lineTotal: product.price * item.qty });
      }
      return result;
    });

    const count = computed(() => lineItems.value.reduce((sum, line) => sum + line.qty, 0));

    const totalPrice = computed(() => lineItems.value.reduce((sum, line) => sum + line.lineTotal, 0));

    function addItem(productId: string, qty: number = 1): void {
      if (!Number.isInteger(qty) || qty <= 0) return;
      const existing = items.value.find((item) => item.productId === productId);
      if (existing) {
        existing.qty += qty;
      } else {
        items.value.push({ productId, qty });
      }
    }

    function removeItem(productId: string): void {
      items.value = items.value.filter((item) => item.productId !== productId);
    }

    function increment(productId: string): void {
      addItem(productId, 1);
    }

    function decrement(productId: string): void {
      const existing = items.value.find((item) => item.productId === productId);
      if (!existing) return;
      if (existing.qty <= 1) {
        removeItem(productId);
        return;
      }
      existing.qty -= 1;
    }

    function clear(): void {
      items.value = [];
    }

    return {
      items,
      count,
      lineItems,
      totalPrice,
      addItem,
      removeItem,
      increment,
      decrement,
      clear,
    };
  },
  {
    persist: {
      key: "qbiq-home-task-cart",
      storage: localStorage,
      pick: ["items"],
    },
  },
);
