import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Resume",
    description: "이력서",
};

export default async function ResumePage() {
    notFound();
}
