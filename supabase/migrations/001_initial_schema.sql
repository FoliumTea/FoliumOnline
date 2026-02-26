-- ============================================================
-- 001_initial_schema.sql
-- FoliumOnline 포트폴리오 초기 스키마
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 이 파일 내용 붙여넣기 후 실행
-- ============================================================

-- ── 확장 ────────────────────────────────────────────────────
-- UUID 자동 생성을 위한 확장 (Supabase에서 기본 활성화됨)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 테이블 ──────────────────────────────────────────────────

-- 사이트 전역 설정 (컬러 스킴, 사이트명 등 key-value 저장소)
CREATE TABLE IF NOT EXISTS site_config (
    key         TEXT        PRIMARY KEY,
    value       JSONB       NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- About 페이지 데이터 (기존 about.json 구조를 JSONB로 저장)
CREATE TABLE IF NOT EXISTS about_data (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    data        JSONB       NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 이력서 데이터 (lang 별로 하나씩: 'ko', 'en')
CREATE TABLE IF NOT EXISTS resume_data (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    lang        TEXT        NOT NULL DEFAULT 'ko',
    data        JSONB       NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lang)
);

-- 블로그 포스트 (마크다운 본문을 TEXT로 저장)
CREATE TABLE IF NOT EXISTS posts (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,
    title       TEXT        NOT NULL,
    description TEXT,
    pub_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category    TEXT,
    tags        TEXT[]      NOT NULL DEFAULT '{}',
    thumbnail   TEXT,
    content     TEXT        NOT NULL DEFAULT '',
    published   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 포트폴리오 아이템
-- data 컬럼: 기존 .mdoc frontmatter의 구조화된 필드들 (startDate, endDate, keywords 등)
CREATE TABLE IF NOT EXISTS portfolio_items (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,
    title       TEXT        NOT NULL,
    description TEXT,
    tags        TEXT[]      NOT NULL DEFAULT '{}',
    thumbnail   TEXT,
    content     TEXT        NOT NULL DEFAULT '',
    data        JSONB       NOT NULL DEFAULT '{}',
    featured    BOOLEAN     NOT NULL DEFAULT FALSE,
    order_idx   INT         NOT NULL DEFAULT 0,
    published   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 인덱스 ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_slug        ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published   ON posts(published, pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category    ON posts(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_slug    ON portfolio_items(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_feat    ON portfolio_items(featured, order_idx);

-- ── updated_at 자동 갱신 트리거 ─────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_portfolio_updated_at
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_about_updated_at
    BEFORE UPDATE ON about_data
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_resume_updated_at
    BEFORE UPDATE ON resume_data
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE site_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_data      ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items  ENABLE ROW LEVEL SECURITY;

-- site_config: 누구나 읽기 / 인증된 사용자만 쓰기
CREATE POLICY "site_config_public_read"
    ON site_config FOR SELECT USING (true);

CREATE POLICY "site_config_auth_write"
    ON site_config FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- about_data: 누구나 읽기 / 인증된 사용자만 쓰기
CREATE POLICY "about_public_read"
    ON about_data FOR SELECT USING (true);

CREATE POLICY "about_auth_write"
    ON about_data FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- resume_data: 누구나 읽기 / 인증된 사용자만 쓰기
CREATE POLICY "resume_public_read"
    ON resume_data FOR SELECT USING (true);

CREATE POLICY "resume_auth_write"
    ON resume_data FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- posts: published=true 인 것만 공개 읽기 / 인증된 사용자는 전체 접근
CREATE POLICY "posts_public_read"
    ON posts FOR SELECT USING (published = true);

CREATE POLICY "posts_auth_all"
    ON posts FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- portfolio_items: published=true 인 것만 공개 읽기 / 인증된 사용자는 전체 접근
CREATE POLICY "portfolio_public_read"
    ON portfolio_items FOR SELECT USING (published = true);

CREATE POLICY "portfolio_auth_all"
    ON portfolio_items FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ── 초기 site_config 데이터 ──────────────────────────────────

INSERT INTO site_config (key, value) VALUES
    ('color_scheme', '"blue"'),
    ('site_name',    '"FoliumOnline"'),
    ('job_field',    '"game"')
ON CONFLICT (key) DO NOTHING;
