import { describe, expect, it } from "vitest";
import {
    normalizePortfolioAiSectionConfig,
    splitPortfolioAiSection,
} from "@/lib/portfolio-ai-section";
import type { PortfolioProject } from "@/types/portfolio";

const createProject = (
    slug: string,
    projectType: "work" | "personal"
): PortfolioProject => ({
    slug,
    title: slug,
    description: "",
    content: "",
    startDate: "2026-01-01",
    endDate: "",
    goal: "",
    role: "",
    teamSize: 1,
    accomplishments: [],
    keywords: [],
    github: "",
    public: true,
    published: true,
    featured: false,
    featuredByJobField: {},
    featuredOrderByJobField: {},
    orderIdx: 0,
    jobField: "game",
    badges: [],
    caseStudyVersion: 2,
    caseStudyStyle: "game",
    oneLinePitch: "",
    engine: "",
    platforms: [],
    ownership: [],
    outcomes: [],
    gallery: [],
    links: [],
    devlogs: [],
    credits: [],
    projectType,
    teamComposition: "",
});

describe("portfolio AI section", () => {
    it("기본 설정은 AI 프로젝트를 고정하지 않고 뒤에 둔다", () => {
        expect(normalizePortfolioAiSectionConfig(undefined)).toEqual({
            projectSlugs: [],
            takePrecedence: false,
        });
    });

    it("여러 AI 프로젝트를 설정 순서대로 별도 구역으로 분리", () => {
        const aigentHive = createProject("aigent-hive", "personal");
        const aiTool = createProject("ai-tool", "personal");
        const game = createProject("game-project", "personal");
        expect(
            splitPortfolioAiSection([game, aiTool, aigentHive], {
                projectSlugs: ["aigent-hive", "ai-tool"],
                takePrecedence: true,
            })
        ).toEqual({
            aiProjects: [aigentHive, aiTool],
            jobFieldProjects: [game],
        });
    });

    it("기존 단일 projectSlug 설정을 목록으로 이관", () => {
        expect(
            normalizePortfolioAiSectionConfig({
                projectSlug: "aigent-hive",
                takePrecedence: true,
            })
        ).toEqual({
            projectSlugs: ["aigent-hive"],
            takePrecedence: true,
        });
    });
});
