/**
 * Markdoc ↔ MDX directive 양방향 변환
 *
 * Supabase에는 Markdoc 형식 저장, MDXEditor에는 remark-directive 형식 사용.
 * - Markdoc: {% youtube id="x" /%}, {% folium-table columns="..." rows="..." /%}
 * - MDX: ::youtube[]{id="x"}, ::folium-table[]{columns="..." rows="..."}
 */

/** Markdoc → MDX (에디터 로드 시) */
export function markdocToMdx(content: string): string {
    let out = content;

    // {% youtube id="xxx" /%} → ::youtube[]{id="xxx"}
    out = out.replace(
        /\{%\s*youtube\s+id\s*=\s*"([^"]*)"\s*\/%\}/g,
        (_, id) => `::youtube[]{id="${id}"}`
    );

    // {% folium-table ... /%} → ::folium-table[]{columns="..." rows="..."}
    out = out.replace(
        /\{%\s*folium-table\s+([\s\S]*?)\s*\/%\}/g,
        (_, attrs) => {
            const pairs = attrs.match(/(\w+)\s*=\s*("(?:[^"\\]|\\.)*")/g) || [];
            const collapsed = pairs
                .map((p: string) => p.replace(/\s*=\s*/, "=").trim())
                .join(" ");
            return `::folium-table[]{${collapsed}}`;
        }
    );

    return out;
}

/** MDX → Markdoc (저장 시) */
export function mdxToMarkdoc(content: string): string {
    let out = content;

    // ::youtube[]{id="xxx"} → {% youtube id="xxx" /%}
    out = out.replace(
        /::youtube\[\]\{id="([^"]*)"\}/g,
        (_, id) => `{% youtube id="${id}" /%}`
    );

    // ::youtube[]{id=xxx} (unquoted id)
    out = out.replace(
        /::youtube\[\]\{id=([^\s"}]+)\}/g,
        (_, id) => `{% youtube id="${id}" /%}`
    );

    // ::folium-table[]{attr="val" ...} → {% folium-table attr="val" ... /%}
    out = out.replace(/::folium-table\[\]\{([^}]*)\}/g, (_, attrs) => {
        const parts: string[] = [];
        const regex = /(\w+)=("(?:[^"\\]|\\.)*"|[^\s}]+)/g;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(attrs)) !== null) {
            const val = m[2].startsWith('"') ? m[2] : `"${m[2]}"`;
            parts.push(`   ${m[1]}=${val}`);
        }
        return `{% folium-table\n${parts.join("\n")}\n/%}`;
    });

    return out;
}
