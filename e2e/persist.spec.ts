import { test, expect, STORAGE_KEY } from "./fixtures";

test.describe("cart persistence", () => {
  test("persists across reload", async ({ persistentPage: page }) => {
    // Land on any same-origin page first so localStorage is accessible,
    // then wipe pre-existing state, then load the actual scenario page.
    // page.addInitScript would re-run on every navigation (including reload)
    // and would defeat the persistence we are trying to verify.
    await page.goto("/");
    await page.evaluate((key: string) => localStorage.removeItem(key), STORAGE_KEY);

    await page.goto("/product/p1");
    await page.getByRole("button", { name: /^Add to cart/ }).first().click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    await page.goto("/cart");
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first()).toBeVisible();

    await page.evaluate((key: string) => localStorage.removeItem(key), STORAGE_KEY);
  });
});
