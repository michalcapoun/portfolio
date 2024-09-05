import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://michalcapoun.github.io/portfolio/");
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "" }).click();
  const page1 = await page1Promise;
  const page2Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "" }).click();
  const page2 = await page2Promise;
  await page.getByRole("link", { name: "" }).click();
  const page3Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "" }).click();
  const page3 = await page3Promise;
  await page.locator("#theme-button").click();
  await page.locator("#theme-button").click();
  const page4Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Resume" }).click();
  const page4 = await page4Promise;
  const page5Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "LinkedIn" }).click();
  const page5 = await page5Promise;
  const page6Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "GitHub" }).click();
  const page6 = await page6Promise;
  await page.getByRole("link", { name: "Email" }).click();
  const page7Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "live version" }).first().click();
  const page7 = await page7Promise;
  const page8Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "source code" }).first().click();
  const page8 = await page8Promise;
  const page9Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "live version" }).nth(1).click();
  const page9 = await page9Promise;
  const page10Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "source code" }).nth(1).click();
  const page10 = await page10Promise;
  await page.locator("#contact i").first().click();
  await page.locator("#contact i").nth(1).click();
});
