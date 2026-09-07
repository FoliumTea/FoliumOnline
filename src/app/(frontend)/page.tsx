import { redirectToOnlyPublicJobField } from "@/lib/plain-public-route";

export default async function HomePage() {
    await redirectToOnlyPublicJobField("");
}
