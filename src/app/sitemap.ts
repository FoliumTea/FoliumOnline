import type { MetadataRoute } from "next";
// 지원 링크는 비공개 공유 경로이므로 sitemap 제공 제외
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return [];
}
