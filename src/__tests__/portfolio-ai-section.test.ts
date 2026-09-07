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
    it("기본 설정은 Aigent Hive를 직무별 프로젝트 뒤에 둔다", () => {
        expect(normalizePortfolioAiSectionConfig(undefined)).toEqual({
            projectSlug: "aigent-hive",
            takePrecedence: false,
        });
    });

    it("선택한 AI 프로젝트만 별도 구역으로 분리", () => {
        const aigentHive = createProject("aigent-hive", "personal");
        const game = createProject("game-project", "personal");
        expect(
            splitPortfolioAiSection([aigentHive, game], {
                projectSlug: "aigent-hive",
                takePrecedence: true,
            })
        ).toEqual({ aiProject: aigentHive, jobFieldProjects: [game] });
    });
});
