/**
 * PostsPanel
 *
 * 블로그 포스트 목록 조회, 생성, 편집, 삭제, 발행/초안 전환을 담당한다.
 * - 목록 화면과 편집 화면을 같은 패널 내에서 전환한다.
 * - 마크다운 편집은 기본 textarea 사용 (미리보기는 우측 컬럼).
 */
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";

// 포스트 행 타입 (Supabase posts 테이블)
interface Post {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    pub_date: string;
    category: string | null;
    tags: string[];
    thumbnail: string | null;
    content: string;
    published: boolean;
    updated_at: string;
}

// 편집 폼 상태 (신규/수정 공통)
interface PostForm {
    slug: string;
    title: string;
    description: string;
    pub_date: string;
    category: string;
    tags: string; // 쉼표 구분 문자열로 입력받아 저장 시 배열로 변환
    thumbnail: string;
    content: string;
    published: boolean;
}

const EMPTY_FORM: PostForm = {
    slug: "",
    title: "",
    description: "",
    pub_date: new Date().toISOString().slice(0, 16),
    category: "",
    tags: "",
    thumbnail: "",
    content: "",
    published: false,
};

/** slug 자동 생성: 제목에서 공백→하이픈, 영소문자/숫자/하이픈만 허용 */
function toSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

export default function PostsPanel() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState<Post | null | "new">(null);
    const [form, setForm] = useState<PostForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 포스트 목록 로드 (인증된 어드민이므로 draft 포함 전체 조회)
    const loadPosts = async () => {
        if (!browserClient) return;
        setLoading(true);
        const { data, error: err } = await browserClient
            .from("posts")
            .select(
                "id, slug, title, description, pub_date, category, tags, thumbnail, content, published, updated_at"
            )
            .order("pub_date", { ascending: false });
        if (err) setError(err.message);
        else setPosts(data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    // 편집 화면 열기
    const openEdit = (post: Post) => {
        setForm({
            slug: post.slug,
            title: post.title,
            description: post.description ?? "",
            pub_date: post.pub_date.slice(0, 16),
            category: post.category ?? "",
            tags: post.tags.join(", "),
            thumbnail: post.thumbnail ?? "",
            content: post.content,
            published: post.published,
        });
        setEditTarget(post);
        setError(null);
        setSuccess(null);
    };

    // 신규 생성 화면 열기
    const openNew = () => {
        setForm(EMPTY_FORM);
        setEditTarget("new");
        setError(null);
        setSuccess(null);
    };

    // 저장 (신규 insert / 수정 update)
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
            pub_date: new Date(form.pub_date).toISOString(),
            category: form.category || null,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            thumbnail: form.thumbnail || null,
            content: form.content,
            published: form.published,
        };

        let err;
        if (editTarget === "new") {
            ({ error: err } = await browserClient
                .from("posts")
                .insert(payload));
        } else {
            ({ error: err } = await browserClient
                .from("posts")
                .update(payload)
                .eq("id", (editTarget as Post).id));
        }

        setSaving(false);
        if (err) {
            setError(err.message);
        } else {
            setSuccess("저장됐습니다.");
            loadPosts();
            // 새 글이면 목록으로 돌아감, 수정이면 유지
            if (editTarget === "new") setEditTarget(null);
        }
    };

    // 삭제
    const handleDelete = async (id: string) => {
        if (!browserClient || !confirm("정말 삭제하시겠습니까?")) return;
        const { error: err } = await browserClient
            .from("posts")
            .delete()
            .eq("id", id);
        if (err) setError(err.message);
        else loadPosts();
    };

    // 발행/초안 토글
    const togglePublish = async (post: Post) => {
        if (!browserClient) return;
        await browserClient
            .from("posts")
            .update({ published: !post.published })
            .eq("id", post.id);
        loadPosts();
    };

    // ── 편집 화면 ────────────────────────────────────────────
    if (editTarget !== null) {
        return (
            <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setEditTarget(null)}
                        className="text-sm text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                    >
                        ← 목록
                    </button>
                    <h2 className="text-xl font-bold text-(--color-foreground)">
                        {editTarget === "new" ? "새 포스트" : "포스트 편집"}
                    </h2>
                </div>

                <div className="space-y-4">
                    {/* 제목 */}
                    <div>
                        <label className="block text-sm font-medium text-(--color-muted) mb-1">
                            제목 *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => {
                                const t = e.target.value;
                                setForm((f) => ({
                                    ...f,
                                    title: t,
                                    slug: f.slug || toSlug(t),
                                }));
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                        />
                    </div>

                    {/* slug + 발행일 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                Slug *
                            </label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        slug: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                발행일
                            </label>
                            <input
                                type="datetime-local"
                                value={form.pub_date}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        pub_date: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                            />
                        </div>
                    </div>

                    {/* 카테고리 + 태그 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                카테고리
                            </label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        category: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-(--color-muted) mb-1">
                                태그{" "}
                                <span className="text-xs text-(--color-muted)">
                                    (쉼표 구분)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        tags: e.target.value,
                                    }))
                                }
                                placeholder="tag1, tag2, tag3"
                                className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                            />
                        </div>
                    </div>

                    {/* 요약 */}
                    <div>
                        <label className="block text-sm font-medium text-(--color-muted) mb-1">
                            요약
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 resize-y"
                        />
                    </div>

                    {/* 썸네일 URL */}
                    <div>
                        <label className="block text-sm font-medium text-(--color-muted) mb-1">
                            썸네일 URL
                        </label>
                        <input
                            type="text"
                            value={form.thumbnail}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    thumbnail: e.target.value,
                                }))
                            }
                            placeholder="/images/posts/..."
                            className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                        />
                    </div>

                    {/* 본문 마크다운 */}
                    <div>
                        <label className="block text-sm font-medium text-(--color-muted) mb-1">
                            본문 (Markdown)
                        </label>
                        <textarea
                            value={form.content}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    content: e.target.value,
                                }))
                            }
                            rows={20}
                            className="w-full px-3 py-2 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-sm font-mono focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 resize-y"
                        />
                    </div>

                    {/* 발행 여부 */}
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
                            즉시 발행
                        </span>
                        <span className="text-xs text-(--color-muted)">
                            (체크 해제 시 초안으로 저장)
                        </span>
                    </label>

                    {/* 피드백 */}
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

                    {/* 저장 버튼 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving ? "저장 중..." : "저장"}
                        </button>
                        <button
                            onClick={() => setEditTarget(null)}
                            className="px-5 py-2 rounded-lg border border-(--color-border) text-sm font-medium text-(--color-muted) hover:text-(--color-foreground) transition-colors"
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
                    블로그 포스트
                </h2>
                <button
                    onClick={openNew}
                    className="px-4 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    + 새 포스트
                </button>
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            {loading ? (
                <p className="text-sm text-(--color-muted)">불러오는 중...</p>
            ) : posts.length === 0 ? (
                <p className="text-sm text-(--color-muted)">
                    포스트가 없습니다.
                </p>
            ) : (
                <div className="space-y-2">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent)/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span
                                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                                            post.published
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                                        }`}
                                    >
                                        {post.published ? "발행" : "초안"}
                                    </span>
                                    {post.category && (
                                        <span className="text-xs text-(--color-muted)">
                                            {post.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-(--color-foreground) truncate">
                                    {post.title}
                                </p>
                                <p className="text-xs text-(--color-muted) font-mono">
                                    {post.slug} ·{" "}
                                    {new Date(post.pub_date).toLocaleDateString(
                                        "ko-KR"
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => togglePublish(post)}
                                    className="text-xs px-2 py-1 rounded border border-(--color-border) text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                                >
                                    {post.published ? "초안으로" : "발행"}
                                </button>
                                <button
                                    onClick={() => openEdit(post)}
                                    className="text-xs px-2 py-1 rounded border border-(--color-border) text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                                >
                                    편집
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
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
