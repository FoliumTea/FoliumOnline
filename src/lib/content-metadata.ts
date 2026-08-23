import type { Metadata } from "next";
import { getPortfolioItemMeta, getPostMeta } from "@/lib/queries";

type EntryMetadataInput = {
    documentTitle: string;
    shareTitle: string;
    description?: string;
    image?: string;
};

const toOptionalString = (value: string | null | undefined) =>
    value?.trim() || undefined;

const buildEntryMetadata = ({
    documentTitle,
    shareTitle,
    description,
    image,
}: EntryMetadataInput): Metadata => ({
    title: documentTitle,
    description,
    openGraph: {
        title: shareTitle,
        description,
        ...(image ? { images: [image] } : {}),
    },
    twitter: {
        card: image ? "summary_large_image" : "summary",
        title: shareTitle,
        description,
        ...(image ? { images: [image] } : {}),
    },
});

export async function getBlogPostMetadata(slug: string): Promise<Metadata> {
    const post = await getPostMeta(slug);
    if (!post) return {};

    const metaTitle = toOptionalString(post.meta_title);
    const category = toOptionalString(post.category);
    const shareTitle = metaTitle ?? post.title;
    const documentTitle =
        metaTitle ?? (category ? `${category} | ${post.title}` : post.title);

    return buildEntryMetadata({
        documentTitle,
        shareTitle,
        description:
            toOptionalString(post.meta_description) ??
            toOptionalString(post.description),
        image:
            toOptionalString(post.og_image) ?? toOptionalString(post.thumbnail),
    });
}

export async function getPortfolioItemMetadata(
    slug: string
): Promise<Metadata> {
    const item = await getPortfolioItemMeta(slug);
    if (!item) return {};

    const metaTitle = toOptionalString(item.meta_title);
    const shareTitle = metaTitle ?? item.title;

    return buildEntryMetadata({
        documentTitle: metaTitle ?? `${item.title} - Portfolio`,
        shareTitle,
        description:
            toOptionalString(item.meta_description) ??
            toOptionalString(item.description),
        image:
            toOptionalString(item.og_image) ?? toOptionalString(item.thumbnail),
    });
}
