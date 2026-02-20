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

export const collections = {
    posts,
    tags,
};
