-- SEO 관련 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS og_image TEXT;

-- 전역 SEO 기본 설정 추가
INSERT INTO site_config (key, value) VALUES (
    'seo_config', 
    '{"default_title": "FoliumOnline", "default_description": "포트폴리오 & 기술 블로그", "default_og_image": ""}'
) ON CONFLICT (key) DO NOTHING;
