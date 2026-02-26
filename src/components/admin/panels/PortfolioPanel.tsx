/**
 * PortfolioPanel
 *
 * 포트폴리오 아이템 목록 조회, 생성, 편집, 삭제,
 * featured 토글 및 발행/초안 전환을 담당한다.
 */
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";

interface PortfolioItem {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    tags: string[];
    thumbnail: string | null;
    content: string;
    data: Record<string, unknown>;
    featured: boolean;
    order_idx: number;
    published: boolean;
}

interface ItemForm {
    slug: string;
    title: string;
    description: string;
    tags: string;
    thumbnail: string;
    content: string;
    featured: boolean;
    order_idx: number;
    published: boolean;
    // data 필드 (구조화된 메타데이터)
    startDate: string;
    endDate: string;
    goal: string;
    role: string;
    teamSize: string;
    github: string;
    liveUrl: string;
    jobField: string;
}

const EMPTY_FORM: ItemForm = {
    slug: "",
    title: "",
    description: "",
    tags: "",
    thumbnail: "",
    content: "",
    featured: false,
    order_idx: 0,
    published: true,
    startDate: "",
    endDate: "",
    goal: "",
    role: "",
    teamSize: "",
    github: "",
    liveUrl: "",
    jobField: "web",
};

function toSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

/** PortfolioItem의 data JSONB에서 폼 필드를 추출한다 */
function itemToForm(item: PortfolioItem): ItemForm {
    const d = item.data ?? {};
    return {
        slug: item.slug,
        title: item.title,
        description: item.description ?? "",
        tags: item.tags.join(", "),
        thumbnail: item.thumbnail ?? "",
        content: item.content,
        featured: item.featured,
        order_idx: item.order_idx,
        published: item.published,
        startDate: (d.startDate as string) ?? "",
        endDate: (d.endDate as string) ?? "",
        goal: (d.goal as string) ?? "",
        role: (d.role as string) ?? "",
        teamSize: String(d.teamSize ?? ""),
        github: (d.github as string) ?? "",
        liveUrl: (d.liveUrl as string) ?? "",
        jobField: (d.jobField as string) ?? "web",
    };
}

export default function PortfolioPanel() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState<PortfolioItem | null | "new">(
        null
    );
    const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadItems = async () => {
        if (!browserClient) return;
        setLoading(true);
        const { data, error: err } = await browserClient
            .from("portfolio_items")
            .select("*")
            .order("order_idx");
        if (err) setError(err.message);
        else setItems(data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const openEdit = (item: PortfolioItem) => {
        setForm(itemToForm(item));
        setEditTarget(item);
        setError(null);
        setSuccess(null);
    };

    const openNew = () => {
        setForm({ ...EMPTY_FORM, order_idx: items.length });
        setEditTarget("new");
        setError(null);
        setSuccess(null);
    };

    const handleSave = async () => {
        if (!browserClient || !form.title || !form.slug) {
            setError("제목과 slug는 필수입니다.");
            return;
        }
        setSaving(true);
        setError(null);

        const payload = {
            slug: form.slug,
            title: form.title,
            description: form.description || null,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            thumbnail: form.thumbnail || null,
            content: form.content,
            featured: form.featured,
            order_idx: form.order_idx,
            published: form.published,
            data: {
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
                goal: form.goal || undefined,
                role: form.role || undefined,
                teamSize: form.teamSize ? Number(form.teamSize) : undefined,
                github: form.github || undefined,
                liveUrl: form.liveUrl || undefined,
                jobField: form.jobField || "web",
            },
        };

        let err;
        if (editTarget === "new") {
            ({ error: err } = await browserClient
                .from("portfolio_items")
                .insert(payload));
        } else {
            ({ error: err } = await browserClient
                .from("portfolio_items")
                .update(payload)
                .eq("id", (editTarget as PortfolioItem).id));
        }

        setSaving(false);
        if (err) {
            setError(err.message);
        } else {
            setSuccess("저장됐습니다.");
            loadItems();
            if (editTarget === "new") setEditTarget(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!browserClient || !confirm("정말 삭제하시겠습니까?")) return;
        await browserClient.from("portfolio_items").delete().eq("id", id);
        loadItems();
    };

    const toggleFeatured = async (item: PortfolioItem) => {
        if (!browserClient) return;
        await browserClient
            .from("portfolio_items")
            .update({ featured: !item.featured })
            .eq("id", item.id);
        loadItems();
    };

    // ── 편집 화면 ─────────────────────────────────────────────
    if (editTarget !== null) {
        const field = (
            key: keyof ItemForm,
            label: string,
            opts?: {
                mono?: boolean;
                type?: string;
                rows?: number;
                placeholder?: string;
            }
        ) => (
            <div>
                <label className="block text-sm font-medium text-(--color-muted) mb-1">
                    {label}
                </label>
                {opts?.rows ? (
                    <textarea
                        value={form[key] as string}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        rows={opts.rows}
                        placeholder={opts.placeholder}
                        className={`w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 resize-y ${opts.mono ? "font-mono" : ""}`}
                    />
                ) : (
                    <input
                        type={opts?.type ?? "text"}
                        value={form[key] as string}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        placeholder={opts?.placeholder}
                        className={`w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 ${opts?.mono ? "font-mono" : ""}`}
                    />
                )}
            </div>
        );

        return (
            <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setEditTarget(null)}
                        className="text-sm text-(--color-muted) hover:text-(--color-foreground)"
                    >
                        ← 목록
                    </button>
                    <h2 className="text-xl font-bold text-(--color-foreground)">
                        {editTarget === "new"
                            ? "새 포트폴리오"
                            : "포트폴리오 편집"}
                    </h2>
                </div>

                <div className="space-y-4">
                    {field("title", "제목 *")}
                    <div className="grid grid-cols-2 gap-4">
                        {field("slug", "Slug *", { mono: true })}
                        {field("jobField", "직무 분야 (web / game)")}
                    </div>
                    {field("description", "요약", { rows: 2 })}
                    {field("tags", "키워드/태그 (쉼표 구분)", {
                        placeholder: "Next.js, React, TypeScript",
                    })}
                    {field("thumbnail", "썸네일 URL", {
                        mono: true,
                        placeholder: "/images/portfolio/...",
                    })}

                    <div className="grid grid-cols-2 gap-4">
                        {field("startDate", "시작일", {
                            placeholder: "2024-01-01",
                        })}
                        {field("endDate", "종료일", {
                            placeholder: "2024-06-01 (진행 중이면 비워두세요)",
                        })}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {field("role", "역할", {
                            placeholder: "풀스택 개발 (리드)",
                        })}
                        {field("teamSize", "팀 규모", {
                            type: "number",
                            placeholder: "1",
                        })}
                    </div>
                    {field("goal", "목표/기획 의도", { rows: 2 })}
                    <div className="grid grid-cols-2 gap-4">
                        {field("github", "GitHub URL", { mono: true })}
                        {field("liveUrl", "라이브 URL", { mono: true })}
                    </div>
                    {field("content", "본문 (Markdown)", {
                        rows: 16,
                        mono: true,
                    })}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        featured: e.target.checked,
                                    }))
                                }
                                className="w-4 h-4 accent-(--color-accent)"
                            />
                            <span className="text-sm font-medium text-(--color-foreground)">
                                랜딩 페이지에 노출 (featured)
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.published}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        published: e.target.checked,
                                    }))
                                }
                                className="w-4 h-4 accent-(--color-accent)"
                            />
                            <span className="text-sm font-medium text-(--color-foreground)">
                                발행
                            </span>
                        </label>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
                            {success}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                            {saving ? "저장 중..." : "저장"}
                        </button>
                        <button
                            onClick={() => setEditTarget(null)}
                            className="px-5 py-2 rounded-lg border border-(--color-border) text-sm font-medium text-(--color-muted) hover:text-(--color-foreground)"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── 목록 화면 ─────────────────────────────────────────────
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-(--color-foreground)">
                    포트폴리오
                </h2>
                <button
                    onClick={openNew}
                    className="px-4 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-sm font-semibold hover:opacity-90"
                >
                    + 새 항목
                </button>
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            {loading ? (
                <p className="text-sm text-(--color-muted)">불러오는 중...</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent)/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    {item.featured && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-medium">
                                            ★ featured
                                        </span>
                                    )}
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.published ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"}`}
                                    >
                                        {item.published ? "발행" : "초안"}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-(--color-foreground) truncate">
                                    {item.title}
                                </p>
                                <p className="text-xs text-(--color-muted) font-mono">
                                    {item.slug}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => toggleFeatured(item)}
                                    className="text-xs px-2 py-1 rounded border border-(--color-border) text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                                >
                                    {item.featured
                                        ? "featured 해제"
                                        : "featured"}
                                </button>
                                <button
                                    onClick={() => openEdit(item)}
                                    className="text-xs px-2 py-1 rounded border border-(--color-border) text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                                >
                                    편집
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:text-red-600 hover:border-red-400 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
