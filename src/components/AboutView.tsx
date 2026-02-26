/**
 * AboutView
 *
 * Supabase about_data 테이블에서 런타임으로 데이터를 fetch해서
 * About me 페이지를 렌더링한다.
 * 로딩 중에는 스켈레톤, 에러 시에는 메시지를 표시한다.
 */
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";

interface AboutData {
    profileImage?: string;
    name?: string;
    description?: string;
    descriptionSub?: string;
    contacts?: {
        email?: string;
        github?: string;
        linkedin?: string;
    };
    sections?: Record<string, string[]>;
    competencySections?: Record<string, string[]>;
}

export default function AboutView() {
    const [data, setData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!browserClient) {
            setError("Supabase 클라이언트를 초기화할 수 없습니다.");
            setLoading(false);
            return;
        }

        browserClient
            .from("about_data")
            .select("data")
            .limit(1)
            .single()
            .then(({ data: row, error: err }) => {
                if (err || !row) {
                    setError("About 데이터를 불러오지 못했습니다.");
                } else {
                    setData(row.data as AboutData);
                }
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 animate-pulse space-y-4">
                <div className="h-8 w-40 bg-(--color-border) rounded" />
                <div className="flex gap-8">
                    <div className="w-40 h-40 rounded-full bg-(--color-border) shrink-0" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 w-48 bg-(--color-border) rounded" />
                        <div className="h-4 w-full bg-(--color-border) rounded" />
                        <div className="h-4 w-3/4 bg-(--color-border) rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <p className="text-sm text-red-500">{error ?? "데이터 없음"}</p>
            </div>
        );
    }

    const profileImage =
        data.profileImage?.trim() || "/images/avatar-placeholder.svg";
    const contacts = data.contacts ?? {};
    const sections = data.sections ?? {};
    const competencySections = data.competencySections ?? {};

    const contactEntries = [
        {
            label: "Email",
            value: contacts.email?.trim(),
            href: contacts.email ? `mailto:${contacts.email}` : undefined,
        },
        {
            label: "GitHub",
            value: contacts.github?.trim(),
            href: contacts.github || undefined,
        },
        {
            label: "LinkedIn",
            value: contacts.linkedin?.trim(),
            href: contacts.linkedin || undefined,
        },
    ].filter((e) => e.value);

    const sectionEntries = Object.entries(sections).filter(
        ([, items]) => Array.isArray(items) && items.length > 0
    );
    const competencyEntries = Object.entries(competencySections).filter(
        ([, items]) => Array.isArray(items) && items.length > 0
    );

    return (
        <article className="max-w-7xl mx-auto py-12">
            <h1 className="text-3xl font-bold mb-8 text-(--color-foreground)">
                About me
            </h1>

            <div className="flex flex-col items-start gap-8 tablet:flex-row">
                <img
                    src={profileImage}
                    alt="프로필 사진"
                    width={160}
                    height={160}
                    className="w-40 h-40 rounded-full object-cover border-2 border-(--color-border) shrink-0"
                />

                <div className="flex-1 min-w-0">
                    {data.name && (
                        <h2 className="text-xl font-semibold text-(--color-foreground) mb-3">
                            {data.name}
                        </h2>
                    )}
                    {data.description && (
                        <p className="text-(--color-foreground) leading-relaxed mb-4">
                            {data.description}
                        </p>
                    )}
                    {data.descriptionSub && (
                        <p className="text-(--color-muted) text-sm leading-relaxed">
                            {data.descriptionSub}
                        </p>
                    )}

                    {contactEntries.length > 0 && (
                        <dl className="mt-6 pt-6 border-t border-(--color-border) grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                            {contactEntries.map(({ label, value, href }) => (
                                <>
                                    <dt
                                        key={`dt-${label}`}
                                        className="text-(--color-muted) font-medium"
                                    >
                                        {label}
                                    </dt>
                                    <dd key={`dd-${label}`}>
                                        {href ? (
                                            <a
                                                href={href}
                                                className="text-(--color-link) hover:underline"
                                                target={
                                                    href.startsWith("http")
                                                        ? "_blank"
                                                        : undefined
                                                }
                                                rel={
                                                    href.startsWith("http")
                                                        ? "noopener noreferrer"
                                                        : undefined
                                                }
                                            >
                                                {value}
                                            </a>
                                        ) : (
                                            value
                                        )}
                                    </dd>
                                </>
                            ))}
                        </dl>
                    )}
                </div>
            </div>

            {/* 경험 유형별 테이블 */}
            {sectionEntries.length > 0 && (
                <div className="mt-12 pt-8 border-t border-(--color-border)">
                    <h2 className="text-xl font-semibold text-(--color-foreground) mb-4">
                        경험 유형별 리스트
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-(--color-border)">
                        <table className="w-full text-sm text-left">
                            <thead className="text-(--color-muted) font-medium border-b border-(--color-border) bg-(--color-surface-subtle)">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 w-40 shrink-0"
                                    >
                                        구분
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        내용
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-(--color-foreground)">
                                {sectionEntries.map(([category, items]) => (
                                    <tr
                                        key={category}
                                        className="border-b border-(--color-border) last:border-b-0"
                                    >
                                        <td className="px-4 py-3 font-medium text-(--color-muted) align-top">
                                            {category}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ul className="list-disc list-inside space-y-2">
                                                {items.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="whitespace-pre-line"
                                                    >
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 역량 키워드별 테이블 */}
            {competencyEntries.length > 0 && (
                <div className="mt-12 pt-8 border-t border-(--color-border)">
                    <h2 className="text-xl font-semibold text-(--color-foreground) mb-4">
                        역량 키워드별 리스트
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-(--color-border)">
                        <table className="w-full text-sm text-left">
                            <thead className="text-(--color-muted) font-medium border-b border-(--color-border) bg-(--color-surface-subtle)">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 w-40 shrink-0"
                                    >
                                        구분
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        내용
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-(--color-foreground)">
                                {competencyEntries.map(([category, items]) => (
                                    <tr
                                        key={category}
                                        className="border-b border-(--color-border) last:border-b-0"
                                    >
                                        <td className="px-4 py-3 font-medium text-(--color-muted) align-top">
                                            {category}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ul className="list-disc list-inside space-y-2">
                                                {items.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="whitespace-pre-line"
                                                    >
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </article>
    );
}
