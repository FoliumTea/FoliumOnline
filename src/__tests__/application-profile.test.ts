import { describe, expect, it } from "vitest";
import {
    createApplicationProfileToken,
    isApplicationProfileToken,
    materializeApplicationProfile,
} from "@/lib/application-profile";
import type { ApplicationProfile } from "@/types/application-profile";

const profile = {
    id: "profile-id",
    name: "지원 프로필",
    public_token: "abcdefghijklmnopqrstuv",
    parent_job_field: "web",
    job_description: "JD",
    status: "draft",
    version: 1,
    base_snapshot: {
        jobField: "web",
        resume: { basics: { label: "기본 headline", summary: "기본 summary" } },
        about: {},
        portfolio: [
            { slug: "first", title: "첫 항목" },
            { slug: "second", title: "둘째 항목" },
            { slug: "hidden", title: "숨김 항목" },
        ],
        posts: [
            {
                slug: "post-a",
                title: "A",
                description: null,
                content: "",
                pub_date: "2026-01-01",
                category: null,
                tags: [],
                thumbnail: null,
                meta_title: null,
                meta_description: null,
                og_image: null,
            },
            {
                slug: "post-b",
                title: "B",
                description: null,
                content: "",
                pub_date: "2026-01-02",
                category: null,
                tags: [],
                thumbnail: null,
                meta_title: null,
                meta_description: null,
                og_image: null,
            },
        ],
        sourceHash: "source-hash",
    },
    overrides: {
        excludedPortfolioSlugs: ["hidden"],
        portfolioOrder: ["second"],
        excludedPostSlugs: [],
        postOrder: ["post-b"],
        headline: "JD headline",
    },
    public_snapshot: null,
    published_at: null,
    created_at: "",
    updated_at: "",
} as unknown as ApplicationProfile;

describe("application profiles", () => {
    it("generates URL-safe 128-bit tokens", () => {
        const token = createApplicationProfileToken();
        expect(token).toHaveLength(22);
        expect(isApplicationProfileToken(token)).toBe(true);
        expect(isApplicationProfileToken("web")).toBe(false);
    });

    it("keeps the parent snapshot immutable while applying JD overrides", () => {
        const snapshot = materializeApplicationProfile(profile);
        expect(snapshot.resume.basics?.label).toBe("JD headline");
        expect(snapshot.portfolio.map((item) => item.slug)).toEqual([
            "second",
            "first",
        ]);
        expect(snapshot.posts.map((item) => item.slug)).toEqual([
            "post-b",
            "post-a",
        ]);
        expect(profile.base_snapshot.portfolio).toHaveLength(3);
    });
});
