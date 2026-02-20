/**
 * About 페이지 데이터 편집 폼 (설문형 UI)
 * 다운로드 버튼으로 about.json 저장 → 사용자가 src/data/about.json 에 수동 반영
 * textarea는 uncontrolled로 두어 브라우저 기본 실행 취소(Ctrl+Z)가 전체 입력에 대해 동작하도록 함.
 */
import { useState, useRef } from "react";
import type {
    AboutData,
    AboutSectionKey,
    CompetencySectionKey,
} from "@/types/about";
import {
    ABOUT_SECTION_KEYS,
    COMPETENCY_SECTION_KEYS,
    SECTION_PLACEHOLDERS,
    COMPETENCY_PLACEHOLDERS,
} from "@/types/about";

/** 한 줄당 한 항목으로 파싱 (다운로드 시 ref 값에서 사용) */
function parseSectionText(text: string): string[] {
    return text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

interface Props {
    initialData: AboutData;
}

const defaultSections = ABOUT_SECTION_KEYS.reduce(
    (acc: Record<AboutSectionKey, string[]>, key: AboutSectionKey) => {
        acc[key] = [];
        return acc;
    },
    {} as Record<AboutSectionKey, string[]>
);

const defaultCompetencySections = COMPETENCY_SECTION_KEYS.reduce(
    (
        acc: Record<CompetencySectionKey, string[]>,
        key: CompetencySectionKey
    ) => {
        acc[key] = [];
        return acc;
    },
    {} as Record<CompetencySectionKey, string[]>
);

export default function AboutAdminForm({ initialData }: Props) {
    const [profileImage, setProfileImage] = useState(
        initialData.profileImage ?? ""
    );
    const [name, setName] = useState(initialData.name ?? "");
    const [email, setEmail] = useState(initialData.contacts?.email ?? "");
    const [github, setGithub] = useState(initialData.contacts?.github ?? "");
    const [linkedin, setLinkedin] = useState(
        initialData.contacts?.linkedin ?? ""
    );

    /** Uncontrolled textarea refs – 값은 DOM이 관리하고, 다운로드 시에만 읽음 (브라우저 undo 정상 동작) */
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const descriptionSubRef = useRef<HTMLTextAreaElement>(null);
    const sectionRefs = useRef<
        Partial<Record<AboutSectionKey, HTMLTextAreaElement | null>>
    >({});
    const competencyRefs = useRef<
        Partial<Record<CompetencySectionKey, HTMLTextAreaElement | null>>
    >({});

    /** 초기값: 경험 유형별/역량별 섹션 텍스트 (한 줄 = 한 항목, uncontrolled defaultValue용) */
    const getInitialSectionText = (key: AboutSectionKey) =>
        (initialData.sections ?? defaultSections)[key]?.join("\n") ?? "";
    const getInitialCompetencyText = (key: CompetencySectionKey) =>
        (initialData.competencySections ?? defaultCompetencySections)[
            key
        ]?.join("\n") ?? "";

    const handleDownload = () => {
        const data: AboutData = {
            profileImage: profileImage.trim() || undefined,
            name: name.trim() || undefined,
            description: descriptionRef.current?.value?.trim() || undefined,
            descriptionSub:
                descriptionSubRef.current?.value?.trim() || undefined,
            contacts: {
                email: email.trim() || undefined,
                github: github.trim() || undefined,
                linkedin: linkedin.trim() || undefined,
            },
            sections: Object.fromEntries(
                ABOUT_SECTION_KEYS.map((key: AboutSectionKey) => [
                    key,
                    parseSectionText(sectionRefs.current[key]?.value ?? ""),
                ])
            ) as AboutData["sections"],
            competencySections: Object.fromEntries(
                COMPETENCY_SECTION_KEYS.map((key: CompetencySectionKey) => [
                    key,
                    parseSectionText(competencyRefs.current[key]?.value ?? ""),
                ])
            ) as AboutData["competencySections"],
        };
        const blob = new Blob([JSON.stringify(data, null, 4)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "about.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    /** 폼 기본 제출 막기 (다운로드는 버튼 클릭으로만 수행) */
    const handleFormSubmit = (e: React.FormEvent) => e.preventDefault();

    /**
     * textarea/input에 포커스가 있을 때 키 이벤트가 상위(document/호스트)로 올라가지 않도록 막음.
     * 상위에서 Space/Enter/Ctrl+Z 등을 가로채 preventDefault() 하면, textarea의 기본 동작(공백, 줄바꿈, 실행 취소)이 막힘.
     * React의 stopPropagation만으로는 네이티브 document 리스너에 막히는 경우가 있으므로 nativeEvent도 차단.
     */
    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        const t = e.target;
        const isEditable =
            t instanceof HTMLTextAreaElement ||
            (t instanceof HTMLInputElement &&
                t.type !== "submit" &&
                t.type !== "button");
        if (!isEditable) return;
        e.stopPropagation();
        e.nativeEvent.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };

    return (
        <form
            onSubmit={handleFormSubmit}
            onKeyDown={handleFormKeyDown}
            className="space-y-8 max-w-2xl"
        >
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-(--color-foreground)">
                    프로필
                </h2>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        프로필 이미지 URL
                    </span>
                    <input
                        type="text"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        placeholder="/images/avatar-placeholder.svg"
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        이름 / 인사말
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="정호진"
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-(--color-foreground)">
                    소개
                </h2>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        메인 소개
                    </span>
                    <textarea
                        ref={descriptionRef}
                        defaultValue={initialData.description ?? ""}
                        rows={3}
                        placeholder="한두 문단으로 소개를 입력하세요."
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        보조 소개
                    </span>
                    <textarea
                        ref={descriptionSubRef}
                        defaultValue={initialData.descriptionSub ?? ""}
                        rows={2}
                        placeholder="추가 설명 (선택)"
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-(--color-foreground)">
                    연락처
                </h2>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        Email
                    </span>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        GitHub URL
                    </span>
                    <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
                <label className="block">
                    <span className="block text-lg font-medium text-(--color-muted) mb-1">
                        LinkedIn URL
                    </span>
                    <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground)"
                    />
                </label>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-(--color-foreground)">
                    경험 유형별 리스트
                </h2>
                <p className="text-xl text-(--color-muted)">
                    각 구분별로 <strong>한 줄에 한 항목씩</strong> 입력하세요.
                    비워두면 About 페이지에 표시되지 않습니다.
                </p>
                {ABOUT_SECTION_KEYS.map((key: AboutSectionKey) => (
                    <label key={key} className="block">
                        <span className="block text-lg font-medium text-(--color-muted) mb-1">
                            {key}
                        </span>
                        <textarea
                            ref={(el) => {
                                sectionRefs.current[key] = el;
                            }}
                            defaultValue={getInitialSectionText(key)}
                            rows={6}
                            placeholder={SECTION_PLACEHOLDERS[key]}
                            className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground) min-h-[120px] resize-y"
                        />
                    </label>
                ))}
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-(--color-foreground)">
                    역량 키워드별 리스트
                </h2>
                <p className="text-xl text-(--color-muted)">
                    각 역량별로 경험·사례를 한 줄에 한 항목씩 입력하세요.
                    비워두면 About 페이지에 표시되지 않습니다.
                </p>
                {COMPETENCY_SECTION_KEYS.map((key: CompetencySectionKey) => (
                    <label key={key} className="block">
                        <span className="block text-lg font-medium text-(--color-muted) mb-1">
                            {key}
                        </span>
                        <textarea
                            ref={(el) => {
                                competencyRefs.current[key] = el;
                            }}
                            defaultValue={getInitialCompetencyText(key)}
                            rows={6}
                            placeholder={COMPETENCY_PLACEHOLDERS[key]}
                            className="w-full px-3 py-2 rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-foreground) min-h-[120px] resize-y"
                        />
                    </label>
                ))}
            </section>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2 rounded-lg bg-(--color-accent) text-(--color-on-accent) font-medium hover:opacity-90"
                >
                    about.json 다운로드
                </button>
                <a
                    href="/about"
                    className="px-6 py-2 rounded-lg border border-(--color-border) font-medium hover:opacity-80"
                >
                    About 페이지 보기
                </a>
            </div>
        </form>
    );
}
