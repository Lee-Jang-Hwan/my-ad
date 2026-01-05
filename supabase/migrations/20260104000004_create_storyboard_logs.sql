-- 스토리보드 생성 로그 테이블
CREATE TABLE IF NOT EXISTS public.storyboard_generation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storyboard_id UUID NOT NULL REFERENCES public.storyboards(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES public.storyboard_scenes(id) ON DELETE CASCADE,

    -- 로그 정보
    stage TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    source TEXT NOT NULL CHECK (source IN ('app', 'n8n', 'supabase')),

    -- 상세 정보
    message TEXT,
    error_code TEXT,
    error_message TEXT,
    metadata JSONB,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_storyboard_logs_storyboard_id ON public.storyboard_generation_logs(storyboard_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_logs_scene_id ON public.storyboard_generation_logs(scene_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_logs_stage ON public.storyboard_generation_logs(stage);
CREATE INDEX IF NOT EXISTS idx_storyboard_logs_created_at ON public.storyboard_generation_logs(created_at DESC);

-- RLS 활성화
ALTER TABLE public.storyboard_generation_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (개발 중: 모든 작업 허용)
CREATE POLICY "storyboard_logs_all_access" ON public.storyboard_generation_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- n8n_workflows 테이블에 스토리보드 워크플로우 추가
INSERT INTO public.n8n_workflows (name, description, webhook_url, is_active) VALUES
    ('스토리보드 AI 초안 생성', 'AI가 상품 정보를 바탕으로 스토리보드 씬 구성을 자동 생성', 'https://n8n.sappstudio.kr/webhook/storyboard-draft', false),
    ('스토리보드 씬 이미지 생성', 'visual_prompt를 기반으로 개별 씬의 이미지를 AI로 생성', 'https://n8n.sappstudio.kr/webhook/storyboard-scene-image', false),
    ('스토리보드 씬 클립 생성', '생성된 이미지를 비디오 클립으로 변환 (이미지-투-비디오)', 'https://n8n.sappstudio.kr/webhook/storyboard-scene-clip', false),
    ('스토리보드 최종 병합', '모든 씬 클립을 하나의 영상으로 병합 (트랜지션, BGM 포함)', 'https://n8n.sappstudio.kr/webhook/storyboard-merge', false)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.storyboard_generation_logs IS '스토리보드 생성 과정 로그 - 각 단계별 진행 상황 추적';
