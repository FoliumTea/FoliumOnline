import type { Metadata } from "next";
import { redirectToOnlyPublicJobField } from "@/lib/plain-public-route";

export const metadata: Metadata = {
    title: "Resume",
    description: "이력서",
};

export default async function ResumePage() {
    await redirectToOnlyPublicJobField("/resume");
}
