import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResumePageContent from "../../resume/resume-content";
import { getApplicationProfileByToken } from "@/lib/application-profile";

type PageProps = {
    params: Promise<{ jobField: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) return {};
    return { title: "Resume", robots: { index: false, follow: false } };
}

export default async function JobFieldResumePage({ params }: PageProps) {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) notFound();
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
