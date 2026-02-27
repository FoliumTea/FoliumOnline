/**
 * 포트폴리오 목록/블록 뷰 토글 및 렌더링
 * - List: 기존 리스트형 레이아웃
 * - Block: 썸네일 그리드 카드, 각 카드는 상세 페이지 링크
 * - 보기 방식은 localStorage에 저장되어 새로고침·재방문 시 유지됨
 */
import { useState, useEffect } from "react";
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

const STORAGE_KEY = "portfolioViewMode";

function getStoredViewMode(): ViewMode {
    if (typeof window === "undefined") return "list";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "block") return stored;
    return "list";
}

export default function PortfolioView({ projects }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    useEffect(() => {
        setViewMode(getStoredViewMode());
    }, []);

    const handleSetViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, mode);
        }
    };

    return (
        <div className="space-y-6">
            {/* List / Block 토글 */}
            <div className="flex items-center gap-2">
                <span className="mr-2 text-sm font-medium text-(--color-muted)">
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
                        onClick={() => handleSetViewMode("list")}
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
                        onClick={() => handleSetViewMode("block")}
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
                            className="rounded-xl border border-(--color-border) bg-(--color-surface-subtle) p-6"
                        >
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                                <h2 className="tablet:text-2xl text-xl font-bold text-(--color-foreground)">
                                    {project.title}
                                </h2>
                                {project.github ? (
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-(--color-link) hover:underline"
                                    >
                                        GitHub →
                                    </a>
                                ) : null}
                            </div>
                            <p className="tablet:text-lg mb-4 text-base font-normal text-(--color-foreground)">
                                {project.description}
                            </p>
                            <dl className="tablet:grid-cols-2 mb-4 grid grid-cols-1 gap-2 text-sm text-(--color-foreground)">
                                <div>
                                    <dt className="text-xs font-bold tracking-wide text-(--color-muted) uppercase">
                                        기간
                                    </dt>
                                    <dd className="mt-0.5 text-sm font-medium">
                                        {project.startDate} ~ {project.endDate}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold tracking-wide text-(--color-muted) uppercase">
                                        역할
                                    </dt>
                                    <dd className="mt-0.5 text-sm font-medium">
                                        {project.role}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold tracking-wide text-(--color-muted) uppercase">
                                        참여 인원
                                    </dt>
                                    <dd className="mt-0.5 text-sm font-medium">
                                        {project.teamSize}명
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold tracking-wide text-(--color-muted) uppercase">
                                        목표
                                    </dt>
                                    <dd className="mt-0.5 text-sm font-medium">
                                        {project.goal}
                                    </dd>
                                </div>
                            </dl>
                            {project.accomplishments.length > 0 ? (
                                <div className="mb-4">
                                    <h3 className="mb-2 text-sm font-bold text-(--color-foreground)">
                                        성과
                                    </h3>
                                    <ul className="list-inside list-disc space-y-1 text-sm font-normal text-(--color-foreground)">
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
                                            className="rounded-full bg-(--color-tag-bg) px-2 py-1 text-xs text-(--color-tag-fg)"
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
                <div className="tablet:grid-cols-2 grid grid-cols-1 gap-6">
                    {projects.map((project, index) => (
                        <a
                            key={project.slug}
                            href={`/portfolio/${project.slug}`}
                            className="group block overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface-subtle) transition-colors hover:border-(--color-accent)"
                        >
                            {/* 썸네일 */}
                            <div className="aspect-video w-full overflow-hidden bg-(--color-border)">
                                {project.thumbnail ? (
                                    <img
                                        src={project.thumbnail}
                                        alt=""
                                        width={640}
                                        height={360}
                                        loading={index < 2 ? "eager" : "lazy"}
                                        decoding="async"
                                        fetchPriority={
                                            index < 2 ? "high" : undefined
                                        }
                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-(--color-muted)">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                {/* 제목 */}
                                <h2 className="mb-2 flex items-center gap-2 font-semibold text-(--color-foreground)">
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
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {project.keywords.map((k, i) => (
                                            <span
                                                key={i}
                                                className={`rounded px-2 py-0.5 text-xs ${getTagClass(i)}`}
                                            >
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                {/* 설명 */}
                                <p className="line-clamp-2 text-sm text-(--color-muted)">
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
