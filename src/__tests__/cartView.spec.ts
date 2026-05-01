import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { fetchProducts } from "@/data/products";
import { useConfirm } from "primevue/useconfirm";
import Cart from "@/views/Cart.vue";
import { useCartStore } from "@/stores/cart";
import { useCatalogStore } from "@/stores/catalog";
import { createTestPinia, createTestRouter, getTestGlobal, PRODUCT_FIXTURE } from "./test-utils";

vi.mock("@/data/products", () => ({
  fetchProducts: vi.fn(),
}));

vi.mock("primevue/useconfirm", () => ({
  useConfirm: vi.fn(),
}));

const mockFetch = vi.mocked(fetchProducts);
const mockUseConfirm = vi.mocked(useConfirm);
const mockRequire = vi.fn();

const routes = [
  { path: "/", name: "product-list", component: { template: "<div>home</div>" } },
  { path: "/cart", name: "cart", component: Cart },
  { path: "/product/:id", name: "product-details", component: { template: "<div />" } },
];

describe("Cart view", () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue([...PRODUCT_FIXTURE]);
    mockRequire.mockReset();
    mockUseConfirm.mockReturnValue({ require: mockRequire, close: vi.fn() });
  });

  async function renderCart() {
    const pinia = createTestPinia();
    const router = createTestRouter(routes);
    await router.push("/cart");
    await router.isReady();

    useCatalogStore().products = [...PRODUCT_FIXTURE];
    const cart = useCartStore();
    cart.addItem("p1", 2);
    cart.addItem("p2", 1);

    const wrapper = mount(Cart, { global: { plugins: getTestGlobal(router, pinia) } });
    await flushPromises();
    return { wrapper, router, cart };
  }

  it("checkout navigates to / before clearing the cart so the source page never flashes empty", async () => {
    const { wrapper, router, cart } = await renderCart();

    const events: string[] = [];
    const originalPush = router.push.bind(router);
    router.push = vi.fn((to: Parameters<typeof router.push>[0]) => {
      events.push("router.push");
      return originalPush(to);
    }) as typeof router.push;

    const originalClear = cart.clear.bind(cart);
    cart.clear = vi.fn(() => {
      events.push("cart.clear");
      originalClear();
    }) as typeof cart.clear;

    expect(cart.count).toBe(3);

    const checkoutBtn = wrapper.findAll("button").find((b) => b.text().includes("Checkout"));
    expect(checkoutBtn).toBeTruthy();
    await checkoutBtn?.trigger("click");
    await flushPromises();

    expect(events).toEqual(["router.push", "cart.clear"]);
    expect(cart.count).toBe(0);
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("shows outage panel with Retry when catalog failed and items are persisted", async () => {
    const pinia = createTestPinia();
    const router = createTestRouter(routes);
    await router.push("/cart");
    await router.isReady();

    const cart = useCartStore();
    cart.addItem("p1", 2);
    const catalog = useCatalogStore();
    catalog.products = [];
    catalog.error = "Mock fetch failed";

    const wrapper = mount(Cart, { global: { plugins: getTestGlobal(router, pinia) } });
    await flushPromises();

    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain("We can't load your cart right now");
    expect(alert.text()).toContain("Mock fetch failed");
    expect(alert.text()).toContain("2 items");
    expect(wrapper.text()).not.toContain("Your cart is empty");

    const retryBtn = wrapper.findAll("button").find((b) => b.text().includes("Retry"));
    expect(retryBtn).toBeTruthy();

    mockFetch.mockResolvedValueOnce([...PRODUCT_FIXTURE]);
    await retryBtn?.trigger("click");
    await flushPromises();

    expect(catalog.error).toBeNull();
    expect(catalog.products).toHaveLength(PRODUCT_FIXTURE.length);
  });

  it("Clear cart asks for confirmation and only clears when accepted", async () => {
    const { wrapper, cart } = await renderCart();

    expect(cart.count).toBe(3);

    const clearBtn = wrapper.findAll("button").find((b) => b.text().includes("Clear cart"));
    expect(clearBtn).toBeTruthy();
    await clearBtn?.trigger("click");

    expect(mockRequire).toHaveBeenCalledTimes(1);
    const arg = mockRequire.mock.calls[0]?.[0];
    expect(arg).toMatchObject({
      message: "Remove all items from your cart?",
      acceptProps: expect.objectContaining({ label: "Clear cart", severity: "danger" }),
      rejectProps: expect.objectContaining({ label: "Cancel" }),
    });
    expect(typeof arg.accept).toBe("function");

    expect(cart.count).toBe(3);

    arg.accept();
    expect(cart.count).toBe(0);
  });
});
