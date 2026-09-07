import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListContent from "../../blog/blog-list-content";
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
        return getSeoMetadata(target.jobField.id, { title: "Blog" });
    }
    if (!target.profile.public_snapshot) return {};
    return { title: "Blog", robots: { index: false, follow: false } };
}

export default async function JobFieldBlogPage({ params }: PageProps) {
    const target = await resolvePublicRouteTarget((await params).jobField);
    if (!target) notFound();
    if (target.kind === "job-field") {
        return <BlogListContent jobFieldOverride={target.jobField.id} />;
    }
    const profile = target.profile;
    if (!profile.public_snapshot) notFound();
    return (
        <BlogListContent
            postsOverride={profile.public_snapshot.posts}
            blogBasePath={`/${profile.public_token}/blog`}
        />
    );
}
