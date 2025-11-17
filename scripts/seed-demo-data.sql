-- =====================================================
-- 데모용 샘플 데이터 생성 스크립트
-- =====================================================
-- 작성일: 2025-01-17
-- 설명: public/videos/ 폴더의 실제 샘플 영상을 사용하는 데모 데이터
-- 사용법: Supabase SQL Editor에서 실행하거나 psql로 실행
-- =====================================================

-- 기존 샘플 데이터 삭제 (필요시)
-- DELETE FROM public.ad_videos WHERE user_id LIKE 'user_demo%';
-- DELETE FROM public.product_info WHERE user_id LIKE 'user_demo%';
-- DELETE FROM public.product_images WHERE user_id LIKE 'user_demo%';
-- DELETE FROM public.users WHERE clerk_id LIKE 'user_demo%';

-- =====================================================
-- 1. 데모 사용자 추가
-- =====================================================
INSERT INTO public.users (clerk_id, name, created_at) VALUES
('user_demo_001', '데모 사용자 1', NOW() - INTERVAL '7 days'),
('user_demo_002', '데모 사용자 2', NOW() - INTERVAL '5 days'),
('user_demo_003', '데모 사용자 3', NOW() - INTERVAL '3 days')
ON CONFLICT (clerk_id) DO NOTHING;

-- =====================================================
-- 2. 샘플 영상에 매칭되는 product_images 생성
-- =====================================================
-- step1-sample.mp4 ~ step6-sample.mp4 에 해당하는 이미지 메타데이터
INSERT INTO public.product_images (id, user_id, image_url, original_filename, file_size, mime_type, status, created_at, updated_at) VALUES
-- step1-sample.mp4 - 제품 홍보영상 샘플 1
('11111111-1111-1111-1111-111111111111', 'user_demo_001', 'demo/images/sample1.jpg', 'product-sample-1.jpg', 2500000, 'image/jpeg', 'completed', NOW() - INTERVAL '6 days 23 hours', NOW() - INTERVAL '6 days 23 hours'),

-- step2-sample.mp4 - 제품 홍보영상 샘플 2
('22222222-2222-2222-2222-222222222222', 'user_demo_001', 'demo/images/sample2.jpg', 'product-sample-2.jpg', 2800000, 'image/jpeg', 'completed', NOW() - INTERVAL '6 days 20 hours', NOW() - INTERVAL '6 days 20 hours'),

-- step3-sample.mp4 - 제품 홍보영상 샘플 3
('33333333-3333-3333-3333-333333333333', 'user_demo_002', 'demo/images/sample3.jpg', 'product-sample-3.jpg', 2300000, 'image/jpeg', 'completed', NOW() - INTERVAL '4 days 18 hours', NOW() - INTERVAL '4 days 18 hours'),

-- step4-sample.mp4 - 제품 홍보영상 샘플 4
('44444444-4444-4444-4444-444444444444', 'user_demo_002', 'demo/images/sample4.jpg', 'product-sample-4.jpg', 2600000, 'image/jpeg', 'completed', NOW() - INTERVAL '4 days 12 hours', NOW() - INTERVAL '4 days 12 hours'),

-- step5-sample.mp4 - 제품 홍보영상 샘플 5
('55555555-5555-5555-5555-555555555555', 'user_demo_003', 'demo/images/sample5.jpg', 'product-sample-5.jpg', 2700000, 'image/jpeg', 'completed', NOW() - INTERVAL '2 days 10 hours', NOW() - INTERVAL '2 days 10 hours'),

-- step6-sample.mp4 - 제품 홍보영상 샘플 6
('66666666-6666-6666-6666-666666666666', 'user_demo_003', 'demo/images/sample6.jpg', 'product-sample-6.jpg', 2400000, 'image/jpeg', 'completed', NOW() - INTERVAL '2 days 6 hours', NOW() - INTERVAL '2 days 6 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. 샘플 영상에 매칭되는 product_info 생성
-- =====================================================
INSERT INTO public.product_info (id, user_id, product_name, description, category, created_at) VALUES
-- step1-sample.mp4
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_demo_001', '프리미엄 제품 샘플 1', 'AI로 생성된 고품질 홍보영상 샘플입니다', '데모/샘플', NOW() - INTERVAL '6 days 23 hours'),

-- step2-sample.mp4
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_demo_001', '프리미엄 제품 샘플 2', 'AI로 생성된 고품질 홍보영상 샘플입니다', '데모/샘플', NOW() - INTERVAL '6 days 20 hours'),

-- step3-sample.mp4
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_demo_002', '프리미엄 제품 샘플 3', 'AI로 생성된 고품질 홍보영상 샘플입니다', '데모/샘플', NOW() - INTERVAL '4 days 18 hours'),

-- step4-sample.mp4
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'user_demo_002', '프리미엄 제품 샘플 4', 'AI로 생성된 고품질 홍보영상 샘플입니다', '데모/샘플', NOW() - INTERVAL '4 days 12 hours'),

-- step5-sample.mp4
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'user_demo_003', '프리미엄 제품 샘플 5', 'AI로 생성된 고품질 홍보영상 샘플입니다', '데모/샘플', NOW() - INTERVAL '2 days 10 hours'),

-- step6-sample.mp4
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'user_demo_003', '프리미엄 제품 샘플 6', 'AI로 생성된 고품질 홍보영상 샘플입니다', '데모/샘플', NOW() - INTERVAL '2 days 6 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. 실제 샘플 영상 파일과 연결되는 ad_videos 생성
-- =====================================================
-- video_url은 Next.js public 폴더 기준 경로 사용
-- 실제 파일: public/videos/step1-sample.mp4 ~ step6-sample.mp4
INSERT INTO public.ad_videos (
    id,
    user_id,
    product_image_id,
    product_info_id,
    video_url,
    thumbnail_url,
    duration,
    file_size,
    status,
    progress_stage,
    created_at,
    completed_at
) VALUES
-- step1-sample.mp4
(
    '10000000-0000-0000-0000-000000000001',
    'user_demo_001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '/videos/step1-sample.mp4',
    NULL,
    15,
    5242880, -- 약 5MB
    'completed',
    'completed',
    NOW() - INTERVAL '6 days 23 hours',
    NOW() - INTERVAL '6 days 22 hours 55 minutes'
),

-- step2-sample.mp4
(
    '10000000-0000-0000-0000-000000000002',
    'user_demo_001',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '/videos/step2-sample.mp4',
    NULL,
    15,
    5242880,
    'completed',
    'completed',
    NOW() - INTERVAL '6 days 20 hours',
    NOW() - INTERVAL '6 days 19 hours 55 minutes'
),

-- step3-sample.mp4
(
    '10000000-0000-0000-0000-000000000003',
    'user_demo_002',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '/videos/step3-sample.mp4',
    NULL,
    15,
    5242880,
    'completed',
    'completed',
    NOW() - INTERVAL '4 days 18 hours',
    NOW() - INTERVAL '4 days 17 hours 55 minutes'
),

-- step4-sample.mp4
(
    '10000000-0000-0000-0000-000000000004',
    'user_demo_002',
    '44444444-4444-4444-4444-444444444444',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '/videos/step4-sample.mp4',
    NULL,
    15,
    5242880,
    'completed',
    'completed',
    NOW() - INTERVAL '4 days 12 hours',
    NOW() - INTERVAL '4 days 11 hours 55 minutes'
),

-- step5-sample.mp4
(
    '10000000-0000-0000-0000-000000000005',
    'user_demo_003',
    '55555555-5555-5555-5555-555555555555',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '/videos/step5-sample.mp4',
    NULL,
    15,
    5242880,
    'completed',
    'completed',
    NOW() - INTERVAL '2 days 10 hours',
    NOW() - INTERVAL '2 days 9 hours 55 minutes'
),

-- step6-sample.mp4
(
    '10000000-0000-0000-0000-000000000006',
    'user_demo_003',
    '66666666-6666-6666-6666-666666666666',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '/videos/step6-sample.mp4',
    NULL,
    15,
    5242880,
    'completed',
    'completed',
    NOW() - INTERVAL '2 days 6 hours',
    NOW() - INTERVAL '2 days 5 hours 55 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. 추가 데모 데이터 (다양한 상태 표시용)
-- =====================================================
-- 진행 중인 영상 (progress_stage 다양하게)
INSERT INTO public.product_images (id, user_id, image_url, original_filename, file_size, mime_type, status, created_at, updated_at) VALUES
('77777777-7777-7777-7777-777777777777', 'user_demo_001', 'demo/images/processing1.jpg', 'processing-1.jpg', 2100000, 'image/jpeg', 'processing', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('88888888-8888-8888-8888-888888888888', 'user_demo_002', 'demo/images/processing2.jpg', 'processing-2.jpg', 2200000, 'image/jpeg', 'processing', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('99999999-9999-9999-9999-999999999999', 'user_demo_003', 'demo/images/failed1.jpg', 'failed-1.jpg', 2000000, 'image/jpeg', 'failed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_info (id, user_id, product_name, description, category, created_at) VALUES
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'user_demo_001', '처리 중인 제품 1', '현재 AI 영상 생성 중입니다', '데모/진행중', NOW() - INTERVAL '30 minutes'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'user_demo_002', '처리 중인 제품 2', '현재 AI 영상 생성 중입니다', '데모/진행중', NOW() - INTERVAL '1 hour'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'user_demo_003', '실패한 제품 1', '영상 생성 중 오류가 발생했습니다', '데모/실패', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 진행 중인 영상들
INSERT INTO public.ad_videos (
    id,
    user_id,
    product_image_id,
    product_info_id,
    video_url,
    thumbnail_url,
    duration,
    file_size,
    status,
    progress_stage,
    error_message,
    created_at,
    completed_at
) VALUES
-- 광고문구 생성 중
(
    '10000000-0000-0000-0000-000000000007',
    'user_demo_001',
    '77777777-7777-7777-7777-777777777777',
    'gggggggg-gggg-gggg-gggg-gggggggggggg',
    NULL,
    NULL,
    NULL,
    NULL,
    'processing',
    'ad_copy_generation',
    NULL,
    NOW() - INTERVAL '30 minutes',
    NULL
),

-- 영상 생성 중
(
    '10000000-0000-0000-0000-000000000008',
    'user_demo_002',
    '88888888-8888-8888-8888-888888888888',
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
    NULL,
    NULL,
    NULL,
    NULL,
    'processing',
    'video_generation',
    NULL,
    NOW() - INTERVAL '1 hour',
    NULL
),

-- 실패한 영상
(
    '10000000-0000-0000-0000-000000000009',
    'user_demo_003',
    '99999999-9999-9999-9999-999999999999',
    'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
    NULL,
    NULL,
    NULL,
    NULL,
    'failed',
    'video_generation',
    'Veo 3.1 API 타임아웃: 영상 생성 중 연결이 끊어졌습니다. 다시 시도해주세요.',
    NOW() - INTERVAL '2 hours',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. 완료 메시지 및 확인 쿼리
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '데모 샘플 데이터 생성 완료!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '생성된 데이터:';
    RAISE NOTICE '  - 데모 사용자: 3명';
    RAISE NOTICE '  - 완성된 샘플 영상: 6개 (step1~step6-sample.mp4)';
    RAISE NOTICE '  - 진행 중인 영상: 2개';
    RAISE NOTICE '  - 실패한 영상: 1개';
    RAISE NOTICE '';
    RAISE NOTICE '샘플 영상 URL:';
    RAISE NOTICE '  - /videos/step1-sample.mp4';
    RAISE NOTICE '  - /videos/step2-sample.mp4';
    RAISE NOTICE '  - /videos/step3-sample.mp4';
    RAISE NOTICE '  - /videos/step4-sample.mp4';
    RAISE NOTICE '  - /videos/step5-sample.mp4';
    RAISE NOTICE '  - /videos/step6-sample.mp4';
    RAISE NOTICE '';
    RAISE NOTICE '확인 방법:';
    RAISE NOTICE '  1. 홈페이지: 샘플 영상 섹션에서 확인';
    RAISE NOTICE '  2. 대시보드: 로그인 후 /dashboard에서 확인';
    RAISE NOTICE '  3. SQL 쿼리로 확인:';
    RAISE NOTICE '     SELECT * FROM ad_videos WHERE user_id LIKE ''user_demo%'';';
    RAISE NOTICE '==============================================';
END $$;

-- 데이터 확인 쿼리
SELECT
    av.id,
    av.user_id,
    pf.product_name,
    av.video_url,
    av.duration,
    av.status,
    av.progress_stage,
    av.created_at
FROM
    public.ad_videos av
JOIN
    public.product_info pf ON av.product_info_id = pf.id
WHERE
    av.user_id LIKE 'user_demo%'
ORDER BY
    av.created_at DESC;
