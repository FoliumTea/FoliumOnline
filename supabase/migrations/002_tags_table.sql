-- ============================================================
-- 002_tags_table.sql
-- 블로그 태그 테이블 (slug, 표시명, 색상)
-- posts.tags는 tag slug 배열을 저장하며, 이 테이블에서 표시명·색상 조회
-- ============================================================

CREATE TABLE IF NOT EXISTS tags (
    slug        TEXT        PRIMARY KEY,
    name        TEXT        NOT NULL,
    color       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_public_read"
    ON tags FOR SELECT USING (true);

CREATE POLICY "tags_auth_write"
    ON tags FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
