-- 스토리보드 씬(컷) 테이블
CREATE TABLE IF NOT EXISTS public.storyboard_scenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storyboard_id UUID NOT NULL REFERENCES public.storyboards(id) ON DELETE CASCADE,

    -- 순서 관리
    scene_order INTEGER NOT NULL CHECK (scene_order >= 1),

    -- 씬 기본 정보
    scene_name TEXT,
    scene_description TEXT NOT NULL CHECK (length(scene_description) <= 1000),

    -- 대사/나레이션
    dialogue TEXT CHECK (length(dialogue) <= 500),
    dialogue_type TEXT DEFAULT 'narration' CHECK (dialogue_type IN ('narration', 'character', 'caption')),

    -- 시각적 요소
    visual_prompt TEXT,
    reference_image_url TEXT,

    -- 카메라 설정
    camera_angle TEXT DEFAULT 'eye_level' CHECK (
        camera_angle IN (
            'eye_level',
            'high_angle',
            'low_angle',
            'bird_eye',
            'dutch_angle',
            'pov',
            'close_up',
            'wide_shot',
            'medium_shot'
        )
    ),
    camera_movement TEXT DEFAULT 'static' CHECK (
        camera_movement IN (
            'static',
            'pan_left',
            'pan_right',
            'tilt_up',
            'tilt_down',
            'zoom_in',
            'zoom_out',
            'dolly_in',
            'dolly_out',
            'tracking'
        )
    ),

    -- 타이밍
    duration_seconds DECIMAL(5,2) DEFAULT 3.0 CHECK (duration_seconds >= 0.5 AND duration_seconds <= 30),

    -- 트랜지션 (다음 씬으로의 전환)
    transition_type TEXT DEFAULT 'cut' CHECK (
        transition_type IN ('cut', 'fade', 'dissolve', 'wipe_left', 'wipe_right', 'zoom', 'slide', 'blur')
    ),
    transition_duration DECIMAL(3,2) DEFAULT 0.5 CHECK (transition_duration >= 0 AND transition_duration <= 3),

    -- 오디오
    bgm_id UUID,
    bgm_volume DECIMAL(3,2) DEFAULT 0.7 CHECK (bgm_volume >= 0 AND bgm_volume <= 1),
    sfx_id UUID,

    -- 자막 스타일
    subtitle_style JSONB DEFAULT '{"position": "bottom", "fontSize": "medium", "fontColor": "#FFFFFF", "bgColor": "rgba(0,0,0,0.7)"}',

    -- 생성된 결과물
    generated_image_url TEXT,
    generated_clip_url TEXT,
    generation_status TEXT DEFAULT 'pending' CHECK (
        generation_status IN ('pending', 'generating_image', 'generating_clip', 'completed', 'failed')
    ),
    generation_error TEXT,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

    -- 유니크 제약 (같은 스토리보드 내 씬 순서는 유일해야 함)
    UNIQUE(storyboard_id, scene_order)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_storyboard_scenes_storyboard_id ON public.storyboard_scenes(storyboard_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_scenes_order ON public.storyboard_scenes(storyboard_id, scene_order);
CREATE INDEX IF NOT EXISTS idx_storyboard_scenes_generation_status ON public.storyboard_scenes(generation_status);

-- RLS 활성화
ALTER TABLE public.storyboard_scenes ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (개발 중: 모든 작업 허용)
CREATE POLICY "storyboard_scenes_all_access" ON public.storyboard_scenes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_storyboard_scenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_storyboard_scenes_updated_at
    BEFORE UPDATE ON public.storyboard_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_storyboard_scenes_updated_at();

-- 씬 수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_storyboard_scene_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE public.storyboards
        SET total_scenes = (
            SELECT COUNT(*) FROM public.storyboard_scenes
            WHERE storyboard_id = COALESCE(NEW.storyboard_id, OLD.storyboard_id)
        )
        WHERE id = COALESCE(NEW.storyboard_id, OLD.storyboard_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scene_count
    AFTER INSERT OR DELETE ON public.storyboard_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_storyboard_scene_count();

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.storyboard_scenes;

COMMENT ON TABLE public.storyboard_scenes IS '스토리보드 씬 테이블 - 개별 씬의 상세 정보 및 생성 결과 관리';
