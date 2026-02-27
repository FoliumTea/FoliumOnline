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

type ColorScheme = "blue" | "gray" | "beige" | "blackwhite";
type JobField = "web" | "game";

const COLOR_OPTIONS: { value: ColorScheme; label: string; desc: string }[] = [
    { value: "blue", label: "Blue", desc: "파란톤 액센트" },
    { value: "gray", label: "Gray", desc: "중립 회색" },
    { value: "beige", label: "Beige", desc: "따뜻한 베이지" },
    { value: "blackwhite", label: "Black & White", desc: "순수 흑백" },
];

export default function SiteConfigPanel() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>("gray");
    const [jobField, setJobField] = useState<JobField>("game");
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
            .in("key", ["color_scheme", "job_field"])
            .then(({ data }) => {
                if (!data) return;
                for (const row of data) {
                    const v =
                        typeof row.value === "string"
                            ? row.value
                            : JSON.parse(row.value as string);
                    if (row.key === "color_scheme")
                        setColorScheme(v as ColorScheme);
                    if (row.key === "job_field") setJobField(v as JobField);
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
                      msg: "설정이 저장됐습니다. 컬러 스킴은 페이지 새로고침 후 반영됩니다.",
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
                    저장 후 페이지를 새로고침하면 즉시 반영됩니다.
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {COLOR_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setColorScheme(opt.value)}
                            className={[
                                "flex flex-col items-start gap-0.5 px-4 py-3 rounded-lg border text-left transition-colors",
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
                                "px-5 py-2.5 rounded-lg border text-base font-medium transition-colors",
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

            {/* 피드백 */}
            {status && (
                <p
                    className={`text-base px-3 py-2 rounded-lg ${status.type === "error" ? "text-red-500 bg-red-50 dark:bg-red-950/30" : "text-green-600 bg-green-50 dark:bg-green-950/30"}`}
                >
                    {status.msg}
                </p>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-base font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    {saving ? "저장 중..." : "설정 저장"}
                </button>

                <button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="px-5 py-2.5 rounded-lg border border-(--color-border) text-base font-semibold text-(--color-foreground) hover:bg-(--color-surface-subtle) disabled:opacity-50 transition-colors"
                >
                    {deploying ? "빌드 트리거 중..." : "🚀 게시 (빌드 트리거)"}
                </button>
            </div>

            <div className="rounded-lg border border-(--color-border) bg-(--color-surface-subtle) p-4 text-sm text-(--color-muted) space-y-1">
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
