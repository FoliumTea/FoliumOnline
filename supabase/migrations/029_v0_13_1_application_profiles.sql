-- 029 · v0.13.1 · JD별 지원 프로필
-- 기본 직무 분야를 유지하면서 공개본·상속 기준본·JD별 수정사항을 분리
CREATE TABLE IF NOT EXISTS application_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  public_token text NOT NULL UNIQUE CHECK (public_token ~ '^[A-Za-z0-9_-]{22,64}$'),
  parent_job_field text NOT NULL CHECK (parent_job_field ~ '^[A-Za-z0-9_-]{1,64}$'),
  job_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'revoked')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  base_snapshot jsonb NOT NULL,
  overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  public_snapshot jsonb,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS application_profiles_status_idx
  ON application_profiles (status, updated_at DESC);

ALTER TABLE application_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE application_profiles FROM anon, authenticated;
GRANT ALL ON TABLE application_profiles TO service_role;

ALTER TABLE ai_agent_tokens
  ADD COLUMN IF NOT EXISTS permissions jsonb;

DROP POLICY IF EXISTS "site_config_public_read" ON site_config;
DROP POLICY IF EXISTS "about_public_read" ON about_data;
DROP POLICY IF EXISTS "resume_public_read" ON resume_data;
DROP POLICY IF EXISTS "posts_public_read" ON posts;
DROP POLICY IF EXISTS "post_tags_public_read" ON post_tags;
DROP POLICY IF EXISTS "post_content_revisions_public_read" ON post_content_revisions;
DROP POLICY IF EXISTS "post_content_chunks_public_read" ON post_content_chunks;
DROP POLICY IF EXISTS "portfolio_public_read" ON portfolio_items;
DROP POLICY IF EXISTS "tags_public_read" ON tags;
DROP POLICY IF EXISTS "post_categories_public_read" ON post_categories;
DROP POLICY IF EXISTS "books_public_read" ON books;
REVOKE ALL ON TABLE site_config, about_data, resume_data, posts, post_tags,
  post_content_revisions, post_content_chunks, portfolio_items, tags,
  post_categories, books FROM anon, authenticated;
GRANT ALL ON TABLE site_config, about_data, resume_data, posts, post_tags,
  post_content_revisions, post_content_chunks, portfolio_items, tags,
  post_categories, books TO service_role;

INSERT INTO site_config (key, value)
VALUES ('db_schema_version', '"0.13.1"')
ON CONFLICT (key) DO UPDATE SET value = '"0.13.1"';

-- @sqlite-sql-start
-- INSERT INTO refuge_rows (table_name, identity, row_json, updated_at)
-- VALUES ('site_config', 'db_schema_version', '{"key":"db_schema_version","value":"0.13.1"}', CURRENT_TIMESTAMP)
-- ON CONFLICT(table_name, identity) DO UPDATE SET row_json = excluded.row_json, updated_at = excluded.updated_at;
-- @sqlite-sql-end
