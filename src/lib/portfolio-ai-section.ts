import type { PortfolioProject } from "@/types/portfolio";

export const PORTFOLIO_AI_SECTION_CONFIG_KEY = "portfolio_ai_section";

export type PortfolioAiSectionConfig = {
    projectSlugs: string[];
    takePrecedence: boolean;
};

const DEFAULT_CONFIG: PortfolioAiSectionConfig = {
    projectSlugs: [],
    takePrecedence: false,
};

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// AI 구역 공통 설정 정규화
export const normalizePortfolioAiSectionConfig = (
    value: unknown
): PortfolioAiSectionConfig => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return DEFAULT_CONFIG;
    }
    const config = value as Partial<PortfolioAiSectionConfig> & {
        projectSlug?: unknown;
    };
    const rawSlugs = Array.isArray(config.projectSlugs)
        ? config.projectSlugs
        : typeof config.projectSlug === "string"
          ? [config.projectSlug]
          : [];
    const projectSlugs = Array.from(
        new Set(
            rawSlugs.flatMap((value) => {
                if (typeof value !== "string") return [];
                const slug = value.trim().toLowerCase();
                return PROJECT_SLUG_PATTERN.test(slug) ? [slug] : [];
            })
        )
    );
    return {
        projectSlugs,
        takePrecedence: config.takePrecedence === true,
    };
};

// 선택한 AI 프로젝트와 나머지 직무 프로젝트 분리
export const splitPortfolioAiSection = (
    projects: PortfolioProject[],
    config: PortfolioAiSectionConfig
): { aiProjects: PortfolioProject[]; jobFieldProjects: PortfolioProject[] } => {
    const bySlug = new Map(projects.map((project) => [project.slug, project]));
    const aiProjects = config.projectSlugs.flatMap((slug) => {
        const project = bySlug.get(slug);
        return project ? [project] : [];
    });
    const aiSlugs = new Set(aiProjects.map((project) => project.slug));
    return {
        aiProjects,
        jobFieldProjects: projects.filter(
            (project) => !aiSlugs.has(project.slug)
        ),
    };
};
