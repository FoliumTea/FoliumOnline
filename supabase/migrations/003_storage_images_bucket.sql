-- ============================================================
-- 003_storage_images_bucket.sql
-- 블로그/포트폴리오 본문 이미지 업로드용 Storage 버킷
--
-- 실행: Supabase 대시보드 → SQL Editor → 붙여넣기 후 실행
-- ============================================================

-- 버킷 생성: images (공개 읽기, 인증된 사용자만 업로드)
-- 참고: file_size_limit 등은 Supabase 대시보드에서 추가 설정 가능
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS 정책 (기존 정책이 있으면 제거 후 재생성)
DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "images_auth_upload" ON storage.objects;
DROP POLICY IF EXISTS "images_auth_delete" ON storage.objects;

-- RLS: 누구나 읽기 (public bucket)
CREATE POLICY "images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- RLS: 인증된 사용자만 업로드
CREATE POLICY "images_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- RLS: 인증된 사용자만 삭제 (본인이 업로드한 파일)
CREATE POLICY "images_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
