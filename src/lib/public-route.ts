import {
    getPublicJobFields,
    resolvePublicJobField,
    type PublicJobField,
} from "@/lib/public-job-field";
import { getApplicationProfileByToken } from "@/lib/application-profile";
import type { ApplicationProfile } from "@/types/application-profile";

export type PublicRouteTarget =
    | { kind: "job-field"; jobField: PublicJobField }
    | { kind: "application-profile"; profile: ApplicationProfile };

/** 등록 직무 분야를 우선해 공개 URL 대상을 해석 */
export async function resolvePublicRouteTarget(
    value: string
): Promise<PublicRouteTarget | null> {
    const jobField = await resolvePublicJobField(value);
    if (jobField) return { kind: "job-field", jobField };

    const profile = await getApplicationProfileByToken(value);
    return profile ? { kind: "application-profile", profile } : null;
}

/** 공개 직무 분야가 하나일 때만 기본 경로의 이동 대상 반환 */
export function getOnlyPublicJobField(
    jobFields: readonly PublicJobField[]
): PublicJobField | null {
    return jobFields.length === 1 ? jobFields[0] : null;
}

export async function getOnlyConfiguredPublicJobField(): Promise<PublicJobField | null> {
    return getOnlyPublicJobField(await getPublicJobFields());
}
