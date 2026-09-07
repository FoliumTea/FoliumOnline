import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PortfolioView from "@/components/PortfolioView";
import type { PortfolioProject } from "@/types/portfolio";

const project = {
    slug: "timeline-project",
    title: "Timeline Project",
    description: "프로젝트 설명",
    content: "",
    startDate: "2024-01-01",
    endDate: "2024-06-01",
    goal: "목표",
    role: "개발",
    teamSize: 2,
    accomplishments: [],
    keywords: ["TypeScript"],
    github: "",
    public: true,
    published: true,
    featured: false,
    featuredByJobField: {},
    featuredOrderByJobField: {},
    orderIdx: 0,
    jobField: "web",
    badges: [],
    caseStudyVersion: 2,
    caseStudyStyle: "web",
    oneLinePitch: "현재 카드 정보의 요약",
    engine: "",
    platforms: [],
    ownership: ["기획과 구현"],
    outcomes: [{ result: "검증 가능한 결과" }],
    gallery: [],
    links: [],
    devlogs: [],
    credits: [],
    projectType: "work",
    teamComposition: "",
} satisfies PortfolioProject;

const aigentHive = {
    ...project,
    slug: "aigent-hive",
    title: "Aigent Hive",
    projectType: "personal",
} satisfies PortfolioProject;

const personalProject = {
    ...project,
    slug: "personal-project",
    title: "Personal Project",
    projectType: "personal",
} satisfies PortfolioProject;

describe("PortfolioView", () => {
    it("timeline 선택에서 원래의 세로선과 프로젝트 상세 링크를 렌더링", () => {
        const html = renderToStaticMarkup(
            <PortfolioView
                projects={[project]}
                portfolioBasePath="/web/portfolio"
                design="timeline"
            />
        );

        expect(html).toContain("absolute top-0 bottom-0 left-0 w-px");
        expect(html).toContain("Timeline Project");
        expect(html).toContain("/web/portfolio/timeline-project");
        expect(html).toContain("2024.01 - 2024.06");
    });

    it("cards 기본 선택에서 현재 프로젝트 유형별 카드 구성을 유지", () => {
        const html = renderToStaticMarkup(
            <PortfolioView
                projects={[project]}
                portfolioBasePath="/portfolio"
            />
        );

        expect(html).toContain("기업 프로젝트");
        expect(html).toContain("Timeline Project");
        expect(html).not.toContain("absolute top-0 bottom-0 left-0 w-px");
    });

    it("AI 구역 우선 설정에 따라 Aigent Hive와 직무 프로젝트 순서를 바꾼다", () => {
        const firstHtml = renderToStaticMarkup(
            <PortfolioView
                projects={[personalProject, aigentHive]}
                aiSection={{
                    projectSlugs: ["aigent-hive"],
                    takePrecedence: true,
                }}
            />
        );
        const lastHtml = renderToStaticMarkup(
            <PortfolioView
                projects={[personalProject, aigentHive]}
                aiSection={{
                    projectSlugs: ["aigent-hive"],
                    takePrecedence: false,
                }}
            />
        );

        expect(firstHtml.indexOf("AI 프로젝트")).toBeLessThan(
            firstHtml.indexOf("직무별 프로젝트")
        );
        expect(firstHtml).toContain(
            "AI를 활용해 개발 환경과 작업 흐름을 설계·구현한 프로젝트"
        );
        expect(lastHtml.indexOf("AI 프로젝트")).toBeGreaterThan(
            lastHtml.indexOf("직무별 프로젝트")
        );
        expect(lastHtml).toContain("mt-12 border-t border-(--color-border)");
        expect(
            firstHtml.match(/aria-label="Aigent Hive 프로젝트 기록 보기"/g)
        ).toHaveLength(1);
    });
});
