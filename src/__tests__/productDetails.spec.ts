import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { fetchProducts } from "@/data/products";
import { useToast } from "primevue/usetoast";
import ProductDetails from "@/views/ProductDetails.vue";
import { useCartStore } from "@/stores/cart";
import { useCatalogStore } from "@/stores/catalog";
import { createTestPinia, createTestRouter, getTestGlobal, PRODUCT_FIXTURE } from "./test-utils";

vi.mock("@/data/products", () => ({
  fetchProducts: vi.fn(),
}));

vi.mock("primevue/usetoast", () => ({
  useToast: vi.fn(),
}));

const mockFetch = vi.mocked(fetchProducts);
const mockUseToast = vi.mocked(useToast);
const mockToastAdd = vi.fn();
const mockToastRemoveGroup = vi.fn();
const mockToastRemoveAllGroups = vi.fn();

const routes = [
  { path: "/", name: "product-list", component: { template: "<div />" } },
  { path: "/product/:id", name: "product-details", component: ProductDetails, props: true },
];

describe("ProductDetails view", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue([...PRODUCT_FIXTURE]);
    mockToastAdd.mockReset();
    mockUseToast.mockReturnValue({
      add: mockToastAdd,
      remove: vi.fn(),
      removeGroup: mockToastRemoveGroup,
      removeAllGroups: mockToastRemoveAllGroups,
    });
  });

  async function renderDetails(productId: string) {
    const pinia = createTestPinia();
    const router = createTestRouter(routes);
    await router.push(`/product/${productId}`);
    await router.isReady();

    useCatalogStore().products = [...PRODUCT_FIXTURE];

    const wrapper = mount(ProductDetails, {
      global: { plugins: getTestGlobal(router, pinia) },
      props: { id: productId },
    });
    await flushPromises();
    return { wrapper, router };
  }

  it("renders the product info from the catalog store", async () => {
    const { wrapper } = await renderDetails("p1");

    expect(wrapper.find("h1").text()).toBe("Alpha");
    expect(wrapper.text()).toContain("$10.00");
    expect(wrapper.text()).toContain("alpha short");
    expect(wrapper.text()).toContain("alpha long");
    expect(wrapper.text()).toContain("Software");
  });

  it("Add to cart adds the product to the global store and emits a success toast", async () => {
    const { wrapper } = await renderDetails("p1");

    const cart = useCartStore();
    expect(cart.count).toBe(0);

    const addBtn = wrapper.findAll("button").find((b) => b.text().includes("Add to cart"));
    expect(addBtn).toBeTruthy();
    await addBtn?.trigger("click");
    await flushPromises();

    expect(cart.count).toBe(1);
    expect(cart.items).toEqual([{ productId: "p1", qty: 1 }]);

    expect(mockToastAdd).toHaveBeenCalledTimes(1);
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        summary: "Added to cart",
        detail: "Alpha",
      }),
    );
  });

  it("shows an inline EmptyState when the route id is not in the catalog", async () => {
    const { wrapper } = await renderDetails("ghost-id");

    expect(wrapper.text()).toContain("Product not found");
    expect(wrapper.text()).toContain("ghost-id");
  });
});
