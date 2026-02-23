// Astro 콘텐츠 콜렉션 설정 - Keystatic 스키마와 일치
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

// 블로그 포스트 (Keystatic에서 관리)
const posts = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(), // relationship 저장값 = 태그 slug 배열
        thumbnail: z.string().optional(),
    }),
});

// 태그 (Keystatic에서 관리, 포스트에서 relationship으로 참조)
const tags = defineCollection({
    type: "data",
    schema: z.object({
        name: z.string(),
        color: z.string().optional(),
    }),
});

// 포트폴리오 프로젝트 (Markdoc 기반, src/content/portfolio/*.mdoc)
const portfolio = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        goal: z.string(),
        role: z.string(),
        teamSize: z.number(),
        accomplishments: z.array(z.string()),
        keywords: z.array(z.string()),
        github: z.string().default(""),
        public: z.boolean(),
        jobField: z
            .union([z.enum(["web", "game"]), z.array(z.enum(["web", "game"]))])
            .optional(),
        thumbnail: z.string().optional(),
        badges: z.array(z.object({ text: z.string() })).optional(),
    }),
});

export const collections = {
    posts,
    tags,
    portfolio,
};
