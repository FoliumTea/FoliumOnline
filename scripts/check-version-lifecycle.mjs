import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PATCH_TYPES = new Set(["feat", "fix", "perf", "revert"]);
const TRIVIAL_TYPES = new Set([
    "refactor",
    "docs",
    "test",
    "style",
    "chore",
    "ci",
]);
const SCHEMA_SOURCE_FILES = new Set([
    "supabase/setup.sql",
    "supabase/migration-whole.sql",
    "src/lib/refuge/schema.ts",
]);
const MIGRATION_PATH_PATTERN =
    /^supabase\/migrations\/\d{3}_v(\d+(?:_\d+)*)_.+\.sql$/u;

export function parseVersion(value) {
    const match = /^(\d+)\.(\d+)\.(\d+)$/u.exec(value);
    if (!match) throw new Error(`유효하지 않은 version: ${value}`);
    return match.slice(1).map(Number);
}

export function getCommitType(subject) {
    return /^([a-z]+):\s+/u.exec(subject)?.[1] ?? null;
}

export function validateVersionLifecycle({
    previousVersion,
    nextVersion,
    subject,
    stagedFiles,
}) {
    const errors = [];
    const type = getCommitType(subject);
    const previous = parseVersion(previousVersion);
    const next = parseVersion(nextVersion);
    const versionChanged = previousVersion !== nextVersion;
    const majorMinorChanged =
        previous[0] !== next[0] || previous[1] !== next[1];
    const patchChanged = previous[2] !== next[2];

    if (!type || (!PATCH_TYPES.has(type) && !TRIVIAL_TYPES.has(type))) {
        errors.push(`지원되지 않는 commit type: ${type ?? "없음"}`);
    }

    if (PATCH_TYPES.has(type) && !majorMinorChanged) {
        if (!patchChanged || next[2] !== previous[2] + 1) {
            errors.push(
                `${type} commit은 package.json patch를 정확히 1 증가해야 함: ${previousVersion} → ${nextVersion}`
            );
        }
    }

    if (TRIVIAL_TYPES.has(type) && versionChanged) {
        errors.push(`${type} commit은 package.json version 변경 대상이 아님`);
    }

    if (majorMinorChanged && !subject.includes(`(v${nextVersion})`)) {
        errors.push(
            `major·minor 변경은 commit subject에 explicit release marker 필요: (v${nextVersion})`
        );
    }

    const migrationFiles = stagedFiles.filter((file) =>
        MIGRATION_PATH_PATTERN.test(file.path)
    );
    const addedMigrations = migrationFiles.filter(
        (file) => file.status === "A"
    );
    const schemaSourceChanged = stagedFiles.some((file) =>
        SCHEMA_SOURCE_FILES.has(file.path)
    );

    if (schemaSourceChanged && addedMigrations.length === 0) {
        errors.push("DB schema source 변경에는 새 Supabase migration SQL 필요");
    }

    if (migrationFiles.length > 0 && !PATCH_TYPES.has(type)) {
        errors.push("DB migration은 non-trivial commit type에서만 허용");
    }

    for (const migration of addedMigrations) {
        const fileVersion = migration.path
            .match(MIGRATION_PATH_PATTERN)?.[1]
            ?.replaceAll("_", ".");
        if (fileVersion !== nextVersion) {
            errors.push(
                `${migration.path} version은 package.json과 일치해야 함: ${nextVersion}`
            );
        }
        const marker = `VALUES ('db_schema_version', '"${nextVersion}"')`;
        if (!migration.content.includes(marker)) {
            errors.push(
                `${migration.path}에 현재 앱 version DB marker 필요: ${marker}`
            );
        }
    }

    return errors;
}

function git(args) {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function run() {
    const commitMessagePath = process.argv[2];
    if (!commitMessagePath) throw new Error("commit message path 필요");

    const subject = readFileSync(commitMessagePath, "utf8").split(/\r?\n/u)[0];
    const previousPackage = JSON.parse(git(["show", "HEAD:package.json"]));
    const nextPackage = JSON.parse(readFileSync("package.json", "utf8"));
    const stagedRows = git([
        "diff",
        "--cached",
        "--name-status",
        "--diff-filter=ACMR",
    ])
        .split(/\r?\n/u)
        .filter(Boolean)
        .map((line) => {
            const [status, ...pathParts] = line.split("\t");
            const path = pathParts.at(-1).replaceAll("\\", "/");
            return {
                status: status[0],
                path,
                content: path.endsWith(".sql")
                    ? readFileSync(path, "utf8")
                    : "",
            };
        });

    const errors = validateVersionLifecycle({
        previousVersion: previousPackage.version,
        nextVersion: nextPackage.version,
        subject,
        stagedFiles: stagedRows,
    });

    if (errors.length > 0) {
        console.error("[version-lifecycle] commit 차단");
        for (const error of errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }

    console.log(
        `[version-lifecycle] 통과: ${previousPackage.version} → ${nextPackage.version}`
    );
}

if (process.argv[1]?.endsWith("check-version-lifecycle.mjs")) run();
