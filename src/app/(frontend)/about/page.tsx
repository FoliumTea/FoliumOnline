import type { Metadata } from "next";
import { redirectToOnlyPublicJobField } from "@/lib/plain-public-route";

export const metadata: Metadata = {
    title: "About me",
    description: "개발자 소개",
};

export default async function AboutPage() {
    await redirectToOnlyPublicJobField("/about");
}
