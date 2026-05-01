import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useCartStore } from "@/stores/cart";
import { useCatalogStore } from "@/stores/catalog";
import type { Product } from "@/types/product";

const FIXTURE: Product[] = [
  {
    id: "p1",
    name: "Alpha",
    price: 10,
    shortDescription: "",
    longDescription: "",
    thumbnailUrl: "",
    category: "Software",
    reviews: [],
  },
  {
    id: "p2",
    name: "Bravo",
    price: 25,
    shortDescription: "",
    longDescription: "",
    thumbnailUrl: "",
    category: "Software",
    reviews: [],
  },
  {
    id: "p3",
    name: "Charlie",
    price: 100,
    shortDescription: "",
    longDescription: "",
    thumbnailUrl: "",
    category: "Online Course",
    reviews: [],
  },
];

function createPiniaWithPersist() {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  const app = createApp({ template: "<div />" });
  app.use(pinia);
  setActivePinia(pinia);
  return pinia;
}

function seedCatalog(): void {
  const catalog = useCatalogStore();
  catalog.products = FIXTURE.map((p) => ({ ...p }));
}

describe("cart store", () => {
  beforeEach(() => {
    localStorage.clear();
    createPiniaWithPersist();
    seedCatalog();
  });

  it("addItem accumulates qty when called twice with same id", () => {
    const cart = useCartStore();
    cart.addItem("p1");
    cart.addItem("p1");
    expect(cart.count).toBe(2);
    expect(cart.items).toEqual([{ productId: "p1", qty: 2 }]);
  });

  it("addItem accepts an explicit qty", () => {
    const cart = useCartStore();
    cart.addItem("p2", 3);
    expect(cart.count).toBe(3);
  });

  it("removeItem drops the line entirely", () => {
    const cart = useCartStore();
    cart.addItem("p1", 2);
    cart.addItem("p2");
    cart.removeItem("p1");
    expect(cart.items).toEqual([{ productId: "p2", qty: 1 }]);
  });

  it("decrement removes the line when qty would go below 1", () => {
    const cart = useCartStore();
    cart.addItem("p1");
    cart.decrement("p1");
    expect(cart.items).toEqual([]);
  });

  it("decrement on missing id is a no-op", () => {
    const cart = useCartStore();
    cart.decrement("p1");
    expect(cart.items).toEqual([]);
  });

  it("lineItems resolves products from the catalog and computes lineTotal", () => {
    const cart = useCartStore();
    cart.addItem("p1", 2);
    cart.addItem("p3");
    expect(cart.lineItems).toEqual([
      { product: expect.objectContaining({ id: "p1" }), qty: 2, lineTotal: 20 },
      { product: expect.objectContaining({ id: "p3" }), qty: 1, lineTotal: 100 },
    ]);
  });

  it("count and lineItems both skip items whose product is missing from the catalog", () => {
    const cart = useCartStore();
    cart.addItem("p1");
    cart.addItem("ghost-id");
    expect(cart.items).toHaveLength(2);
    expect(cart.count).toBe(1);
    expect(cart.lineItems).toHaveLength(1);
    expect(cart.lineItems[0]?.product.id).toBe("p1");
  });

  it("addItem rejects non-positive or non-integer qty", () => {
    const cart = useCartStore();
    cart.addItem("p1", 0);
    cart.addItem("p1", -3);
    cart.addItem("p1", 1.5);
    expect(cart.items).toEqual([]);
  });

  it("totalPrice sums the lineTotals", () => {
    const cart = useCartStore();
    cart.addItem("p1", 2);
    cart.addItem("p2", 3);
    expect(cart.totalPrice).toBe(2 * 10 + 3 * 25);
  });

  it("clear empties items but keeps catalog intact", () => {
    const cart = useCartStore();
    cart.addItem("p1");
    cart.addItem("p2");
    cart.clear();
    expect(cart.items).toEqual([]);
    expect(useCatalogStore().products).toHaveLength(FIXTURE.length);
  });

  it("persists items to localStorage under the qbiq-home-task-cart key", async () => {
    const cart = useCartStore();
    cart.addItem("p1", 2);
    await flushPromises();
    const raw = localStorage.getItem("qbiq-home-task-cart");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string)).toEqual({ items: [{ productId: "p1", qty: 2 }] });
  });

  it("restores items from localStorage on a fresh pinia instance", () => {
    localStorage.setItem("qbiq-home-task-cart", JSON.stringify({ items: [{ productId: "p2", qty: 4 }] }));
    createPiniaWithPersist();
    seedCatalog();

    const cart = useCartStore();
    expect(cart.items).toEqual([{ productId: "p2", qty: 4 }]);
    expect(cart.count).toBe(4);
    expect(cart.totalPrice).toBe(4 * 25);
  });
});
