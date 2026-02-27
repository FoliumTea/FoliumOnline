/**
 * LoginForm
 *
 * Supabase Auth 이메일/패스워드 로그인 폼.
 * 로그인 성공 시 /admin 으로 리다이렉트한다.
 */
import { useState } from "react";
import { browserClient } from "@/lib/supabase";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /** 폼 제출 — Supabase signInWithPassword 호출 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!browserClient) {
            setError("Supabase 설정이 없습니다. .env.local을 확인하세요.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error: authError } =
            await browserClient.auth.signInWithPassword({ email, password });

        if (authError) {
            setError("이메일 또는 패스워드가 올바르지 않습니다.");
            setLoading(false);
        } else {
            window.location.href = "/admin";
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-(--color-surface) px-4">
            <div className="w-full max-w-sm">
                {/* 헤더 */}
                <div className="mb-8 text-center">
                    <p className="mb-2 text-base font-medium tracking-widest text-(--color-muted) uppercase">
                        FoliumOnline
                    </p>
                    <h1 className="text-3xl font-bold text-(--color-foreground)">
                        어드민 로그인
                    </h1>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-base font-medium text-(--color-muted)"
                        >
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-base text-(--color-foreground) transition-colors focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/40 focus:outline-none"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-base font-medium text-(--color-muted)"
                        >
                            패스워드
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-base text-(--color-foreground) transition-colors focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/40 focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-red-500 dark:bg-red-950/30">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-(--color-accent) py-2.5 text-base font-semibold text-(--color-on-accent) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* 홈으로 돌아가기 */}
                <p className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-base text-(--color-muted) transition-colors hover:text-(--color-foreground)"
                    >
                        ← 사이트로 돌아가기
                    </a>
                </p>
            </div>
        </div>
    );
}
