import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostContent from "../../../blog/[slug]/blog-post-content";
import { resolvePublicJobField } from "@/lib/public-job-field";
import { getPublicPostRouteParams } from "@/lib/public-route-params";
import { getBlogPostMetadata } from "@/lib/content-metadata";

type PageProps = {
    params: Promise<{ jobField: string; slug: string }>;
};

export async function generateStaticParams() {
    return getPublicPostRouteParams();
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    return getBlogPostMetadata(slug);
}

export default async function JobFieldBlogPostPage({ params }: PageProps) {
    const { jobField: rawJobField, slug } = await params;
    const jobField = await resolvePublicJobField(rawJobField);
    if (!jobField) notFound();
    return (
        <BlogPostContent
            slug={slug}
            jobField={jobField.id}
            blogBasePath={`/${jobField.id}/blog`}
        />
    );
}
