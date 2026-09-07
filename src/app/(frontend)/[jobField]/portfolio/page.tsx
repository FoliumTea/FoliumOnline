import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioPageContent from "../../portfolio/portfolio-content";
import { resolvePublicRouteTarget } from "@/lib/public-route";
import { getSeoMetadata } from "@/lib/seo-metadata";

type PageProps = {
    params: Promise<{ jobField: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const target = await resolvePublicRouteTarget((await params).jobField);
    if (!target) return {};
    if (target.kind === "job-field") {
        return getSeoMetadata(target.jobField.id, { title: "Portfolio" });
    }
    if (!target.profile.public_snapshot) return {};
    return { title: "Portfolio", robots: { index: false, follow: false } };
}

export default async function JobFieldPortfolioPage({ params }: PageProps) {
    const target = await resolvePublicRouteTarget((await params).jobField);
    if (!target) notFound();
    if (target.kind === "job-field") {
        return <PortfolioPageContent jobField={target.jobField.id} />;
    }
    const profile = target.profile;
    if (!profile.public_snapshot) notFound();
    return (
        <PortfolioPageContent
            jobField={profile.public_snapshot.jobField}
            projectsOverride={profile.public_snapshot.portfolio}
            portfolioBasePath={`/${profile.public_token}/portfolio`}
        />
    );
}
