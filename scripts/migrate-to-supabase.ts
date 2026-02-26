/**
 * migrate-to-supabase.ts
 *
 * 기존 로컬 파일 콘텐츠를 Supabase로 일괄 마이그레이션하는 스크립트.
 *   - src/data/about.json     → about_data 테이블
 *   - src/data/resume.json    → resume_data 테이블 (lang: 'ko')
 *   - src/data/resume_en.json → resume_data 테이블 (lang: 'en')
 *   - src/content/posts/*.mdoc    → posts 테이블
 *   - src/content/portfolio/*.mdoc → portfolio_items 테이블
 *
 * 실행 방법:
 *   1. .env.local 에 SUPABASE_SERVICE_ROLE_KEY 포함 모든 env 설정
 *   2. pnpm tsx scripts/migrate-to-supabase.ts
 *
 * 주의: 이 스크립트는 upsert를 사용하므로 중복 실행해도 안전하다.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

// ── 환경변수 로드 (tsx가 .env.local을 자동으로 읽지 않으므로 수동 파싱) ─
function loadEnv(): void {
    const envPath = join(process.cwd(), ".env.local");
    try {
        const raw = readFileSync(envPath, "utf-8");
        for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) process.env[key] = val;
        }
    } catch {
        console.error("❌ .env.local 파일을 읽을 수 없습니다.");
        process.exit(1);
    }
}

loadEnv();

const url = process.env.PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !key) {
    console.error(
        "❌ PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다."
    );
    process.exit(1);
}

const supabase = createClient(url, key);

// ── .mdoc 파일 파서 ─────────────────────────────────────────
// frontmatter(---..---) 와 본문(content)을 분리한다.
function parseMdoc(raw: string): {
    frontmatter: Record<string, unknown>;
    content: string;
} {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { frontmatter: {}, content: raw };

    const fm: Record<string, unknown> = {};
    const yamlText = match[1];
    const content = match[2].trim();

    // 최소한의 YAML 파서 (배열·중첩 제한, 단순 key: value 처리)
    let i = 0;
    const lines = yamlText.split("\n");
    while (i < lines.length) {
        const line = lines[i];
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) {
            i++;
            continue;
        }

        const key = line.slice(0, colonIdx).trim();
        const rest = line.slice(colonIdx + 1).trim();

        if (rest === "" || rest === "|" || rest === ">") {
            // 다음 줄이 배열 항목인지 확인
            const items: string[] = [];
            i++;
            while (i < lines.length && lines[i].startsWith("  - ")) {
                items.push(
                    lines[i]
                        .replace(/^  - /, "")
                        .trim()
                        .replace(/^['"]|['"]$/g, "")
                );
                i++;
            }
            fm[key] = items.length > 0 ? items : undefined;
        } else {
            // 큰따옴표·작은따옴표 제거
            fm[key] = rest.replace(/^['"]|['"]$/g, "");
            i++;
        }
    }

    return { frontmatter: fm, content };
}

// ── 헬퍼: slug 추출 (파일명에서 .mdoc 제거) ────────────────
function toSlug(filename: string): string {
    return basename(filename, ".mdoc");
}

// ── 1. about.json 마이그레이션 ──────────────────────────────
async function migrateAbout(): Promise<void> {
    console.log("\n📄 about.json 마이그레이션 중...");
    const raw = readFileSync(
        join(process.cwd(), "src/data/about.json"),
        "utf-8"
    );
    const data = JSON.parse(raw);

    // 기존 행을 모두 삭제하고 새로 삽입 (단일 행 유지)
    await supabase
        .from("about_data")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("about_data").insert({ data });
    if (error) throw new Error(`about_data 삽입 실패: ${error.message}`);
    console.log("  ✅ about_data 저장 완료");
}

// ── 2. resume.json 마이그레이션 ─────────────────────────────
async function migrateResume(): Promise<void> {
    console.log("\n📄 resume.json / resume_en.json 마이그레이션 중...");

    for (const [lang, filename] of [
        ["ko", "resume.json"],
        ["en", "resume_en.json"],
    ] as const) {
        try {
            const raw = readFileSync(
                join(process.cwd(), "src/data", filename),
                "utf-8"
            );
            const data = JSON.parse(raw);
            const { error } = await supabase
                .from("resume_data")
                .upsert({ lang, data }, { onConflict: "lang" });
            if (error)
                throw new Error(
                    `resume_data(${lang}) 삽입 실패: ${error.message}`
                );
            console.log(`  ✅ resume_data(${lang}) 저장 완료`);
        } catch (e: unknown) {
            if ((e as NodeJS.ErrnoException).code === "ENOENT") {
                console.log(`  ⚠️  ${filename} 파일 없음, 건너뜀`);
            } else {
                throw e;
            }
        }
    }
}

// ── 3. posts/*.mdoc 마이그레이션 ────────────────────────────
async function migratePosts(): Promise<void> {
    console.log("\n📝 블로그 포스트 마이그레이션 중...");
    const dir = join(process.cwd(), "src/content/posts");
    const files = readdirSync(dir).filter((f) => f.endsWith(".mdoc"));

    for (const file of files) {
        const slug = toSlug(file);
        const raw = readFileSync(join(dir, file), "utf-8");
        const { frontmatter: fm, content } = parseMdoc(raw);

        const record = {
            slug,
            title: (fm.title as string) ?? slug,
            description: (fm.description as string | undefined) ?? null,
            pub_date:
                (fm.pubDate as string | undefined) ?? new Date().toISOString(),
            category: (fm.category as string | undefined) ?? null,
            tags: (fm.tags as string[] | undefined) ?? [],
            thumbnail: (fm.thumbnail as string | undefined) ?? null,
            content,
            published: true, // 기존 파일은 모두 공개 상태로 마이그레이션
        };

        const { error } = await supabase
            .from("posts")
            .upsert(record, { onConflict: "slug" });
        if (error) {
            console.error(`  ❌ ${slug} 저장 실패: ${error.message}`);
        } else {
            console.log(`  ✅ ${slug}`);
        }
    }
}

// ── 4. portfolio/*.mdoc 마이그레이션 ────────────────────────
async function migratePortfolio(): Promise<void> {
    console.log("\n🗂️  포트폴리오 마이그레이션 중...");
    const dir = join(process.cwd(), "src/content/portfolio");
    const files = readdirSync(dir).filter((f) => f.endsWith(".mdoc"));

    for (const [idx, file] of files.entries()) {
        const slug = toSlug(file);
        const raw = readFileSync(join(dir, file), "utf-8");
        const { frontmatter: fm, content } = parseMdoc(raw);

        // 구조화된 필드 외 나머지 frontmatter는 data JSONB에 보관
        const {
            title,
            description,
            keywords,
            thumbnail,
            public: isPublic,
            ...rest
        } = fm as Record<string, unknown>;

        const record = {
            slug,
            title: (title as string) ?? slug,
            description: (description as string | undefined) ?? null,
            tags: (keywords as string[] | undefined) ?? [],
            thumbnail: (thumbnail as string | undefined) ?? null,
            content,
            data: rest, // startDate, endDate, goal, role, teamSize 등 보존
            featured: false,
            order_idx: idx,
            published: isPublic !== false,
        };

        const { error } = await supabase
            .from("portfolio_items")
            .upsert(record, { onConflict: "slug" });
        if (error) {
            console.error(`  ❌ ${slug} 저장 실패: ${error.message}`);
        } else {
            console.log(`  ✅ ${slug}`);
        }
    }
}

// ── 메인 ─────────────────────────────────────────────────────
async function main(): Promise<void> {
    console.log("🚀 Supabase 마이그레이션 시작\n");
    console.log(`  URL: ${url}`);

    await migrateAbout();
    await migrateResume();
    await migratePosts();
    await migratePortfolio();

    console.log("\n🎉 마이그레이션 완료!");
    console.log("   다음 단계: Supabase 대시보드에서 데이터를 확인하세요.");
}

main().catch((e) => {
    console.error("❌ 마이그레이션 중 오류:", e);
    process.exit(1);
});
