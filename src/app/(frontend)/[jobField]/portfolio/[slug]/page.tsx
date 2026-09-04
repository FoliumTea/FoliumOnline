import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioDetailContent from "../../../portfolio/[slug]/portfolio-detail-content";
import { getApplicationProfileByToken } from "@/lib/application-profile";

type PageProps = {
    params: Promise<{ jobField: string; slug: string }>;
};

export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { jobField, slug } = await params;
    const profile = await getApplicationProfileByToken(jobField);
    const item = profile?.public_snapshot?.portfolio.find(
        (entry) => entry.slug === slug
    );
    return item
        ? {
              title: item.meta_title || item.title,
              robots: { index: false, follow: false },
          }
        : {};
}

export default async function JobFieldPortfolioDetailPage({
    params,
}: PageProps) {
    const { jobField: token, slug } = await params;
    const profile = await getApplicationProfileByToken(token);
    const item = profile?.public_snapshot?.portfolio.find(
        (entry) => entry.slug === slug
    );
    if (!profile?.public_snapshot || !item) notFound();
    return (
        <PortfolioDetailContent
            slug={slug}
            portfolioBasePath={`/${profile.public_token}/portfolio`}
            itemOverride={item}
        />
    );
}
