import { describe, expect, it } from "vitest";
import { getPdfImageSource } from "@/lib/pdf-image-source";

describe("PDF image source", () => {
    const base = "http://localhost:3000/game/portfolio";

    it("uses the existing image optimizer for cross-origin raster images", () => {
        const source =
            "https://images.example.com/portfolio/cover.png?version=2";
        const result = new URL(getPdfImageSource(source, base), base);
        expect(result.pathname).toBe("/_next/image");
        expect(result.searchParams.get("url")).toBe(source);
        expect(result.searchParams.get("q")).toBe("75");
    });

    it("keeps local, already optimized, and inline sources unchanged", () => {
        for (const source of [
            "/images/icon.png",
            "/_next/image?url=cover.png&w=1200&q=75",
            "http://localhost:3000/images/icon.png",
            "data:image/png;base64,AA==",
            "blob:http://localhost:3000/local-image",
        ]) {
            expect(getPdfImageSource(source, base)).toBe(source);
        }
    });
});
