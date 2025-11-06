-- =====================================================
-- AI 홍보영상 자동 생성 서비스 - Storage 버킷 설정
-- =====================================================
-- 작성일: 2025-01-06
-- 설명: Supabase Storage 버킷 생성 및 정책 설정
-- - uploads: 사용자가 업로드한 원본 이미지 저장
-- - videos: n8n이 생성한 최종 영상 저장
-- =====================================================

-- =====================================================
-- 1. 버킷 생성 안내 (수동 생성 필요)
-- =====================================================
-- ⚠️ 중요: Storage 버킷은 SQL로 생성할 수 없습니다.
-- Supabase Dashboard에서 수동으로 생성해야 합니다.
--
-- 📋 버킷 생성 방법:
-- 1. Supabase Dashboard 접속 → Storage 메뉴
-- 2. "New bucket" 버튼 클릭
-- 3. 아래 설정으로 두 개의 버킷 생성:
--
-- ┌─────────────────────────────────────────────────┐
-- │ Bucket 1: uploads                               │
-- ├─────────────────────────────────────────────────┤
-- │ Name: uploads                                   │
-- │ Public bucket: ✓ (체크)                         │
-- │ File size limit: 10485760 (10MB)                │
-- │ Allowed MIME types:                             │
-- │   - image/jpeg                                  │
-- │   - image/png                                   │
-- │   - image/jpg                                   │
-- │   - image/webp                                  │
-- └─────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────┐
-- │ Bucket 2: videos                                │
-- ├─────────────────────────────────────────────────┤
-- │ Name: videos                                    │
-- │ Public bucket: ✓ (체크)                         │
-- │ File size limit: 52428800 (50MB)                │
-- │ Allowed MIME types:                             │
-- │   - video/mp4                                   │
-- │   - video/webm                                  │
-- │   - video/quicktime                             │
-- └─────────────────────────────────────────────────┘
--
-- 경로 구조:
--   uploads: {clerk_user_id}/images/{filename}
--   예시: user_test001/images/coffee-latte-001.jpg
--
--   videos: {clerk_user_id}/videos/{video_id}.mp4
--   예시: user_test001/videos/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp4
--
-- =====================================================

-- 버킷 존재 확인
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads') THEN
        RAISE EXCEPTION '❌ "uploads" 버킷이 존재하지 않습니다. Supabase Dashboard에서 먼저 생성해주세요.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos') THEN
        RAISE EXCEPTION '❌ "videos" 버킷이 존재하지 않습니다. Supabase Dashboard에서 먼저 생성해주세요.';
    END IF;

    RAISE NOTICE '✅ uploads 버킷 확인됨';
    RAISE NOTICE '✅ videos 버킷 확인됨';
END $$;

-- =====================================================
-- 2. Storage RLS 정책 설정
-- =====================================================
-- PRD에 따라 RLS를 사용하지 않음 (서버 사이드에서 권한 체크)

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Allow all uploads for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all videos for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role to update videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on videos" ON storage.objects;

-- uploads 버킷: 모든 작업 허용 (개발 모드)
CREATE POLICY "Allow all operations on uploads"
ON storage.objects
FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- videos 버킷: 모든 작업 허용 (개발 모드)
CREATE POLICY "Allow all operations on videos"
ON storage.objects
FOR ALL
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- =====================================================
-- 3. 샘플 데이터용 더미 파일 경로 생성 (선택 사항)
-- =====================================================
-- 실제 파일은 없지만, 데이터베이스에는 경로가 저장되어 있음
-- 개발 중에는 이 경로들을 placeholder로 사용

-- uploads 버킷 샘플 객체 메타데이터
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
SELECT
    'uploads',
    'user_test001/images/coffee-latte-001.jpg',
    NULL,
    '{"mimetype": "image/jpeg", "size": 2457600}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = 'uploads'
    AND name = 'user_test001/images/coffee-latte-001.jpg'
);

-- videos 버킷 샘플 객체 메타데이터 (첫 번째 완료된 영상)
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
SELECT
    'videos',
    pi.user_id || '/videos/' || pi.id || '.mp4',
    NULL,
    jsonb_build_object(
        'mimetype', 'video/mp4',
        'size', (15000000 + (RANDOM() * 10000000)::INTEGER)
    )
FROM public.product_images pi
WHERE pi.status = 'completed'
LIMIT 5
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. 버킷 정보 확인용 뷰 생성
-- =====================================================
-- 개발자가 쉽게 버킷 정보를 확인할 수 있도록 뷰 생성

CREATE OR REPLACE VIEW public.storage_bucket_info AS
SELECT
    b.id AS bucket_id,
    b.name AS bucket_name,
    b.public AS is_public,
    b.file_size_limit,
    b.allowed_mime_types,
    COUNT(o.id) AS object_count,
    COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) AS total_size_bytes,
    pg_size_pretty(COALESCE(SUM((o.metadata->>'size')::BIGINT), 0)) AS total_size_readable
FROM
    storage.buckets b
LEFT JOIN
    storage.objects o ON b.id = o.bucket_id
WHERE
    b.id IN ('uploads', 'videos')
GROUP BY
    b.id, b.name, b.public, b.file_size_limit, b.allowed_mime_types;

-- 뷰 권한 부여
GRANT SELECT ON public.storage_bucket_info TO authenticated;
GRANT SELECT ON public.storage_bucket_info TO service_role;

-- 뷰 주석
COMMENT ON VIEW public.storage_bucket_info IS 'Storage 버킷 정보 요약 (uploads, videos)';

-- =====================================================
-- 5. 개발용 헬퍼 함수
-- =====================================================
-- 파일 경로 생성 헬퍼 함수

-- 이미지 업로드 경로 생성
CREATE OR REPLACE FUNCTION public.generate_upload_path(
    p_user_id TEXT,
    p_filename TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN p_user_id || '/images/' || p_filename;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 영상 저장 경로 생성
CREATE OR REPLACE FUNCTION public.generate_video_path(
    p_user_id TEXT,
    p_video_id UUID
) RETURNS TEXT AS $$
BEGIN
    RETURN p_user_id || '/videos/' || p_video_id::TEXT || '.mp4';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 썸네일 경로 생성
CREATE OR REPLACE FUNCTION public.generate_thumbnail_path(
    p_user_id TEXT,
    p_video_id UUID
) RETURNS TEXT AS $$
BEGIN
    RETURN p_user_id || '/videos/thumbnails/' || p_video_id::TEXT || '.jpg';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 함수 주석
COMMENT ON FUNCTION public.generate_upload_path IS '이미지 업로드 경로 생성: {user_id}/images/{filename}';
COMMENT ON FUNCTION public.generate_video_path IS '영상 경로 생성: {user_id}/videos/{video_id}.mp4';
COMMENT ON FUNCTION public.generate_thumbnail_path IS '썸네일 경로 생성: {user_id}/videos/thumbnails/{video_id}.jpg';

-- =====================================================
-- 6. Storage 용량 체크 함수
-- =====================================================
-- 사용자별 스토리지 사용량 확인

CREATE OR REPLACE FUNCTION public.get_user_storage_usage(
    p_user_id TEXT
) RETURNS TABLE (
    user_id TEXT,
    uploads_count BIGINT,
    uploads_size_bytes BIGINT,
    uploads_size_readable TEXT,
    videos_count BIGINT,
    videos_size_bytes BIGINT,
    videos_size_readable TEXT,
    total_size_bytes BIGINT,
    total_size_readable TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH uploads_stats AS (
        SELECT
            COUNT(o.id) AS count,
            COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) AS size
        FROM storage.objects o
        WHERE o.bucket_id = 'uploads'
        AND o.name LIKE p_user_id || '/%'
    ),
    videos_stats AS (
        SELECT
            COUNT(o.id) AS count,
            COALESCE(SUM((o.metadata->>'size')::BIGINT), 0) AS size
        FROM storage.objects o
        WHERE o.bucket_id = 'videos'
        AND o.name LIKE p_user_id || '/%'
    )
    SELECT
        p_user_id,
        u.count,
        u.size,
        pg_size_pretty(u.size),
        v.count,
        v.size,
        pg_size_pretty(v.size),
        u.size + v.size,
        pg_size_pretty(u.size + v.size)
    FROM uploads_stats u, videos_stats v;
END;
$$ LANGUAGE plpgsql;

-- 함수 주석
COMMENT ON FUNCTION public.get_user_storage_usage IS '사용자별 스토리지 사용량 확인 (uploads + videos)';

-- =====================================================
-- 7. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Supabase Storage 정책 설정 완료!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 설정 완료 항목:';
    RAISE NOTICE '  - RLS 정책 (uploads/videos: 모든 작업 허용)';
    RAISE NOTICE '  - 헬퍼 함수 (경로 생성, 용량 체크)';
    RAISE NOTICE '  - 뷰 (storage_bucket_info)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 헬퍼 함수:';
    RAISE NOTICE '  - generate_upload_path(user_id, filename)';
    RAISE NOTICE '  - generate_video_path(user_id, video_id)';
    RAISE NOTICE '  - generate_thumbnail_path(user_id, video_id)';
    RAISE NOTICE '  - get_user_storage_usage(user_id)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 뷰:';
    RAISE NOTICE '  - storage_bucket_info (버킷 정보 요약)';
    RAISE NOTICE '';
    RAISE NOTICE '💡 사용 예시:';
    RAISE NOTICE '  SELECT * FROM storage_bucket_info;';
    RAISE NOTICE '  SELECT * FROM get_user_storage_usage(''user_test001'');';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Phase 1 데이터베이스 설정 완료!';
    RAISE NOTICE '   다음 단계: Phase 2 - 업로드 페이지 UI 개발';
    RAISE NOTICE '==============================================';
END $$;
