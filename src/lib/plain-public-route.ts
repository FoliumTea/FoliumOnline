import { notFound, redirect } from "next/navigation";
import { getOnlyConfiguredPublicJobField } from "@/lib/public-route";

/** 단일 공개 직무 분야만 존재할 때 기본 경로를 해당 분야로 이동 */
export async function redirectToOnlyPublicJobField(
    path: string
): Promise<never> {
    const jobField = await getOnlyConfiguredPublicJobField();
    if (!jobField) notFound();
    redirect(`/${jobField.id}${path}`);
}
