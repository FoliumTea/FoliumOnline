import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioPageContent from "../../portfolio/portfolio-content";
import { getApplicationProfileByToken } from "@/lib/application-profile";

type PageProps = {
    params: Promise<{ jobField: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) return {};
    return { title: "Portfolio", robots: { index: false, follow: false } };
}

export default async function JobFieldPortfolioPage({ params }: PageProps) {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) notFound();
    return (
        <PortfolioPageContent
            jobField={profile.public_snapshot.jobField}
            projectsOverride={profile.public_snapshot.portfolio}
            portfolioBasePath={`/${profile.public_token}/portfolio`}
        />
    );
}
