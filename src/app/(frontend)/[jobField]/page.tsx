import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationProfileHome from "@/components/ApplicationProfileHome";
import { getApplicationProfileByToken } from "@/lib/application-profile";

type PageProps = {
    params: Promise<{ jobField: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) return {};
    return {
        title: profile.public_snapshot.resume.basics?.label || "Portfolio",
        robots: { index: false, follow: false },
    };
}

export default async function JobFieldHomePage({ params }: PageProps) {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) notFound();
    return (
        <ApplicationProfileHome
            token={profile.public_token}
            snapshot={profile.public_snapshot}
        />
    );
}
