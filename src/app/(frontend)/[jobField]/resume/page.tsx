import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResumePageContent from "../../resume/resume-content";
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
        return getSeoMetadata(target.jobField.id, { title: "Resume" });
    }
    if (!target.profile.public_snapshot) return {};
    return { title: "Resume", robots: { index: false, follow: false } };
}

export default async function JobFieldResumePage({ params }: PageProps) {
    const target = await resolvePublicRouteTarget((await params).jobField);
    if (!target) notFound();
    if (target.kind === "job-field") {
        return <ResumePageContent jobField={target.jobField.id} />;
    }
    const profile = target.profile;
    if (!profile.public_snapshot) notFound();
    return (
        <ResumePageContent
            jobField={profile.public_snapshot.jobField}
            resumeOverride={profile.public_snapshot.resume}
            aboutOverride={profile.public_snapshot.about}
            jobFieldTitleOverride={profile.public_snapshot.resume.basics?.label}
            portfolioBasePath={`/${profile.public_token}/portfolio`}
        />
    );
}
