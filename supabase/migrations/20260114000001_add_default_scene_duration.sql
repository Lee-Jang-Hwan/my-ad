-- 스토리보드에 기본 씬 시간 필드 추가 (4/8/12초 지원)
ALTER TABLE public.storyboards
ADD COLUMN IF NOT EXISTS default_scene_duration INTEGER DEFAULT 8
CHECK (default_scene_duration IN (4, 8, 12));

-- aspect_ratio 제약조건 업데이트 (9:16, 16:9만 허용)
ALTER TABLE public.storyboards
DROP CONSTRAINT IF EXISTS storyboards_aspect_ratio_check;

ALTER TABLE public.storyboards
ADD CONSTRAINT storyboards_aspect_ratio_check
CHECK (aspect_ratio IN ('16:9', '9:16'));

-- 기존 1:1, 4:3 값을 16:9로 업데이트
UPDATE public.storyboards
SET aspect_ratio = '16:9'
WHERE aspect_ratio NOT IN ('16:9', '9:16');

COMMENT ON COLUMN public.storyboards.default_scene_duration IS '기본 씬 재생 시간 (초) - Sora API 지원 값: 4, 8, 12';
