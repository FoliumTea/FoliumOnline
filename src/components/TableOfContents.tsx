/**
 * TableOfContents
 *
 * 블로그/포트폴리오 상세 페이지용 목차.
 * 데스크톱에서만 오른쪽 고정, IntersectionObserver로 현재 섹션 하이라이트.
 */
import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/toc";

interface TableOfContentsProps {
    entries: TocEntry[];
    contentSelector?: string;
    className?: string;
}

// TOC 항목에서 문서 순서대로 slug id 목록 추출
function getHeadingIds(
    entries: { slug: string; children: { slug: string }[] }[]
): string[] {
    const ids: string[] = [];
    for (const e of entries) {
        ids.push(e.slug);
        for (const c of e.children) ids.push(c.slug);
    }
    return ids;
}

export default function TableOfContents({
    entries,
    contentSelector = ".post-content",
    className = "",
}: TableOfContentsProps) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        const itemIds = getHeadingIds(entries);
        if (itemIds.length === 0) return;

        // krrpinfo 방식: 헤딩 요소만 직접 관찰, 뷰포트 상단 20%를 활성 영역으로 사용
        // rootMargin: 상단 64px(헤더) 제외, 하단 80% 제외 → 상단 20% 영역에서 교차하는 헤딩이 활성
        const observer = new IntersectionObserver(
            (obsEntries) => {
                const intersecting = obsEntries
                    .filter((e) => e.isIntersecting)
                    .map((e) => ({
                        id: (e.target as HTMLElement).id,
                        top: e.boundingClientRect.top,
                    }))
                    .filter((x) => x.id);
                if (intersecting.length === 0) return;
                // 뷰포트 상단에 가장 가까운(먼저 보이는) 헤딩을 활성으로
                const active = intersecting.reduce((a, b) =>
                    a.top <= b.top ? a : b
                );
                setActiveSection(`#${active.id}`);
            },
            { rootMargin: "-64px 0% -80% 0%", threshold: 0 }
        );

        for (const id of itemIds) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }
        return () => observer.disconnect();
    }, [entries]);

    if (entries.length === 0) return null;

    return (
        <nav
            className={`desktop:block sticky top-24 hidden max-h-[calc(100vh-8rem)] shrink-0 self-start overflow-y-auto overscroll-contain ${className} tablet:w-52 desktop:w-64`}
            aria-label="목차"
        >
            <h2 className="mb-3 text-xs font-semibold tracking-wider text-(--color-muted) uppercase">
                On this page
            </h2>
            <ul className="space-y-1 text-sm">
                {entries.map((entry, i) => (
                    <li key={i}>
                        <a
                            href={`#${entry.slug}`}
                            className={`block py-1 text-base text-(--color-muted) transition-all duration-200 hover:text-(--color-foreground) ${
                                activeSection === `#${entry.slug}`
                                    ? "text-lg font-bold"
                                    : ""
                            }`}
                            style={
                                activeSection === `#${entry.slug}`
                                    ? { color: "var(--color-accent)" }
                                    : undefined
                            }
                            aria-current={
                                activeSection === `#${entry.slug}`
                                    ? "location"
                                    : undefined
                            }
                        >
                            {entry.text}
                        </a>
                        {entry.children.length > 0 && (
                            <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-(--color-border)">
                                {entry.children.map((child, j) => (
                                    <li key={j}>
                                        <a
                                            href={`#${child.slug}`}
                                            className={`-ml-px block border-l-2 border-transparent py-0.5 pl-2 text-base text-(--color-muted) transition-all duration-200 hover:border-(--color-accent) hover:text-(--color-foreground) ${
                                                activeSection ===
                                                `#${child.slug}`
                                                    ? "border-(--color-accent) text-lg font-bold"
                                                    : ""
                                            }`}
                                            style={
                                                activeSection ===
                                                `#${child.slug}`
                                                    ? {
                                                          color: "var(--color-accent)",
                                                      }
                                                    : undefined
                                            }
                                            aria-current={
                                                activeSection ===
                                                `#${child.slug}`
                                                    ? "location"
                                                    : undefined
                                            }
                                        >
                                            {child.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
