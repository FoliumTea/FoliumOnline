import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListContent from "../../blog/blog-list-content";
import { getApplicationProfileByToken } from "@/lib/application-profile";

type PageProps = {
    params: Promise<{ jobField: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) return {};
    return { title: "Blog", robots: { index: false, follow: false } };
}

export default async function JobFieldBlogPage({ params }: PageProps) {
    const profile = await getApplicationProfileByToken((await params).jobField);
    if (!profile?.public_snapshot) notFound();
    return (
        <BlogListContent
            postsOverride={profile.public_snapshot.posts}
            blogBasePath={`/${profile.public_token}/blog`}
        />
    );
}
