import { describe, expect, it } from "vitest";
import { validateVersionLifecycle } from "../../scripts/check-version-lifecycle.mjs";

const validate = (
    subject: string,
    previousVersion = "0.12.233",
    nextVersion = previousVersion,
    stagedFiles: { status: string; path: string; content: string }[] = []
) =>
    validateVersionLifecycle({
        previousVersion,
        nextVersion,
        subject,
        stagedFiles,
    });

describe("version lifecycle", () => {
    it("requires one patch increment for non-trivial commits", () => {
        expect(validate("feat: 기능 추가")).toContain(
            "feat commit은 package.json patch를 정확히 1 증가해야 함: 0.12.233 → 0.12.233"
        );
        expect(validate("fix: 기능 수정", "0.12.233", "0.12.234")).toEqual([]);
        expect(validate("perf: 성능 개선", "0.12.233", "0.12.235")).not.toEqual(
            []
        );
    });

    it("rejects version changes for trivial commit types", () => {
        expect(validate("docs: 문서 갱신", "0.12.233", "0.12.234")).toContain(
            "docs commit은 package.json version 변경 대상이 아님"
        );
        expect(validate("refactor: 내부 정리")).toEqual([]);
    });

    it("requires an explicit marker for major or minor releases", () => {
        expect(validate("feat: major release", "0.12.233", "1.0.0")).toContain(
            "major·minor 변경은 commit subject에 explicit release marker 필요: (v1.0.0)"
        );
        expect(
            validate("feat: major release (v1.0.0)", "0.12.233", "1.0.0")
        ).toEqual([]);
    });

    it("requires a new migration for schema source changes", () => {
        expect(
            validate("fix: schema 갱신", "0.12.233", "0.12.234", [
                {
                    status: "M",
                    path: "supabase/setup.sql",
                    content: "",
                },
            ])
        ).toContain("DB schema source 변경에는 새 Supabase migration SQL 필요");
    });

    it("requires migration and app versions to match", () => {
        const marker = `VALUES ('db_schema_version', '"0.12.234"')`;
        expect(
            validate("feat: schema 추가", "0.12.233", "0.12.234", [
                {
                    status: "A",
                    path: "supabase/migrations/029_v0_12_234_probe.sql",
                    content: marker,
                },
            ])
        ).toEqual([]);
        expect(
            validate("feat: schema 추가", "0.12.233", "0.12.234", [
                {
                    status: "A",
                    path: "supabase/migrations/029_v0_12_235_probe.sql",
                    content: marker,
                },
            ])
        ).not.toEqual([]);
    });
});
