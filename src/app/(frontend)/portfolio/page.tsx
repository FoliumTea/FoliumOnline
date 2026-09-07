import type { Metadata } from "next";
import { redirectToOnlyPublicJobField } from "@/lib/plain-public-route";

export const metadata: Metadata = {
    title: "Portfolio",
    description: "프로젝트 포트폴리오",
};

export default async function PortfolioPage() {
    await redirectToOnlyPublicJobField("/portfolio");
}
