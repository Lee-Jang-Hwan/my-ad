-- ad_videos 테이블에 selected_ad_copy 칼럼 추가
ALTER TABLE ad_videos
ADD COLUMN IF NOT EXISTS selected_ad_copy TEXT;

COMMENT ON COLUMN ad_videos.selected_ad_copy IS '사용자가 선택한 최종 광고문구';

-- progress_stage CHECK 제약조건 수정 (ad_copy_selection 추가)
ALTER TABLE ad_videos
DROP CONSTRAINT IF EXISTS ad_videos_progress_stage_check;

ALTER TABLE ad_videos
ADD CONSTRAINT ad_videos_progress_stage_check
CHECK (progress_stage = ANY (ARRAY[
  'init'::text,
  'ad_copy_generation'::text,
  'ad_copy_selection'::text,
  'image_refinement'::text,
  'video_generation'::text,
  'tts_generation'::text,
  'subtitle_generation'::text,
  'merging'::text,
  'completed'::text,
  'failed'::text,
  'cancelled'::text
]));
