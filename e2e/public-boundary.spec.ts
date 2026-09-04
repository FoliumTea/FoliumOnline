import { expect, test } from "@playwright/test";

const privatePaths = [
    "/",
    "/resume",
    "/portfolio",
    "/blog",
    "/about",
    "/web",
    "/web/resume",
    "/web/portfolio",
    "/game",
    "/game/resume",
    "/portfolio/example-project",
    "/blog/example-post",
] as const;

test.describe("지원 링크 공개 경계", () => {
    for (const path of privatePaths) {
        test(`${path} 직접 접근은 404`, async ({ page }) => {
            const response = await page.goto(path, {
                waitUntil: "domcontentloaded",
            });
            expect(response?.status()).toBe(404);
        });
    }
});
