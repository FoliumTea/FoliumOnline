/**
 * 마크다운 → HTML 변환 유틸리티 (빌드 타임 전용)
 * unified 파이프라인 + Shiki 구문 강조 (라이트/다크 듀얼 테마)
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

// 파이프라인 싱글톤 (빌드 중 재사용)
const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeShiki, {
        themes: { light: "github-light", dark: "github-dark" },
        // defaultColor:false → 각 span에 --shiki-light/--shiki-dark 변수만 주입
        // 실제 color는 global.css의 CSS 규칙이 처리
        defaultColor: false,
    })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify);

/**
 * 마크다운 문자열을 HTML 문자열로 변환한다.
 * @param content 마크다운 원문
 * @returns HTML 문자열
 */
export async function renderMarkdown(content: string): Promise<string> {
    const result = await processor.process(content);
    return String(result);
}
