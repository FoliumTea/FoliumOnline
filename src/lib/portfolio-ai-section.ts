import type { PortfolioProject } from "@/types/portfolio";

export const PORTFOLIO_AI_SECTION_CONFIG_KEY = "portfolio_ai_section";

export type PortfolioAiSectionConfig = {
    projectSlug: string;
    takePrecedence: boolean;
};

const DEFAULT_CONFIG: PortfolioAiSectionConfig = {
    projectSlug: "aigent-hive",
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
    const config = value as Partial<PortfolioAiSectionConfig>;
    const projectSlug = config.projectSlug?.trim().toLowerCase();
    return {
        projectSlug:
            projectSlug && PROJECT_SLUG_PATTERN.test(projectSlug)
                ? projectSlug
                : DEFAULT_CONFIG.projectSlug,
        takePrecedence: config.takePrecedence === true,
    };
};

// 선택한 AI 프로젝트와 나머지 직무 프로젝트 분리
export const splitPortfolioAiSection = (
    projects: PortfolioProject[],
    config: PortfolioAiSectionConfig
): { aiProject?: PortfolioProject; jobFieldProjects: PortfolioProject[] } => {
    const aiProject = projects.find(
        (project) => project.slug === config.projectSlug
    );
    return {
        aiProject,
        jobFieldProjects: aiProject
            ? projects.filter((project) => project !== aiProject)
            : projects,
    };
};
