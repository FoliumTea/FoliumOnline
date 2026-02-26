/**
 * HTML에서 H2/H3 헤딩을 추출해 TOC(목차) 데이터 생성
 */
export interface TocEntry {
    level: number;
    text: string;
    slug: string;
    children: TocEntry[];
}

/**
 * HTML 문자열에서 h2, h3 추출.
 * rehype-slug + rehype-autolink-headings 출력 형식:
 * <h2 id="slug"><a href="#slug">Text</a></h2>
 */
export function extractTocFromHtml(html: string): TocEntry[] {
    const entries: { level: number; text: string; slug: string }[] = [];
    const regex =
        /<h([23]) id="([^"]+)"[^>]*>(?:<a[^>]*>([^<]*)<\/a>|([^<]*))<\/h\1>/gi;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(html)) !== null) {
        const level = parseInt(m[1], 10);
        const slug = m[2];
        const text = (m[3] || m[4] || "").trim().replace(/&[^;]+;/g, " ");
        if (slug && text) entries.push({ level, text, slug });
    }
    return buildTocTree(entries);
}

function buildTocTree(
    entries: { level: number; text: string; slug: string }[]
): TocEntry[] {
    const root: TocEntry[] = [];
    const stack: TocEntry[] = [];

    for (const e of entries) {
        const node: TocEntry = {
            level: e.level,
            text: e.text,
            slug: e.slug,
            children: [],
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= e.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            root.push(node);
        } else {
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    }
    return root;
}
