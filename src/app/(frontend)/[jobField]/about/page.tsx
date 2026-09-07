import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutPageContent from "../../about/about-content";
import { resolvePublicRouteTarget } from "@/lib/public-route";
import { getSeoMetadata } from "@/lib/seo-metadata";

type PageProps = {
    params: Promise<{ jobField: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const target = await resolvePublicRouteTarget((await params).jobField);
    return target?.kind === "job-field"
        ? getSeoMetadata(target.jobField.id)
        : {};
}

export default async function JobFieldAboutPage({ params }: PageProps) {
    const target = await resolvePublicRouteTarget((await params).jobField);
    if (target?.kind !== "job-field") notFound();
    return <AboutPageContent jobField={target.jobField} />;
}
