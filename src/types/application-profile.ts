import type { AboutData } from "@/types/about";
import type { PortfolioRawRow } from "@/types/portfolio";
import type { Resume } from "@/types/resume";

export type ApplicationProfileStatus = "draft" | "published" | "revoked";

export type ApplicationPost = {
    slug: string;
    title: string;
    description: string | null;
    content: string;
    pub_date: string;
    category: string | null;
    tags: string[];
    thumbnail: string | null;
    meta_title: string | null;
    meta_description: string | null;
    og_image: string | null;
};

export type ApplicationProfileOverrides = {
    excludedPortfolioSlugs: string[];
    portfolioOrder: string[];
    excludedPostSlugs: string[];
    postOrder: string[];
    headline?: string;
    summary?: string;
};

export type ApplicationProfileSnapshot = {
    jobField: string;
    resume: Resume;
    about: AboutData;
    portfolio: PortfolioRawRow[];
    posts: ApplicationPost[];
    sourceHash: string;
};

export type ApplicationProfile = {
    id: string;
    name: string;
    public_token: string;
    parent_job_field: string;
    job_description: string;
    status: ApplicationProfileStatus;
    version: number;
    base_snapshot: ApplicationProfileSnapshot;
    overrides: ApplicationProfileOverrides;
    public_snapshot: ApplicationProfileSnapshot | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
};

export const EMPTY_APPLICATION_PROFILE_OVERRIDES: ApplicationProfileOverrides =
    {
        excludedPortfolioSlugs: [],
        portfolioOrder: [],
        excludedPostSlugs: [],
        postOrder: [],
    };
