-- =====================================================
-- AI 홍보영상 자동 생성 서비스 - 데이터베이스 스키마
-- =====================================================
-- 작성일: 2025-01-06
-- 설명: 홍보영상 생성 워크플로우를 위한 테이블 생성
-- - users: Clerk 인증과 연동되는 사용자 정보
-- - product_images: 사용자가 업로드한 원본 이미지
-- - product_info: 상품 정보 (상품명, 설명 등)
-- - ad_videos: 생성된 홍보영상 정보 및 진행 상태
-- - n8n_workflows: n8n 워크플로우 관리 (추후 확장용)
-- =====================================================

-- =====================================================
-- 0. users 테이블 (선행 필수)
-- =====================================================
-- Clerk 인증과 연동되는 사용자 정보를 저장하는 테이블
-- 이 테이블이 없으면 다른 테이블들의 외래키 참조가 실패합니다

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.users OWNER TO postgres;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- Row Level Security (RLS) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용 (개발 모드)
CREATE POLICY "Allow all operations for users"
ON public.users
FOR ALL
USING (true)
WITH CHECK (true);

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- 테이블 주석
COMMENT ON TABLE public.users IS 'Clerk 인증과 연동되는 사용자 정보';
COMMENT ON COLUMN public.users.clerk_id IS 'Clerk에서 발급한 고유 사용자 ID';

-- =====================================================
-- 1. product_images 테이블
-- =====================================================
-- 사용자가 업로드한 원본 이미지를 저장
-- Supabase Storage에 실제 파일을 저장하고, 메타데이터를 이 테이블에 저장

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, -- Supabase Storage 경로 (예: clerk_user_id/images/filename.jpg)
    original_filename TEXT NOT NULL,
    file_size INTEGER CHECK (file_size > 0 AND file_size <= 10485760), -- 최대 10MB
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/jpg', 'image/webp')),
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.product_images OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_product_images_user_id ON public.product_images(user_id);
CREATE INDEX IF NOT EXISTS idx_product_images_status ON public.product_images(status);
CREATE INDEX IF NOT EXISTS idx_product_images_created_at ON public.product_images(created_at DESC);

-- Row Level Security (RLS) 명시적 비활성화
-- PRD에 따라 서버 사이드에서 권한 체크를 수행하므로 RLS는 사용하지 않음
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용 (개발 편의성)
CREATE POLICY "Allow all operations for product_images"
ON public.product_images
FOR ALL
USING (true)
WITH CHECK (true);

-- 권한 부여
GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;

-- 테이블 주석
COMMENT ON TABLE public.product_images IS '사용자가 업로드한 원본 이미지 메타데이터';
COMMENT ON COLUMN public.product_images.user_id IS 'Clerk 사용자 ID';
COMMENT ON COLUMN public.product_images.image_url IS 'Supabase Storage 경로';
COMMENT ON COLUMN public.product_images.file_size IS '파일 크기 (bytes, 최대 10MB)';
COMMENT ON COLUMN public.product_images.status IS '이미지 상태: uploaded, processing, completed, failed';

-- =====================================================
-- 2. product_info 테이블
-- =====================================================
-- 상품 정보 (상품명, 설명, 카테고리 등)

CREATE TABLE IF NOT EXISTS public.product_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    product_name TEXT NOT NULL CHECK (length(product_name) >= 1 AND length(product_name) <= 200),
    description TEXT CHECK (length(description) <= 1000), -- 추후 확장용
    category TEXT CHECK (length(category) <= 100), -- 추후 확장용
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.product_info OWNER TO postgres;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_info_user_id ON public.product_info(user_id);
CREATE INDEX IF NOT EXISTS idx_product_info_product_name ON public.product_info(product_name);
CREATE INDEX IF NOT EXISTS idx_product_info_category ON public.product_info(category);
CREATE INDEX IF NOT EXISTS idx_product_info_created_at ON public.product_info(created_at DESC);

-- Row Level Security (RLS) 명시적 비활성화
ALTER TABLE public.product_info ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용
CREATE POLICY "Allow all operations for product_info"
ON public.product_info
FOR ALL
USING (true)
WITH CHECK (true);

-- 권한 부여
GRANT ALL ON TABLE public.product_info TO anon;
GRANT ALL ON TABLE public.product_info TO authenticated;
GRANT ALL ON TABLE public.product_info TO service_role;

-- 테이블 주석
COMMENT ON TABLE public.product_info IS '상품 정보 (상품명, 설명, 카테고리)';
COMMENT ON COLUMN public.product_info.product_name IS '상품명 (1-200자)';
COMMENT ON COLUMN public.product_info.description IS '상품 설명 (최대 1000자, 추후 확장용)';
COMMENT ON COLUMN public.product_info.category IS '카테고리 (최대 100자, 추후 확장용)';

-- =====================================================
-- 3. ad_videos 테이블
-- =====================================================
-- 생성된 홍보영상 정보 및 n8n 워크플로우 진행 상태

CREATE TABLE IF NOT EXISTS public.ad_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    product_image_id UUID REFERENCES public.product_images(id) ON DELETE SET NULL,
    product_info_id UUID REFERENCES public.product_info(id) ON DELETE SET NULL,
    video_url TEXT, -- Supabase Storage 경로 (최종 영상)
    thumbnail_url TEXT, -- 썸네일 이미지
    duration INTEGER CHECK (duration >= 0 AND duration <= 600), -- 영상 길이 (초, 최대 10분)
    file_size INTEGER CHECK (file_size > 0), -- 파일 크기 (bytes)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress_stage TEXT DEFAULT 'init' CHECK (
        progress_stage IN (
            'init',
            'ad_copy_generation',
            'image_refinement',
            'video_generation',
            'tts_generation',
            'subtitle_generation',
            'merging',
            'completed'
        )
    ),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 테이블 소유자 설정
ALTER TABLE public.ad_videos OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_ad_videos_user_id ON public.ad_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_videos_product_image_id ON public.ad_videos(product_image_id);
CREATE INDEX IF NOT EXISTS idx_ad_videos_product_info_id ON public.ad_videos(product_info_id);
CREATE INDEX IF NOT EXISTS idx_ad_videos_status ON public.ad_videos(status);
CREATE INDEX IF NOT EXISTS idx_ad_videos_progress_stage ON public.ad_videos(progress_stage);
CREATE INDEX IF NOT EXISTS idx_ad_videos_created_at ON public.ad_videos(created_at DESC);

-- Row Level Security (RLS) 명시적 비활성화
ALTER TABLE public.ad_videos ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용
CREATE POLICY "Allow all operations for ad_videos"
ON public.ad_videos
FOR ALL
USING (true)
WITH CHECK (true);

-- 권한 부여
GRANT ALL ON TABLE public.ad_videos TO anon;
GRANT ALL ON TABLE public.ad_videos TO authenticated;
GRANT ALL ON TABLE public.ad_videos TO service_role;

-- 테이블 주석
COMMENT ON TABLE public.ad_videos IS '생성된 홍보영상 정보 및 진행 상태';
COMMENT ON COLUMN public.ad_videos.status IS '영상 상태: pending, processing, completed, failed';
COMMENT ON COLUMN public.ad_videos.progress_stage IS '진행 단계: init, ad_copy_generation, image_refinement, video_generation, tts_generation, subtitle_generation, merging, completed';
COMMENT ON COLUMN public.ad_videos.duration IS '영상 길이 (초)';
COMMENT ON COLUMN public.ad_videos.error_message IS '에러 발생 시 메시지';

-- =====================================================
-- 4. n8n_workflows 테이블 (추후 확장용)
-- =====================================================
-- n8n 워크플로우 관리 테이블

CREATE TABLE IF NOT EXISTS public.n8n_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 200),
    description TEXT CHECK (length(description) <= 1000),
    webhook_url TEXT NOT NULL CHECK (webhook_url ~ '^https?://'),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.n8n_workflows OWNER TO postgres;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_is_active ON public.n8n_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_name ON public.n8n_workflows(name);

-- Row Level Security (RLS) 명시적 비활성화
ALTER TABLE public.n8n_workflows ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용
CREATE POLICY "Allow all operations for n8n_workflows"
ON public.n8n_workflows
FOR ALL
USING (true)
WITH CHECK (true);

-- 권한 부여
GRANT ALL ON TABLE public.n8n_workflows TO anon;
GRANT ALL ON TABLE public.n8n_workflows TO authenticated;
GRANT ALL ON TABLE public.n8n_workflows TO service_role;

-- 테이블 주석
COMMENT ON TABLE public.n8n_workflows IS 'n8n 워크플로우 관리 (추후 확장용)';
COMMENT ON COLUMN public.n8n_workflows.webhook_url IS 'n8n 웹훅 URL';
COMMENT ON COLUMN public.n8n_workflows.is_active IS '활성화 여부';

-- =====================================================
-- 5. updated_at 자동 업데이트 트리거
-- =====================================================
-- product_images 테이블의 updated_at 필드를 자동으로 업데이트

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- product_images 트리거 생성
CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON public.product_images
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 트리거 주석
COMMENT ON FUNCTION public.update_updated_at_column() IS 'updated_at 필드를 자동으로 현재 시간으로 업데이트';

-- =====================================================
-- 6. 샘플 데이터 추가 (개발용)
-- =====================================================
-- 실제 홍보영상 제작 서비스처럼 현실적인 샘플 데이터

-- 샘플 사용자 추가 (테스트용)
INSERT INTO public.users (clerk_id, name) VALUES
('user_test001', '김소상'),
('user_test002', '박영희'),
('user_test003', '이철수')
ON CONFLICT (clerk_id) DO NOTHING;

-- 샘플 product_images 데이터
INSERT INTO public.product_images (user_id, image_url, original_filename, file_size, mime_type, status) VALUES
('user_test001', 'user_test001/images/coffee-latte-001.jpg', 'coffee-latte.jpg', 2457600, 'image/jpeg', 'completed'),
('user_test001', 'user_test001/images/bakery-croissant-001.jpg', 'bakery-croissant.jpg', 3145728, 'image/jpeg', 'completed'),
('user_test001', 'user_test001/images/restaurant-pasta-001.jpg', 'restaurant-pasta.jpg', 2894592, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/cosmetics-lipstick-001.jpg', 'cosmetics-lipstick.jpg', 1845000, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/fashion-bag-001.jpg', 'fashion-bag.jpg', 4194304, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/jewelry-necklace-001.jpg', 'jewelry-necklace.jpg', 2621440, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/fitness-dumbbell-001.jpg', 'fitness-dumbbell.jpg', 3355443, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/electronics-earbuds-001.jpg', 'electronics-earbuds.jpg', 2097152, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/pet-food-001.jpg', 'pet-food.jpg', 1572864, 'image/jpeg', 'completed'),
('user_test001', 'user_test001/images/dessert-cake-001.jpg', 'dessert-cake.jpg', 3670016, 'image/jpeg', 'completed'),
('user_test001', 'user_test001/images/tea-bubble-001.jpg', 'tea-bubble.jpg', 2202009, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/skincare-cream-001.jpg', 'skincare-cream.jpg', 1928000, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/perfume-bottle-001.jpg', 'perfume-bottle.jpg', 2516582, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/supplement-protein-001.jpg', 'supplement-protein.jpg', 2809856, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/book-novel-001.jpg', 'book-novel.jpg', 1677721, 'image/jpeg', 'completed'),
('user_test001', 'user_test001/images/sandwich-club-001.jpg', 'sandwich-club.jpg', 2983583, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/handbag-leather-001.jpg', 'handbag-leather.jpg', 4509949, 'image/jpeg', 'completed'),
('user_test002', 'user_test002/images/shoes-sneakers-001.jpg', 'shoes-sneakers.jpg', 3932160, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/gaming-mouse-001.jpg', 'gaming-mouse.jpg', 2359296, 'image/jpeg', 'completed'),
('user_test003', 'user_test003/images/plant-succulent-001.jpg', 'plant-succulent.jpg', 1887436, 'image/jpeg', 'completed');

-- 샘플 product_info 데이터
INSERT INTO public.product_info (user_id, product_name, description, category) VALUES
('user_test001', '시그니처 카페라떼', '엄선된 원두와 신선한 우유로 만든 부드러운 카페라떼', '카페/음료'),
('user_test001', '수제 버터 크루아상', '매일 아침 갓 구운 바삭한 크루아상', '베이커리'),
('user_test001', '트러플 크림 파스타', '진한 트러플 향이 일품인 크림 파스타', '레스토랑/양식'),
('user_test002', '매트 벨벳 립스틱', '촉촉하고 선명한 발색의 고급 립스틱', '화장품/메이크업'),
('user_test002', '프리미엄 가죽 토트백', '이탈리아산 소가죽으로 제작한 명품급 토트백', '패션/가방'),
('user_test002', '실버 체인 목걸이', '925 실버 소재의 심플하고 우아한 목걸이', '주얼리/액세서리'),
('user_test003', '홈트레이닝 덤벨 세트', '5kg-20kg 조절 가능한 스마트 덤벨', '운동/피트니스'),
('user_test003', '노이즈캔슬링 이어버드', '최신 ANC 기술의 무선 이어버드', '전자제품/오디오'),
('user_test003', '프리미엄 강아지 사료', '수의사 추천 천연 원료 프리미엄 사료', '반려동물/용품'),
('user_test001', '딸기 생크림 케이크', '신선한 딸기와 부드러운 생크림이 어우러진 케이크', '디저트/베이커리'),
('user_test001', '흑당 버블티', '쫄깃한 타피오카 펄이 가득한 흑당 버블티', '카페/음료'),
('user_test002', '히알루론산 수분크림', '24시간 촉촉함을 유지하는 집중 보습 크림', '화장품/스킨케어'),
('user_test002', '플로럴 향수 50ml', '은은한 장미와 자스민 향의 럭셔리 향수', '화장품/향수'),
('user_test003', '웨이 프로틴 보충제', '고함량 단백질 보충제 (초코맛)', '건강/보충제'),
('user_test003', '베스트셀러 소설', '2024년 최고의 화제작 추리 소설', '도서/문학'),
('user_test001', '클럽 샌드위치 세트', '푸짐한 베이컨과 신선한 야채의 클럽 샌드위치', '카페/브런치'),
('user_test002', '명품 레더 핸드백', '100% 소가죽 럭셔리 핸드백', '패션/가방'),
('user_test002', '스포츠 러닝화', '경량 쿠셔닝 기능의 프리미엄 러닝화', '패션/신발'),
('user_test003', '게이밍 무선 마우스', 'RGB LED 고성능 게이밍 마우스', '전자제품/게이밍'),
('user_test003', '미니 다육식물 세트', '인테리어용 귀여운 미니 다육이 5종 세트', '식물/인테리어');

-- 샘플 ad_videos 데이터
INSERT INTO public.ad_videos (
    user_id,
    product_image_id,
    product_info_id,
    video_url,
    thumbnail_url,
    duration,
    file_size,
    status,
    progress_stage,
    completed_at
)
SELECT
    pi.user_id,
    pi.id,
    pf.id,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15
        THEN pi.user_id || '/videos/' || pi.id || '.mp4'
        ELSE NULL
    END as video_url,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15
        THEN pi.user_id || '/videos/thumbnails/' || pi.id || '.jpg'
        ELSE NULL
    END as thumbnail_url,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15
        THEN (8 + (RANDOM() * 2)::INTEGER) -- 8-10초
        ELSE NULL
    END as duration,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15
        THEN (15000000 + (RANDOM() * 10000000)::INTEGER) -- 15-25MB
        ELSE NULL
    END as file_size,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15 THEN 'completed'
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 18 THEN 'processing'
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) = 19 THEN 'failed'
        ELSE 'pending'
    END as status,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15 THEN 'completed'
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) = 16 THEN 'ad_copy_generation'
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) = 17 THEN 'video_generation'
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) = 18 THEN 'merging'
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) = 19 THEN 'video_generation'
        ELSE 'init'
    END as progress_stage,
    CASE
        WHEN ROW_NUMBER() OVER (ORDER BY pi.created_at) <= 15
        THEN pi.created_at + INTERVAL '5 minutes'
        ELSE NULL
    END as completed_at
FROM
    public.product_images pi
JOIN
    public.product_info pf ON pi.user_id = pf.user_id
    AND pi.created_at = pf.created_at;

-- 실패한 영상에 에러 메시지 추가
UPDATE public.ad_videos
SET error_message = 'Veo 3.1 API 타임아웃: 영상 생성 중 연결이 끊어졌습니다. 다시 시도해주세요.'
WHERE status = 'failed';

-- 샘플 n8n_workflows 데이터 (추후 확장용)
INSERT INTO public.n8n_workflows (name, description, webhook_url, is_active) VALUES
('AI 홍보영상 생성', '이미지와 상품명으로 홍보영상을 자동 생성하는 워크플로우', 'http://localhost:5678/webhook/6632eae6-fcdf-4f22-9f71-298989a39734', true),
('상품 소개 영상 생성', '상품 상세 정보로 상품 소개 영상을 생성하는 워크플로우', 'http://localhost:5678/webhook/product-intro-video', false),
('SNS 스토리 영상 생성', '15초 분량의 SNS 스토리용 세로 영상 생성', 'http://localhost:5678/webhook/sns-story-video', false);

-- =====================================================
-- 7. 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'AI 홍보영상 자동 생성 서비스 스키마 생성 완료!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '생성된 테이블:';
    RAISE NOTICE '  - product_images (샘플 데이터 20개)';
    RAISE NOTICE '  - product_info (샘플 데이터 20개)';
    RAISE NOTICE '  - ad_videos (샘플 데이터 20개)';
    RAISE NOTICE '  - n8n_workflows (샘플 데이터 3개)';
    RAISE NOTICE '';
    RAISE NOTICE '주요 기능:';
    RAISE NOTICE '  - CHECK 제약조건으로 데이터 유효성 검증';
    RAISE NOTICE '  - 성능 최적화를 위한 인덱스 생성';
    RAISE NOTICE '  - updated_at 자동 업데이트 트리거';
    RAISE NOTICE '  - RLS 정책 설정 (개발 모드: 모두 허용)';
    RAISE NOTICE '  - 외래키 ON DELETE CASCADE/SET NULL';
    RAISE NOTICE '';
    RAISE NOTICE '다음 단계:';
    RAISE NOTICE '  1. Supabase Storage 버킷 생성 (uploads, videos)';
    RAISE NOTICE '  2. Phase 2: 업로드 페이지 개발 시작';
    RAISE NOTICE '==============================================';
END $$;
