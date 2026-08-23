import { beforeEach, describe, expect, it, vi } from "vitest";

type BlogMeta = {
    title: string;
    meta_title: string | null;
    meta_description: string | null;
    og_image: string | null;
    thumbnail: string | null;
    description: string | null;
    category: string | null;
};

type PortfolioMeta = Omit<BlogMeta, "category">;

const queryMock = vi.hoisted(() => ({
    post: null as BlogMeta | null,
    portfolioItem: null as PortfolioMeta | null,
}));

vi.mock("@/lib/queries", () => ({
    getPostMeta: vi.fn(async () => queryMock.post),
    getPortfolioItemMeta: vi.fn(async () => queryMock.portfolioItem),
}));

import {
    getBlogPostMetadata,
    getPortfolioItemMetadata,
} from "@/lib/content-metadata";

describe("콘텐츠 공유 메타데이터", () => {
    beforeEach(() => {
        queryMock.post = null;
        queryMock.portfolioItem = null;
    });

    it("Blog 제목과 이미지를 항목 값으로 구성", async () => {
        queryMock.post = {
            title: "벡터 검색",
            meta_title: null,
            meta_description: null,
            og_image: "https://example.com/og.png",
            thumbnail: "https://example.com/thumbnail.png",
            description: "Blog 설명",
            category: "검색",
        };

        await expect(getBlogPostMetadata("vector-search")).resolves.toEqual({
            title: "검색 | 벡터 검색",
            description: "Blog 설명",
            openGraph: {
                title: "벡터 검색",
                description: "Blog 설명",
                images: ["https://example.com/og.png"],
            },
            twitter: {
                card: "summary_large_image",
                title: "벡터 검색",
                description: "Blog 설명",
                images: ["https://example.com/og.png"],
            },
        });
    });

    it("이미지가 없으면 상위 이미지 상속 없이 공유 메타데이터 구성", async () => {
        queryMock.post = {
            title: "이미지 없는 글",
            meta_title: null,
            meta_description: "  SEO 설명  ",
            og_image: null,
            thumbnail: null,
            description: "기본 설명",
            category: null,
        };

        await expect(getBlogPostMetadata("no-image")).resolves.toEqual({
            title: "이미지 없는 글",
            description: "SEO 설명",
            openGraph: {
                title: "이미지 없는 글",
                description: "SEO 설명",
            },
            twitter: {
                card: "summary",
                title: "이미지 없는 글",
                description: "SEO 설명",
            },
        });
    });

    it("Portfolio 공유 제목에 접미사를 붙이지 않고 thumbnail을 fallback으로 사용", async () => {
        queryMock.portfolioItem = {
            title: "프로젝트 제목",
            meta_title: null,
            meta_description: null,
            og_image: null,
            thumbnail: "https://example.com/thumbnail.png",
            description: "프로젝트 설명",
        };

        await expect(getPortfolioItemMetadata("project")).resolves.toEqual({
            title: "프로젝트 제목 - Portfolio",
            description: "프로젝트 설명",
            openGraph: {
                title: "프로젝트 제목",
                description: "프로젝트 설명",
                images: ["https://example.com/thumbnail.png"],
            },
            twitter: {
                card: "summary_large_image",
                title: "프로젝트 제목",
                description: "프로젝트 설명",
                images: ["https://example.com/thumbnail.png"],
            },
        });
    });

    it("SEO 제목이 있으면 브라우저와 공유 제목에 사용", async () => {
        queryMock.portfolioItem = {
            title: "프로젝트 제목",
            meta_title: "  SEO 프로젝트 제목  ",
            meta_description: null,
            og_image: null,
            thumbnail: null,
            description: "프로젝트 설명",
        };

        const metadata = await getPortfolioItemMetadata("project");

        expect(metadata.title).toBe("SEO 프로젝트 제목");
        expect(metadata.openGraph).toMatchObject({
            title: "SEO 프로젝트 제목",
        });
        expect(metadata.twitter).toMatchObject({
            title: "SEO 프로젝트 제목",
        });
    });

    it("존재하지 않는 항목에는 메타데이터를 반환하지 않음", async () => {
        await expect(getBlogPostMetadata("missing")).resolves.toEqual({});
        await expect(getPortfolioItemMetadata("missing")).resolves.toEqual({});
    });
});
