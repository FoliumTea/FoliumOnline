/**
 * Mermaid 코드 블록 클라이언트 렌더링 (blog/portfolio 공용)
 * renderMarkdown 출력: pre > code.language-mermaid
 */
import { getMermaidConfig } from "./mermaid-themes";

async function loadMermaid() {
    const mod =
        await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
    return mod.default;
}

function getMermaidInitOptions() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const scheme = root.getAttribute("data-color-scheme");
    const { theme, themeVariables } = getMermaidConfig(scheme, isDark);
    return {
        startOnLoad: false,
        theme,
        themeVariables,
    } as { startOnLoad?: boolean; theme?: string };
}

export async function renderMermaidBlocks(
    containerSelector: string,
    logPrefix = "Mermaid"
): Promise<void> {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const blocks = Array.from(
        container.querySelectorAll("pre > code.language-mermaid")
    )
        .map((code) => code.closest("pre"))
        .filter(Boolean);
    if (blocks.length === 0) return;

    const mermaid = await loadMermaid();
    mermaid.initialize(getMermaidInitOptions());

    for (const pre of blocks) {
        const chartDefinition = pre?.textContent?.trim();
        if (!chartDefinition) continue;
        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        const wrap = document.createElement("div");
        wrap.className = "mermaid-rendered my-6 flex justify-center";
        wrap.setAttribute("data-mermaid-id", id);
        wrap.setAttribute("data-mermaid-definition", chartDefinition);
        try {
            const { svg } = await mermaid.render(id, chartDefinition);
            wrap.innerHTML = svg;
        } catch (err) {
            console.warn(`[${logPrefix}] render failed:`, err);
            wrap.innerHTML = `<pre class="text-sm text-(--color-muted) overflow-auto p-4 rounded border border-(--color-border)">${chartDefinition}</pre>`;
        }
        pre?.replaceWith(wrap);
    }
}

export async function rerenderMermaidOnThemeChange(
    logPrefix = "Mermaid"
): Promise<void> {
    const rendered = document.querySelectorAll(
        ".mermaid-rendered[data-mermaid-definition]"
    );
    if (rendered.length === 0) return;

    const mermaid = await loadMermaid();
    mermaid.initialize(getMermaidInitOptions());

    for (const wrap of rendered) {
        const def = wrap.getAttribute("data-mermaid-definition");
        if (!def) continue;
        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        try {
            const { svg } = await mermaid.render(id, def);
            wrap.innerHTML = svg;
        } catch (err) {
            console.warn(`[${logPrefix}] re-render failed:`, err);
        }
    }
}
