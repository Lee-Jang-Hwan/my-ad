-- 스토리보드 메인 테이블
CREATE TABLE IF NOT EXISTS public.storyboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- 기본 정보
    title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
    description TEXT CHECK (length(description) <= 2000),

    -- 영상 설정
    aspect_ratio TEXT DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16', '1:1', '4:3')),
    target_duration INTEGER DEFAULT 30 CHECK (target_duration > 0 AND target_duration <= 300), -- 초 단위, 최대 5분
    color_grade TEXT DEFAULT 'default',

    -- 글로벌 설정
    default_bgm_id UUID,
    default_voice_style TEXT DEFAULT 'neutral',
    brand_guidelines JSONB,

    -- 상태 관리
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
    progress_stage TEXT DEFAULT 'init' CHECK (
        progress_stage IN (
            'init',
            'ai_draft_generation',
            'user_editing',
            'scene_image_generation',
            'scene_clip_generation',
            'final_merge',
            'completed',
            'failed'
        )
    ),
    error_message TEXT,

    -- 메타데이터
    total_scenes INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT false,

    -- 결과물
    final_video_url TEXT,
    final_thumbnail_url TEXT,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_storyboards_user_id ON public.storyboards(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_status ON public.storyboards(status);
CREATE INDEX IF NOT EXISTS idx_storyboards_created_at ON public.storyboards(created_at DESC);

-- RLS 활성화
ALTER TABLE public.storyboards ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (개발 중: 모든 작업 허용)
CREATE POLICY "storyboards_all_access" ON public.storyboards
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_storyboards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_storyboards_updated_at
    BEFORE UPDATE ON public.storyboards
    FOR EACH ROW
    EXECUTE FUNCTION update_storyboards_updated_at();

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.storyboards;

COMMENT ON TABLE public.storyboards IS '스토리보드 메인 테이블 - AI 영상 생성을 위한 스토리보드 관리';
