-- =====================================================
-- Supabase Realtime 설정 확인 및 활성화
-- =====================================================
-- 작성일: 2025-01-17
-- 설명: ad_videos 테이블의 Realtime 설정 확인 및 활성화
-- =====================================================

-- =====================================================
-- 1. Publication 확인
-- =====================================================
-- Supabase Realtime은 PostgreSQL Publication을 사용

-- supabase_realtime publication이 존재하는지 확인
SELECT
    pubname AS publication_name,
    puballtables AS all_tables
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- ad_videos 테이블이 publication에 포함되어 있는지 확인
SELECT
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'ad_videos';

-- =====================================================
-- 2. ad_videos 테이블을 Realtime Publication에 추가
-- =====================================================

-- 기존에 없다면 추가
DO $$
BEGIN
    -- ad_videos 테이블이 publication에 없으면 추가
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'ad_videos'
    ) THEN
        -- publication에 테이블 추가
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ad_videos;
        RAISE NOTICE '✅ ad_videos 테이블을 supabase_realtime publication에 추가했습니다.';
    ELSE
        RAISE NOTICE '✅ ad_videos 테이블이 이미 supabase_realtime publication에 포함되어 있습니다.';
    END IF;
END $$;

-- =====================================================
-- 3. REPLICA IDENTITY 설정 확인
-- =====================================================
-- Realtime이 UPDATE/DELETE 이벤트를 전송하려면
-- 테이블에 REPLICA IDENTITY가 설정되어야 함

-- 현재 REPLICA IDENTITY 확인
SELECT
    schemaname,
    tablename,
    CASE relreplident
        WHEN 'd' THEN 'default (primary key)'
        WHEN 'n' THEN 'nothing'
        WHEN 'f' THEN 'full'
        WHEN 'i' THEN 'index'
    END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_tables t ON t.schemaname = n.nspname AND t.tablename = c.relname
WHERE n.nspname = 'public'
AND c.relname = 'ad_videos';

-- REPLICA IDENTITY를 FULL로 설정 (모든 컬럼 변경 감지)
ALTER TABLE public.ad_videos REPLICA IDENTITY FULL;

RAISE NOTICE '✅ ad_videos 테이블의 REPLICA IDENTITY를 FULL로 설정했습니다.';

-- =====================================================
-- 4. 테스트: 수동으로 데이터 업데이트
-- =====================================================
-- 최근 ad_videos 레코드를 업데이트하여 Realtime 테스트

DO $$
DECLARE
    test_video_id UUID;
BEGIN
    -- 가장 최근 ad_videos 레코드 가져오기
    SELECT id INTO test_video_id
    FROM public.ad_videos
    ORDER BY created_at DESC
    LIMIT 1;

    IF test_video_id IS NOT NULL THEN
        -- progress_stage 업데이트 (Realtime 테스트용)
        UPDATE public.ad_videos
        SET
            progress_stage = 'ad_copy_generation',
            updated_at = NOW()
        WHERE id = test_video_id;

        RAISE NOTICE '✅ 테스트 업데이트 완료!';
        RAISE NOTICE '   Video ID: %', test_video_id;
        RAISE NOTICE '   웹 브라우저 Console에서 Realtime 로그를 확인하세요.';
    ELSE
        RAISE NOTICE '⚠️  업데이트할 ad_videos 레코드가 없습니다.';
    END IF;
END $$;

-- =====================================================
-- 5. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Supabase Realtime 설정 완료!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 설정 완료 항목:';
    RAISE NOTICE '  - ad_videos 테이블을 supabase_realtime publication에 추가';
    RAISE NOTICE '  - REPLICA IDENTITY FULL 설정';
    RAISE NOTICE '  - 테스트 업데이트 실행';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 테스트 방법:';
    RAISE NOTICE '  1. 웹 브라우저에서 업로드 페이지 열기';
    RAISE NOTICE '  2. 개발자 도구 Console 열기';
    RAISE NOTICE '  3. "영상 생성 시작" 클릭';
    RAISE NOTICE '  4. Console에서 다음 로그 확인:';
    RAISE NOTICE '     - 🔔 [Realtime] Subscribing to ad_video: ...';
    RAISE NOTICE '     - 🔌 [Realtime] Subscription status: ...';
    RAISE NOTICE '     - 📨 [Realtime] UPDATE received: ...';
    RAISE NOTICE '';
    RAISE NOTICE '💡 만약 로그가 안 보이면:';
    RAISE NOTICE '  - Supabase Dashboard → Database → Replication';
    RAISE NOTICE '  - ad_videos 테이블이 활성화되어 있는지 확인';
    RAISE NOTICE '==============================================';
END $$;