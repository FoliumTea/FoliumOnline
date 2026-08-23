import { describe, expect, it, vi } from "vitest";

const queryMock = vi.hoisted(() => ({
    rows: [
        { key: "site_name", value: JSON.stringify("공통 제목") },
        {
            key: "seo_config",
            value: {
                default_description: "공통 설명",
                default_og_image: "https://example.com/default.png",
                job_fields: {
                    web: {
                        title: "웹 제목",
                        description: "웹 설명",
                        og_image: "https://example.com/web.png",
                    },
                },
            },
        },
    ],
}));

vi.mock("@/lib/queries", () => ({
    getSiteConfig: vi.fn(async () => queryMock.rows),
}));

import { getSeoMetadata } from "@/lib/seo-metadata";

describe("공개 목록 SEO 메타데이터", () => {
    it("제목만 재정의하고 직무 분야 설명과 이미지를 유지", async () => {
        await expect(
            getSeoMetadata("web", { title: "Portfolio" })
        ).resolves.toEqual({
            title: "Portfolio",
            description: "웹 설명",
            openGraph: {
                title: "Portfolio",
                description: "웹 설명",
                images: ["https://example.com/web.png"],
            },
            twitter: {
                card: "summary_large_image",
                title: "Portfolio",
                description: "웹 설명",
                images: ["https://example.com/web.png"],
            },
        });
    });
});
