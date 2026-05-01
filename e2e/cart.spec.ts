import { test, expect } from "./fixtures";

test.describe("cart", () => {
  test("add to cart updates header and cart page", async ({ emptyCartPage: page }) => {
    await page.goto("/product/p1");
    await page
      .getByRole("button", { name: /^Add to cart/ })
      .first()
      .click();

    await expect(page.getByText("Added to cart")).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    await page.getByRole("link", { name: /^Cart,/ }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first()).toBeVisible();

    const summary = page.getByLabel("Order summary");
    await expect(summary).toContainText("$79.99");
  });

  test("stepper math updates totals", async ({ emptyCartPage: page, seedCart }) => {
    await seedCart([{ productId: "p2", qty: 1 }]);
    await page.goto("/cart");

    const summary = page.getByLabel("Order summary");
    await expect(summary).toContainText("$199.50");

    await page.getByRole("button", { name: "Increase quantity of Ultimate Graphics Suite" }).click();
    await expect(summary).toContainText("$399.00");

    await page.getByRole("button", { name: "Increase quantity of Ultimate Graphics Suite" }).click();
    await expect(summary).toContainText("$598.50");

    await page.getByRole("button", { name: "Decrease quantity of Ultimate Graphics Suite" }).click();
    await expect(summary).toContainText("$399.00");
  });

  test("decrement at qty=1 removes line", async ({ emptyCartPage: page, seedCart }) => {
    await seedCart([{ productId: "p1", qty: 1 }]);
    await page.goto("/cart");

    await page.getByRole("button", { name: "Decrease quantity of Awesome E-book Reader Pro" }).click();

    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  });

  test("trash button removes line", async ({ emptyCartPage: page, seedCart }) => {
    await seedCart([
      { productId: "p1", qty: 2 },
      { productId: "p3", qty: 1 },
    ]);
    await page.goto("/cart");

    await page.getByRole("button", { name: "Remove Awesome E-book Reader Pro from cart" }).click();

    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Vue.js Masterclass Course" }).first()).toBeVisible();

    const summary = page.getByLabel("Order summary");
    await expect(summary).toContainText("Items");
    await expect(summary.getByText("1", { exact: true }).first()).toBeVisible();
  });

  test("checkout clears cart, navigates home, shows toast", async ({ emptyCartPage: page, seedCart }) => {
    await seedCart([{ productId: "p3", qty: 2 }]);
    await page.goto("/cart");

    await page.getByRole("button", { name: /Checkout/ }).click();

    await expect(page).toHaveURL(/\/$|\/\?/);
    await expect(page.getByText("Checkout simulated")).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
  });

  test("clear cart confirm: cancel keeps line, accept clears", async ({ emptyCartPage: page, seedCart }) => {
    await seedCart([{ productId: "p1", qty: 1 }]);
    await page.goto("/cart");

    const clearTrigger = page.getByRole("button", { name: /Clear cart/ }).first();
    await clearTrigger.click();
    // Confirm message is rendered only when popup is open - use it as a visibility gate
    const message = page.getByText("Remove all items from your cart?");
    await expect(message).toBeVisible();
    // Cancel exists only inside the popup
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(message).toBeHidden();
    await expect(page.getByRole("link", { name: "Awesome E-book Reader Pro" }).first()).toBeVisible();

    await clearTrigger.click();
    await expect(message).toBeVisible();
    // The accept button is also labeled "Clear cart" - second match is the popup button (trigger came first)
    await page.getByRole("button", { name: "Clear cart" }).last().click();

    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  });
});
