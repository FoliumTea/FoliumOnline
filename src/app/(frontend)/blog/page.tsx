import type { Metadata } from "next";
import { redirectToOnlyPublicJobField } from "@/lib/plain-public-route";

export const metadata: Metadata = {
    title: "Blog",
    description: "기술 블로그",
};

export default async function BlogPage() {
    await redirectToOnlyPublicJobField("/blog");
}
