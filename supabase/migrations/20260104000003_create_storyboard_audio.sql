-- BGM 라이브러리 테이블
CREATE TABLE IF NOT EXISTS public.storyboard_bgm (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('upbeat', 'calm', 'dramatic', 'corporate', 'emotional', 'action', 'ambient')),
    mood TEXT[], -- ['happy', 'energetic'] 등
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER,
    bpm INTEGER,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 효과음 라이브러리 테이블
CREATE TABLE IF NOT EXISTS public.storyboard_sfx (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('transition', 'impact', 'ambient', 'ui', 'nature', 'voice')),
    audio_url TEXT NOT NULL,
    duration_seconds DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_storyboard_bgm_category ON public.storyboard_bgm(category);
CREATE INDEX IF NOT EXISTS idx_storyboard_bgm_active ON public.storyboard_bgm(is_active);
CREATE INDEX IF NOT EXISTS idx_storyboard_sfx_category ON public.storyboard_sfx(category);
CREATE INDEX IF NOT EXISTS idx_storyboard_sfx_active ON public.storyboard_sfx(is_active);

-- RLS 활성화
ALTER TABLE public.storyboard_bgm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboard_sfx ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (모든 사용자가 활성 오디오만 조회 가능)
CREATE POLICY "storyboard_bgm_select_active" ON public.storyboard_bgm
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "storyboard_sfx_select_active" ON public.storyboard_sfx
    FOR SELECT
    USING (is_active = true);

-- 외래키 추가 (storyboards 테이블)
ALTER TABLE public.storyboards
    ADD CONSTRAINT fk_storyboards_default_bgm
    FOREIGN KEY (default_bgm_id) REFERENCES public.storyboard_bgm(id)
    ON DELETE SET NULL;

-- 외래키 추가 (storyboard_scenes 테이블)
ALTER TABLE public.storyboard_scenes
    ADD CONSTRAINT fk_storyboard_scenes_bgm
    FOREIGN KEY (bgm_id) REFERENCES public.storyboard_bgm(id)
    ON DELETE SET NULL;

ALTER TABLE public.storyboard_scenes
    ADD CONSTRAINT fk_storyboard_scenes_sfx
    FOREIGN KEY (sfx_id) REFERENCES public.storyboard_sfx(id)
    ON DELETE SET NULL;

-- 샘플 BGM 데이터 (실제 URL은 나중에 업데이트)
INSERT INTO public.storyboard_bgm (name, description, category, mood, audio_url, duration_seconds, bpm, is_premium) VALUES
    ('Uplifting Corporate', '밝고 긍정적인 기업 홍보 음악', 'corporate', ARRAY['happy', 'professional'], '/audio/bgm/uplifting-corporate.mp3', 120, 120, false),
    ('Calm Piano', '차분한 피아노 연주곡', 'calm', ARRAY['peaceful', 'relaxing'], '/audio/bgm/calm-piano.mp3', 180, 80, false),
    ('Energetic Pop', '활기찬 팝 스타일 음악', 'upbeat', ARRAY['energetic', 'fun'], '/audio/bgm/energetic-pop.mp3', 90, 128, false),
    ('Dramatic Cinematic', '드라마틱한 영화 스타일 음악', 'dramatic', ARRAY['intense', 'epic'], '/audio/bgm/dramatic-cinematic.mp3', 150, 100, true),
    ('Ambient Tech', '기술적인 앰비언트 음악', 'ambient', ARRAY['modern', 'tech'], '/audio/bgm/ambient-tech.mp3', 120, 90, false)
ON CONFLICT DO NOTHING;

-- 샘플 SFX 데이터
INSERT INTO public.storyboard_sfx (name, category, audio_url, duration_seconds) VALUES
    ('Swoosh Transition', 'transition', '/audio/sfx/swoosh.mp3', 0.5),
    ('Soft Click', 'ui', '/audio/sfx/soft-click.mp3', 0.2),
    ('Impact Hit', 'impact', '/audio/sfx/impact-hit.mp3', 0.8),
    ('Whoosh', 'transition', '/audio/sfx/whoosh.mp3', 0.6),
    ('Bell Notification', 'ui', '/audio/sfx/bell.mp3', 1.0)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.storyboard_bgm IS 'BGM 라이브러리 - 스토리보드에서 사용할 배경 음악';
COMMENT ON TABLE public.storyboard_sfx IS 'SFX 라이브러리 - 스토리보드에서 사용할 효과음';
