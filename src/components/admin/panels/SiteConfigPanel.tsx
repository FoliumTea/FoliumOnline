/**
 * SiteConfigPanel
 *
 * site_config 테이블을 통해 컬러 스킴, 직무 분야 등을 관리한다.
 * "게시 (빌드 트리거)" 버튼을 통해 Vercel Deploy Hook을 호출한다.
 *
 * 컬러 스킴 저장 → 즉시 반영 (브라우저가 Supabase에서 값을 읽으므로)
 * 블로그/포트폴리오 게시 → 빌드 트리거 → 약 30~60초 후 정적 HTML 갱신
 */
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";

type ColorScheme =
    | "blue"
    | "gray"
    | "beige"
    | "blackwhite"
    | "forest"
    | "sunset"
    | "lavender";
type JobField = "web" | "game";

const COLOR_OPTIONS: { value: ColorScheme; label: string; desc: string }[] = [
    { value: "gray", label: "Gray", desc: "중립 회색" },
    { value: "blue", label: "Blue", desc: "파란톤 액센트" },
    { value: "beige", label: "Beige", desc: "따뜻한 베이지" },
    { value: "forest", label: "Forest", desc: "깊은 숲의 그린" },
    { value: "sunset", label: "Sunset", desc: "따뜻한 석양 (오렌지)" },
    { value: "lavender", label: "Lavender", desc: "차분한 보라" },
    { value: "blackwhite", label: "Black & White", desc: "순수 흑백" },
];

export default function SiteConfigPanel() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>("gray");
    const [jobField, setJobField] = useState<JobField>("game");
    const [seoConfig, setSeoConfig] = useState({
        defaultTitle: "FoliumOnline",
        defaultDescription: "포트폴리오 & 기술 블로그",
        defaultOgImage: "",
    });
    const [saving, setSaving] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [status, setStatus] = useState<{
        type: "error" | "success";
        msg: string;
    } | null>(null);

    // Supabase에서 현재 설정 로드
    useEffect(() => {
        if (!browserClient) return;
        browserClient
            .from("site_config")
            .select("key, value")
            .in("key", ["color_scheme", "job_field", "seo_config"])
            .then(({ data }) => {
                if (!data) return;
                for (const row of data) {
                    const v =
                        typeof row.value === "string"
                            ? JSON.parse(row.value)
                            : row.value;
                    if (row.key === "color_scheme") {
                        setColorScheme(v as ColorScheme);
                        // Apply immediately on load in the admin panel if it differs
                        document.documentElement.setAttribute(
                            "data-color-scheme",
                            v as ColorScheme
                        );
                    }
                    if (row.key === "job_field") setJobField(v as JobField);
                    if (row.key === "seo_config") {
                        setSeoConfig({
                            defaultTitle: v.default_title || "FoliumOnline",
                            defaultDescription:
                                v.default_description ||
                                "포트폴리오 & 기술 블로그",
                            defaultOgImage: v.default_og_image || "",
                        });
                    }
                }
            });
    }, []);

    /** site_config upsert */
    const handleSave = async () => {
        if (!browserClient) return;
        setSaving(true);
        setStatus(null);

        const rows = [
            { key: "color_scheme", value: JSON.stringify(colorScheme) },
            { key: "job_field", value: JSON.stringify(jobField) },
            {
                key: "seo_config",
                value: {
                    default_title: seoConfig.defaultTitle,
                    default_description: seoConfig.defaultDescription,
                    default_og_image: seoConfig.defaultOgImage,
                },
            },
        ];

        const { error } = await browserClient
            .from("site_config")
            .upsert(rows, { onConflict: "key" });

        setSaving(false);
        setStatus(
            error
                ? { type: "error", msg: error.message }
                : {
                      type: "success",
                      msg: "설정이 저장됐습니다. 변경 사항이 사이트에 반영되었습니다.",
                  }
        );
    };

    /** Vercel Deploy Hook 호출 → 정적 빌드 재트리거 */
    const handleDeploy = async () => {
        const hookUrl = import.meta.env.PUBLIC_VERCEL_DEPLOY_HOOK_URL as
            | string
            | undefined;
        if (!hookUrl) {
            setStatus({
                type: "error",
                msg: "VERCEL_DEPLOY_HOOK_URL이 설정되지 않았습니다. .env.local을 확인하세요.",
            });
            return;
        }
        setDeploying(true);
        setStatus(null);
        try {
            const res = await fetch(hookUrl, { method: "POST" });
            if (res.ok) {
                setStatus({
                    type: "success",
                    msg: "빌드가 트리거됐습니다. 약 30~60초 후 최신 콘텐츠가 배포됩니다.",
                });
            } else {
                setStatus({
                    type: "error",
                    msg: `빌드 트리거 실패: HTTP ${res.status}`,
                });
            }
        } catch (e: unknown) {
            setStatus({
                type: "error",
                msg: `네트워크 오류: ${(e as Error).message}`,
            });
        }
        setDeploying(false);
    };

    return (
        <div className="max-w-lg space-y-8">
            <h2 className="text-2xl font-bold text-(--color-foreground)">
                사이트 설정
            </h2>

            {/* 컬러 스킴 */}
            <section className="space-y-3">
                <h3 className="text-lg font-semibold text-(--color-foreground)">
                    컬러 스킴
                </h3>
                <p className="text-sm text-(--color-muted)">
                    새로운 테마를 선택하면 대시보드 화면에 즉시 반영되며, '설정
                    저장' 버튼을 누르면 다른 사용자들에게도 배포됩니다.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {COLOR_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setColorScheme(opt.value);
                                document.documentElement.setAttribute(
                                    "data-color-scheme",
                                    opt.value
                                );
                            }}
                            className={[
                                "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors",
                                colorScheme === opt.value
                                    ? "border-(--color-accent) bg-(--color-accent)/5"
                                    : "border-(--color-border) hover:border-(--color-accent)/50",
                            ].join(" ")}
                        >
                            <span className="text-base font-semibold text-(--color-foreground)">
                                {opt.label}
                            </span>
                            <span className="text-sm text-(--color-muted)">
                                {opt.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* 직무 분야 */}
            <section className="space-y-3">
                <h3 className="text-lg font-semibold text-(--color-foreground)">
                    이력서 직무 분야
                </h3>
                <p className="text-sm text-(--color-muted)">
                    Resume / Portfolio 페이지에서 이 값으로 항목을 필터링합니다.
                </p>
                <div className="flex gap-2">
                    {(["web", "game"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setJobField(f)}
                            className={[
                                "rounded-lg border px-5 py-2.5 text-base font-medium transition-colors",
                                jobField === f
                                    ? "border-(--color-accent) bg-(--color-accent)/5 text-(--color-accent)"
                                    : "border-(--color-border) text-(--color-muted) hover:border-(--color-accent)/50",
                            ].join(" ")}
                        >
                            {f === "web" ? "🌐 Web" : "🎮 Game"}
                        </button>
                    ))}
                </div>
            </section>

            {/* 글로벌 SEO 설정 */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-(--color-foreground)">
                    글로벌 SEO 기본값
                </h3>
                <p className="text-sm text-(--color-muted)">
                    개별 포스트나 포트폴리오에 SEO 설정이 없을 때 사용되는
                    기본값입니다.
                </p>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-(--color-muted)">
                            기본 사이트 제목 (Title)
                        </label>
                        <input
                            type="text"
                            value={seoConfig.defaultTitle}
                            onChange={(e) =>
                                setSeoConfig({
                                    ...seoConfig,
                                    defaultTitle: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 text-(--color-foreground) transition-colors focus:border-(--color-accent) focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-(--color-muted)">
                            기본 사이트 설명 (Description)
                        </label>
                        <textarea
                            value={seoConfig.defaultDescription}
                            onChange={(e) =>
                                setSeoConfig({
                                    ...seoConfig,
                                    defaultDescription: e.target.value,
                                })
                            }
                            rows={3}
                            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 text-(--color-foreground) transition-colors focus:border-(--color-accent) focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-(--color-muted)">
                            기본 OG 이미지 URL
                        </label>
                        <input
                            type="text"
                            value={seoConfig.defaultOgImage}
                            onChange={(e) =>
                                setSeoConfig({
                                    ...seoConfig,
                                    defaultOgImage: e.target.value,
                                })
                            }
                            placeholder="https://..."
                            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 text-(--color-foreground) transition-colors focus:border-(--color-accent) focus:outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* 피드백 */}
            {status && (
                <p
                    className={`rounded-lg px-3 py-2 text-base ${status.type === "error" ? "bg-red-50 text-red-500 dark:bg-red-950/30" : "bg-green-50 text-green-600 dark:bg-green-950/30"}`}
                >
                    {status.msg}
                </p>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-(--color-accent) px-5 py-2.5 text-base font-semibold text-(--color-on-accent) transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? "저장 중..." : "설정 저장"}
                </button>

                <button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="rounded-lg border border-(--color-border) px-5 py-2.5 text-base font-semibold text-(--color-foreground) transition-colors hover:bg-(--color-surface-subtle) disabled:opacity-50"
                >
                    {deploying ? "빌드 트리거 중..." : "🚀 게시 (빌드 트리거)"}
                </button>
            </div>

            <div className="space-y-1 rounded-lg border border-(--color-border) bg-(--color-surface-subtle) p-4 text-sm text-(--color-muted)">
                <p className="font-semibold text-(--color-foreground)">
                    빌드 트리거 동작 방식
                </p>
                <p>버튼을 누르면 Vercel이 새 빌드를 시작합니다.</p>
                <p>
                    블로그/포트폴리오에 추가·수정한 내용이 약 30~60초 후
                    반영됩니다.
                </p>
                <p>About·테마 변경은 빌드 없이도 즉시 반영됩니다.</p>
            </div>
        </div>
    );
}
