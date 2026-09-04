import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Blog",
    description: "기술 블로그",
};

export default async function BlogPage() {
    notFound();
}
