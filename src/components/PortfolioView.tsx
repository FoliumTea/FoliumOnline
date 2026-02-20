/**
 * 포트폴리오 목록/블록 뷰 토글 및 렌더링
 * - List: 기존 리스트형 레이아웃
 * - Block: 썸네일 그리드 카드, 각 카드는 상세 페이지 링크
 */
import { useState } from "react";
import type { PortfolioProject } from "@/types/portfolio";

type ViewMode = "list" | "block";

interface Props {
    projects: PortfolioProject[];
}

/** 블록 뷰용 태그 색상 (키워드별 대응 또는 순환) */
const TAG_COLORS = [
    "bg-emerald-600/90 text-white",
    "bg-violet-600/90 text-white",
    "bg-amber-800/90 text-white",
    "bg-stone-500/90 text-white",
    "bg-amber-600/90 text-white",
    "bg-rose-800/90 text-white",
];

function getTagClass(index: number) {
    return TAG_COLORS[index % TAG_COLORS.length];
}

export default function PortfolioView({ projects }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    return (
        <div className="space-y-6">
            {/* List / Block 토글 */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-(--color-muted) mr-2">
                    보기:
                </span>
                <div
                    className="inline-flex rounded-lg border border-(--color-border) bg-(--color-surface-subtle) p-0.5"
                    role="tablist"
                    aria-label="포트폴리오 보기 방식"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === "list"}
                        onClick={() => setViewMode("list")}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            viewMode === "list"
                                ? "bg-(--color-surface) text-(--color-foreground) shadow-sm"
                                : "text-(--color-muted) hover:text-(--color-foreground)"
                        }`}
                    >
                        List
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === "block"}
                        onClick={() => setViewMode("block")}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            viewMode === "block"
                                ? "bg-(--color-surface) text-(--color-foreground) shadow-sm"
                                : "text-(--color-muted) hover:text-(--color-foreground)"
                        }`}
                    >
                        Block
                    </button>
                </div>
            </div>

            {viewMode === "list" ? (
                <div className="space-y-8">
                    {projects.map((project) => (
                        <article
                            key={project.slug}
                            className="p-6 rounded-xl border border-(--color-border) bg-(--color-surface-subtle)"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <h2 className="text-2xl font-bold text-(--color-foreground)">
                                    {project.title}
                                </h2>
                                {project.github ? (
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-(--color-link) hover:underline text-sm"
                                    >
                                        GitHub →
                                    </a>
                                ) : null}
                            </div>
                            <p className="text-(--color-muted) mb-4">
                                {project.description}
                            </p>
                            <dl className="grid grid-cols-1 gap-2 text-sm mb-4 text-(--color-foreground) tablet:grid-cols-2">
                                <div>
                                    <dt className="text-(--color-muted) font-medium">
                                        기간
                                    </dt>
                                    <dd>
                                        {project.startDate} ~ {project.endDate}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-(--color-muted) font-medium">
                                        역할
                                    </dt>
                                    <dd>{project.role}</dd>
                                </div>
                                <div>
                                    <dt className="text-(--color-muted) font-medium">
                                        참여 인원
                                    </dt>
                                    <dd>{project.teamSize}명</dd>
                                </div>
                                <div>
                                    <dt className="text-(--color-muted) font-medium">
                                        목표
                                    </dt>
                                    <dd>{project.goal}</dd>
                                </div>
                            </dl>
                            {project.accomplishments.length > 0 ? (
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-(--color-foreground) mb-2">
                                        성과
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-(--color-foreground)">
                                        {project.accomplishments.map((a, i) => (
                                            <li key={i}>{a}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {project.keywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {project.keywords.map((k, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs rounded-full bg-(--color-tag-bg) text-(--color-tag-fg)"
                                        >
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </article>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
                    {projects.map((project) => (
                        <a
                            key={project.slug}
                            href={`/portfolio/${project.slug}`}
                            className="group block rounded-xl border border-(--color-border) bg-(--color-surface-subtle) overflow-hidden hover:border-(--color-accent) transition-colors"
                        >
                            {/* 썸네일 */}
                            <div className="aspect-video w-full bg-(--color-border) overflow-hidden">
                                {project.thumbnail ? (
                                    <img
                                        src={project.thumbnail}
                                        alt=""
                                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-(--color-muted) text-sm">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                {/* 제목 */}
                                <h2 className="font-semibold text-(--color-foreground) mb-2 flex items-center gap-2">
                                    <span
                                        className="text-(--color-muted)"
                                        aria-hidden
                                    >
                                        📄
                                    </span>
                                    {project.title}
                                </h2>
                                {/* 태그 */}
                                {project.keywords.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {project.keywords.map((k, i) => (
                                            <span
                                                key={i}
                                                className={`px-2 py-0.5 text-xs rounded ${getTagClass(i)}`}
                                            >
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                {/* 설명 */}
                                <p className="text-sm text-(--color-muted) line-clamp-2">
                                    {project.description}
                                </p>
                                {/* 배지 (STOVE 출시, BIC 선정 등) */}
                                {project.badges?.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--color-foreground)">
                                        {project.badges.map((b, i) => (
                                            <span
                                                key={i}
                                                className="flex items-center gap-1"
                                            >
                                                <span
                                                    className="text-(--color-muted)"
                                                    aria-hidden
                                                >
                                                    ◆
                                                </span>
                                                {b.text}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
