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
        <div className="min-h-screen flex items-center justify-center bg-(--color-surface) px-4">
            <div className="w-full max-w-sm">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <p className="text-base font-medium text-(--color-muted) uppercase tracking-widest mb-2">
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
                            className="block text-base font-medium text-(--color-muted) mb-1.5"
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
                            className="w-full px-3 py-2.5 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-base focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 focus:border-(--color-accent) transition-colors"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-base font-medium text-(--color-muted) mb-1.5"
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
                            className="w-full px-3 py-2.5 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-foreground) text-base focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 focus:border-(--color-accent) transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <p className="text-base text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-(--color-accent) text-(--color-on-accent) text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* 홈으로 돌아가기 */}
                <p className="text-center mt-6">
                    <a
                        href="/"
                        className="text-base text-(--color-muted) hover:text-(--color-foreground) transition-colors"
                    >
                        ← 사이트로 돌아가기
                    </a>
                </p>
            </div>
        </div>
    );
}
