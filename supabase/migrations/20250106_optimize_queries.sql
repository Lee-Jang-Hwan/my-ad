-- =====================================================
-- 데이터베이스 쿼리 최적화 마이그레이션
-- =====================================================
-- 작성일: 2025-01-06
-- 설명: 복합 인덱스 추가 및 쿼리 성능 최적화
-- =====================================================

-- =====================================================
-- 1. ad_videos 테이블 복합 인덱스
-- =====================================================
-- 대시보드 쿼리 최적화: user_id + status + created_at
-- WHERE user_id = ? AND status = ? ORDER BY created_at DESC 쿼리에 최적화됨

CREATE INDEX IF NOT EXISTS idx_ad_videos_user_status_created
ON public.ad_videos(user_id, status, created_at DESC);

COMMENT ON INDEX idx_ad_videos_user_status_created IS
'대시보드 필터링 및 정렬 최적화를 위한 복합 인덱스';

-- =====================================================
-- 2. product_info 테이블 복합 인덱스
-- =====================================================
-- JOIN 성능 향상: id + user_id
-- ad_videos와 product_info JOIN 시 사용

CREATE INDEX IF NOT EXISTS idx_product_info_id_user
ON public.product_info(id, user_id);

COMMENT ON INDEX idx_product_info_id_user IS
'ad_videos와의 JOIN 성능 최적화';

-- =====================================================
-- 3. product_images 테이블 복합 인덱스
-- =====================================================
-- 사용자별 최근 이미지 조회 최적화

CREATE INDEX IF NOT EXISTS idx_product_images_user_created
ON public.product_images(user_id, created_at DESC);

COMMENT ON INDEX idx_product_images_user_created IS
'사용자별 최근 이미지 조회 최적화';

-- =====================================================
-- 4. 통계 정보 갱신
-- =====================================================
-- PostgreSQL의 쿼리 플래너가 최신 통계를 사용하도록 함

ANALYZE public.ad_videos;
ANALYZE public.product_info;
ANALYZE public.product_images;

-- =====================================================
-- 5. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '데이터베이스 쿼리 최적화 완료!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '추가된 인덱스:';
    RAISE NOTICE '  - idx_ad_videos_user_status_created (복합)';
    RAISE NOTICE '  - idx_product_info_id_user (복합)';
    RAISE NOTICE '  - idx_product_images_user_created (복합)';
    RAISE NOTICE '';
    RAISE NOTICE '최적화 효과:';
    RAISE NOTICE '  - 대시보드 필터링 쿼리 성능 향상';
    RAISE NOTICE '  - JOIN 연산 성능 향상';
    RAISE NOTICE '  - 정렬 작업 성능 향상';
    RAISE NOTICE '==============================================';
END $$;
