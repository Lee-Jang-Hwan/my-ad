-- 광고문구 저장 테이블
CREATE TABLE IF NOT EXISTS ad_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_video_id UUID NOT NULL REFERENCES ad_videos(id) ON DELETE CASCADE,
  copy_index INTEGER NOT NULL CHECK (copy_index >= 1 AND copy_index <= 5),
  copy_text TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ad_video_id, copy_index)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ad_copies_ad_video_id ON ad_copies(ad_video_id);
CREATE INDEX IF NOT EXISTS idx_ad_copies_selected ON ad_copies(ad_video_id) WHERE is_selected = TRUE;

-- 테이블 코멘트
COMMENT ON TABLE ad_copies IS '광고문구 5개 저장 및 선택 상태 관리';
COMMENT ON COLUMN ad_copies.copy_index IS '광고문구 순서 (1-5)';
COMMENT ON COLUMN ad_copies.copy_text IS '광고문구 텍스트';
COMMENT ON COLUMN ad_copies.is_selected IS '사용자가 선택한 광고문구 여부';

-- RLS 활성화 (개발 편의성을 위해 모든 작업 허용)
ALTER TABLE ad_copies ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용 (개발 단계)
CREATE POLICY "ad_copies_all_access" ON ad_copies
  FOR ALL
  USING (true)
  WITH CHECK (true);
