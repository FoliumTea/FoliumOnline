import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "About me",
    description: "개발자 소개",
};

export default async function AboutPage() {
    notFound();
}
