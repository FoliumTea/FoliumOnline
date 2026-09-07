import { expect, test } from "@playwright/test";

const noJobFieldPaths = [
    "/",
    "/resume",
    "/portfolio",
    "/blog",
    "/about",
    "/portfolio/example-project",
    "/blog/example-post",
] as const;

const publicJobFieldPaths = [
    "/web",
    "/web/resume",
    "/web/portfolio",
    "/game",
    "/game/resume",
] as const;

test.describe("공개 직무 분야 경계", () => {
    for (const path of noJobFieldPaths) {
        test(`${path} 직접 접근은 404`, async ({ page }) => {
            const response = await page.goto(path, {
                waitUntil: "domcontentloaded",
            });
            expect(response?.status()).toBe(404);
        });
    }

    for (const path of publicJobFieldPaths) {
        test(`${path} 직접 접근은 200`, async ({ page }) => {
            const response = await page.goto(path, {
                waitUntil: "domcontentloaded",
            });
            expect(response?.status()).toBe(200);
        });
    }
});
