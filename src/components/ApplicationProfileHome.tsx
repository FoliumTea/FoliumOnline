import Link from "next/link";
import type { ApplicationProfileSnapshot } from "@/types/application-profile";

type Props = {
    token: string;
    snapshot: ApplicationProfileSnapshot;
};

export default function ApplicationProfileHome({ token, snapshot }: Props) {
    const prefix = `/${token}`;
    const headline = snapshot.resume.basics?.label || "Portfolio";
    const summary = snapshot.resume.basics?.summary;
    return (
        <section className="mx-auto max-w-3xl py-16" data-pdf-block>
            <p className="text-sm font-bold tracking-[0.18em] text-(--color-accent) uppercase">
                Application portfolio
            </p>
            <h1 className="mt-3 text-5xl font-(--font-display) font-black tracking-tight text-(--color-foreground)">
                {headline}
            </h1>
            {summary && (
                <p className="mt-6 text-lg leading-relaxed whitespace-pre-line text-(--color-muted)">
                    {summary}
                </p>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
                <Link
                    href={`${prefix}/resume`}
                    className="rounded-lg bg-(--color-accent) px-5 py-3 font-bold text-(--color-on-accent)"
                >
                    Resume
                </Link>
                <Link
                    href={`${prefix}/portfolio`}
                    className="rounded-lg border border-(--color-border) px-5 py-3 font-bold text-(--color-foreground)"
                >
                    Portfolio
                </Link>
                {snapshot.posts.length > 0 && (
                    <Link
                        href={`${prefix}/blog`}
                        className="rounded-lg border border-(--color-border) px-5 py-3 font-bold text-(--color-foreground)"
                    >
                        Blog
                    </Link>
                )}
            </div>
        </section>
    );
}
