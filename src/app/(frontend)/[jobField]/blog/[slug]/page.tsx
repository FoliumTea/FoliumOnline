import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostContent from "../../../blog/[slug]/blog-post-content";
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
    const post = profile?.public_snapshot?.posts.find(
        (entry) => entry.slug === slug
    );
    return post
        ? {
              title: post.meta_title || post.title,
              robots: { index: false, follow: false },
          }
        : {};
}

export default async function JobFieldBlogPostPage({ params }: PageProps) {
    const { jobField: token, slug } = await params;
    const profile = await getApplicationProfileByToken(token);
    const post = profile?.public_snapshot?.posts.find(
        (entry) => entry.slug === slug
    );
    if (!profile?.public_snapshot || !post) notFound();
    return (
        <BlogPostContent
            slug={slug}
            blogBasePath={`/${profile.public_token}/blog`}
            postOverride={post}
        />
    );
}
