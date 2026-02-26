/**
 * Markdoc → HTML 변환 유틸리티 (빌드 타임 전용)
 *
 * - Markdoc 파서로 커스텀 태그(folium-table, youtube) 처리
 * - Shiki 후처리로 코드 블록 구문 강조 (라이트/다크 듀얼 테마)
 * - rehype-slug + rehype-autolink-headings 으로 헤딩 앵커 자동 생성
 */
import Markdoc, {
    type RenderableTreeNode,
    type Tag as MarkdocTag,
} from "@markdoc/markdoc";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { tailwindToHex, isLightBackground } from "@/lib/tailwind-colors";

// HTML 특수문자 이스케이프
function esc(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** folium-table 커스텀 태그 → HTML 문자열 (FoliumTable.astro 로직 이식) */
function renderFoliumTable(attrs: Record<string, unknown>): string {
    function parseArr<T>(v: unknown): T[] {
        if (!v) return [];
        try {
            return typeof v === "string" ? JSON.parse(v) : (v as T[]);
        } catch {
            return [];
        }
    }

    const headers = parseArr<string>(attrs.columns);
    const dataRows = parseArr<string[]>(attrs.rows);
    const headColors = attrs.columnHeadColors
        ? parseArr<string>(attrs.columnHeadColors)
        : undefined;
    const headColorsDark = attrs.columnHeadColorsDark
        ? parseArr<string>(attrs.columnHeadColorsDark)
        : undefined;
    const bodyColors = attrs.rowColors
        ? parseArr<string>(attrs.rowColors)
        : undefined;
    const bodyColorsDark = attrs.rowColorsDark
        ? parseArr<string>(attrs.rowColorsDark)
        : undefined;

    const NOWRAP = 15;
    function getTextColor(name: string): string {
        return isLightBackground(name)
            ? "var(--color-foreground)"
            : "rgba(255,255,255,0.95)";
    }

    const hasColors = !!(headColors?.length || bodyColors?.length);

    const thHtml = headers
        .map((h, i) => {
            const tl = headColors?.[i];
            const td = headColorsDark?.[i];
            const bgl = tl ? tailwindToHex(tl) : "";
            const bgd = td ? tailwindToHex(td) : "";
            const txl = tl ? getTextColor(tl) : "";
            const txd = td ? getTextColor(td) : tl ? getTextColor(tl) : "";
            const cls = [
                tl || td ? "pt-head-col" : "",
                h.length <= NOWRAP ? "ft-nowrap" : "",
            ]
                .filter(Boolean)
                .join(" ");
            const style = bgl ? ` style="--pt-bg:${bgl};--pt-text:${txl}"` : "";
            const data = [
                `data-pt-head-idx="${i}"`,
                bgd ? `data-pt-bg-dark="${bgd}"` : "",
                txd ? `data-pt-text-dark="${txd}"` : "",
            ]
                .filter(Boolean)
                .join(" ");
            return `<th${cls ? ` class="${cls}"` : ""}${style} ${data}>${esc(h)}</th>`;
        })
        .join("");

    const tbHtml = dataRows
        .map((row) => {
            const tdHtml = row
                .map((cell, i) => {
                    const tl = bodyColors?.[i];
                    const td = bodyColorsDark?.[i];
                    const bgl = tl ? tailwindToHex(tl) : "";
                    const bgd = td ? tailwindToHex(td) : "";
                    const txl = tl ? getTextColor(tl) : "";
                    const txd = td
                        ? getTextColor(td)
                        : tl
                          ? getTextColor(tl)
                          : "";
                    const text = cell || "—";
                    const cls = [
                        tl || td ? "pt-body-col" : "",
                        text.length <= NOWRAP ? "ft-nowrap" : "",
                    ]
                        .filter(Boolean)
                        .join(" ");
                    const style = bgl
                        ? ` style="--pt-bg:${bgl};--pt-text:${txl}"`
                        : "";
                    const data = [
                        `data-pt-body-idx="${i}"`,
                        bgd ? `data-pt-bg-dark="${bgd}"` : "",
                        txd ? `data-pt-text-dark="${txd}"` : "",
                    ]
                        .filter(Boolean)
                        .join(" ");
                    return `<td${cls ? ` class="${cls}"` : ""}${style} ${data}>${esc(text)}</td>`;
                })
                .join("");
            return `<tr>${tdHtml}</tr>`;
        })
        .join("");

    return `<div class="folium-table-wrapper"><table class="folium-table${hasColors ? " has-col-colors" : ""}"><thead><tr>${thHtml}</tr></thead><tbody>${tbHtml}</tbody></table></div>`;
}

/** youtube 커스텀 태그 → HTML 문자열 (YouTubeEmbed.astro 로직 이식) */
function renderYouTube(attrs: Record<string, unknown>): string {
    const id = esc(String(attrs.id ?? ""));
    return `<div class="youtube-embed-wrapper"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="youtube-embed"></iframe></div>`;
}

// 자기 닫힘 void 태그 목록
const VOID_TAGS = new Set([
    "img",
    "br",
    "hr",
    "input",
    "meta",
    "link",
    "area",
    "base",
    "col",
    "embed",
    "param",
    "source",
    "track",
    "wbr",
]);

/** Markdoc 렌더 트리 → HTML 문자열 (재귀 렌더링) */
function renderNode(node: RenderableTreeNode): string {
    if (node === null || node === undefined) return "";
    if (typeof node === "string") return esc(node);
    if (Array.isArray(node)) return node.map(renderNode).join("");
    if (!Markdoc.Tag?.isTag(node)) return "";

    const { name, attributes = {}, children = [] } = node;

    // 문서 루트(name이 없는 경우): 자식만 렌더링
    if (!name) return children.map(renderNode).join("");

    // 커스텀 컴포넌트
    if (name === "FoliumTable")
        return renderFoliumTable(attributes as Record<string, unknown>);
    if (name === "YouTube")
        return renderYouTube(attributes as Record<string, unknown>);

    // 코드 펜스: fence 노드 오버라이드로 FenceBlock 출력 → Shiki가 기대하는 pre > code.language-x
    if (name === "FenceBlock") {
        const lang = esc(String(attributes.language ?? ""));
        const code = esc(String(attributes.content ?? ""));
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
    }

    const childrenHtml = children.map(renderNode).join("");

    const attrStr = Object.entries(attributes)
        .filter(([, v]) => v !== undefined && v !== null && v !== false)
        .map(([k, v]) =>
            v === true ? esc(k) : `${esc(k)}="${esc(String(v))}"`
        )
        .join(" ");

    const open = `<${name}${attrStr ? " " + attrStr : ""}>`;
    if (VOID_TAGS.has(name)) return open;
    return `${open}${childrenHtml}</${name}>`;
}

// Markdoc 설정: fence 노드 오버라이드 (Shiki가 기대하는 pre > code.language-x 형식으로 출력)
const MARKDOC_CONFIG = {
    nodes: {
        fence: {
            render: "FenceBlock",
            attributes: {
                content: { type: String, required: true },
                language: { type: String },
            },
            transform(node: { attributes: Record<string, unknown> }) {
                const Tag = (Markdoc as { Tag: typeof MarkdocTag }).Tag;
                return new Tag(
                    "FenceBlock",
                    {
                        content: node.attributes.content,
                        language: node.attributes.language,
                    },
                    []
                ) as RenderableTreeNode;
            },
        },
    },
    tags: {
        "folium-table": {
            render: "FoliumTable",
            attributes: {
                columns: { type: String },
                rows: { type: String },
                columnHeadColors: { type: String },
                columnHeadColorsDark: { type: String },
                rowColors: { type: String },
                rowColorsDark: { type: String },
            },
        },
        youtube: {
            render: "YouTube",
            attributes: {
                id: { type: String, required: true },
            },
        },
    },
};

// Shiki 후처리 파이프라인 싱글톤 (코드 블록 강조 + 헤딩 앵커)
const postProcessor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeShiki, {
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
    })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify);

/**
 * Markdoc 문자열을 HTML 문자열로 변환한다.
 * folium-table / youtube 커스텀 태그를 포함한 Markdoc 구문을 지원한다.
 * @param content Markdoc 원문
 * @returns HTML 문자열
 */
export async function renderMarkdown(content: string): Promise<string> {
    // 1. Markdoc 파싱 → 변환 → 커스텀 렌더러로 HTML 생성
    const ast = Markdoc.parse(content);
    const transformed = Markdoc.transform(ast, MARKDOC_CONFIG);
    const rawHtml = renderNode(transformed);

    // 2. Shiki 코드 블록 하이라이팅 + 헤딩 슬러그/앵커 삽입
    const result = await postProcessor.process(rawHtml);
    return String(result);
}
