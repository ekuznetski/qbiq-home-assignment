import { test as base, expect, type Page } from "@playwright/test";

export const STORAGE_KEY = "qbiq-home-task-cart";

export type SeedItem = { productId: string; qty: number };

type Fixtures = {
  // Test-scoped option: opt out of strict console-error / pageerror enforcement
  // for tests that intentionally trigger app errors (e.g. ?fail=1).
  allowConsoleError: boolean;
  // Auto fixture: installs error collectors, fails the test in teardown if any
  // unexpected error occurred. Throwing inside page.on listeners is unreliable —
  // event-listener exceptions can be swallowed by Playwright's runner. Collect
  // and assert after the test body completes instead.
  failOnAppErrors: void;
  emptyCartPage: Page;
  persistentPage: Page;
  seedCart: (items: SeedItem[]) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  allowConsoleError: [false, { option: true }],

  failOnAppErrors: [
    async ({ page, allowConsoleError }, use) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => {
        pageErrors.push(`${err.name}: ${err.message}`);
      });

      await use();

      if (allowConsoleError) return;

      if (pageErrors.length > 0) {
        throw new Error(`Uncaught page errors:\n${pageErrors.join("\n")}`);
      }
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors:\n${consoleErrors.join("\n")}`);
      }
    },
    { auto: true },
  ],

  emptyCartPage: async ({ page }, use) => {
    await page.addInitScript((key: string) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    await use(page);
  },

  persistentPage: async ({ page }, use) => {
    await use(page);
  },

  seedCart: async ({ page }, use) => {
    await use(async (items) => {
      await page.addInitScript(
        (data: { key: string; payload: string }) => {
          localStorage.setItem(data.key, data.payload);
        },
        { key: STORAGE_KEY, payload: JSON.stringify({ items }) },
      );
    });
  },
});

export { expect };
