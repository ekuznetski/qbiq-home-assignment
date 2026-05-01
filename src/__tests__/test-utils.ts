import { createApp, type Plugin } from "vue";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from "vue-router";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";
import { useCatalogStore } from "@/stores/catalog";
import type { Product } from "@/types/product";

export const PRODUCT_FIXTURE: Product[] = [
  {
    id: "p1",
    name: "Alpha",
    price: 10,
    shortDescription: "alpha short",
    longDescription: "alpha long",
    thumbnailUrl: "https://example.com/p1.png",
    category: "Software",
    reviews: [{ username: "user1", comment: "great" }],
  },
  {
    id: "p2",
    name: "Bravo",
    price: 25,
    shortDescription: "bravo short",
    longDescription: "bravo long",
    thumbnailUrl: "https://example.com/p2.png",
    category: "Software",
    reviews: [],
  },
  {
    id: "p3",
    name: "Charlie",
    price: 100,
    shortDescription: "charlie short",
    longDescription: "charlie long",
    thumbnailUrl: "https://example.com/p3.png",
    category: "Online Course",
    reviews: [],
  },
];

export function createTestPinia(): Pinia {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  const app = createApp({ template: "<div />" });
  app.use(pinia);
  setActivePinia(pinia);
  return pinia;
}

export function seedCatalog(products: Product[] = PRODUCT_FIXTURE): void {
  useCatalogStore().products = products.map((p) => ({ ...p }));
}

export function createTestRouter(routes: RouteRecordRaw[]): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}

const PRIMEVUE_OPTIONS = {
  theme: {
    preset: Aura,
    options: { prefix: "p", darkModeSelector: ".dark", cssLayer: false },
  },
};

export function getTestGlobal(router?: Router, pinia?: Pinia): (Plugin | [Plugin, ...unknown[]])[] {
  const plugins: (Plugin | [Plugin, ...unknown[]])[] = [
    pinia ?? createTestPinia(),
    [PrimeVue, PRIMEVUE_OPTIONS],
    ToastService,
    ConfirmationService,
  ];
  if (router) plugins.push(router as unknown as Plugin);
  return plugins;
}
