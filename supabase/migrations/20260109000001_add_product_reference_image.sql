-- 스토리보드에 상품 참조 이미지 URL 컬럼 추가
-- 이 이미지는 AI가 씬 이미지와 클립 생성 시 상품의 원형을 보존하기 위해 사용됩니다.

ALTER TABLE public.storyboards
ADD COLUMN IF NOT EXISTS product_reference_image_url TEXT;

COMMENT ON COLUMN public.storyboards.product_reference_image_url IS '상품 참조 이미지 URL - AI 이미지/클립 생성 시 상품 원형 보존을 위해 사용';
