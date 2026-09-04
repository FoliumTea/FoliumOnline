import { expect, test } from "@playwright/test";

test("관리자에서 지원 프로필 패널 접근", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    const panelButton = page.getByRole("button", { name: "지원 프로필" });
    await expect(panelButton).toBeVisible();
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
});
