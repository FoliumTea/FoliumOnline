import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookDetailContent from "../../../books/[slug]/book-detail-content";
import { resolvePublicRouteTarget } from "@/lib/public-route";
import { getSeoMetadata } from "@/lib/seo-metadata";
import { getPublicBookRouteParams } from "@/lib/public-route-params";

type PageProps = {
    params: Promise<{ jobField: string; slug: string }>;
};

export async function generateStaticParams() {
    return getPublicBookRouteParams();
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const target = await resolvePublicRouteTarget((await params).jobField);
    return target?.kind === "job-field"
        ? getSeoMetadata(target.jobField.id)
        : {};
}

export default async function JobFieldBookDetailPage({ params }: PageProps) {
    const { jobField: routeKey, slug } = await params;
    const target = await resolvePublicRouteTarget(routeKey);
    if (target?.kind !== "job-field") notFound();
    return <BookDetailContent slug={slug} jobField={target.jobField.id} />;
}
