-- =====================================================
-- Create Generation Logs Table
-- =====================================================
-- Created: 2025-12-08
-- Description: Creates generation_logs table for tracking
--              image and video generation process
-- =====================================================

-- =====================================================
-- 1. Create generation_logs table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 참조 정보
    user_id TEXT NOT NULL,                    -- clerk_id
    content_id UUID NOT NULL,                 -- ad_video_id 또는 ad_image_id
    content_type TEXT NOT NULL,               -- 'video' 또는 'image'

    -- 로그 정보
    stage TEXT NOT NULL,                      -- 진행 단계
    status TEXT NOT NULL,                     -- 'started', 'completed', 'failed'
    source TEXT NOT NULL,                     -- 'app', 'n8n', 'supabase'

    -- 상세 정보
    message TEXT,                             -- 상태 메시지
    error_code TEXT,                          -- 에러 코드 (실패 시)
    error_message TEXT,                       -- 에러 메시지 (실패 시)
    metadata JSONB,                           -- 추가 데이터 (API 응답 등)

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- 2. Add indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id
ON public.generation_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_generation_logs_content_id
ON public.generation_logs(content_id);

CREATE INDEX IF NOT EXISTS idx_generation_logs_content_type
ON public.generation_logs(content_type);

CREATE INDEX IF NOT EXISTS idx_generation_logs_status
ON public.generation_logs(status);

CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at
ON public.generation_logs(created_at DESC);

-- 복합 인덱스 (관리자 조회용)
CREATE INDEX IF NOT EXISTS idx_generation_logs_admin_query
ON public.generation_logs(created_at DESC, content_type, status);

-- =====================================================
-- 3. Enable RLS
-- =====================================================
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS policies
-- =====================================================
-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role has full access to generation_logs"
ON public.generation_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 5. Add foreign key constraint
-- =====================================================
ALTER TABLE public.generation_logs
ADD CONSTRAINT generation_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(clerk_id)
    ON DELETE CASCADE;

-- =====================================================
-- 6. Add check constraints
-- =====================================================
ALTER TABLE public.generation_logs
ADD CONSTRAINT generation_logs_content_type_check
    CHECK (content_type IN ('video', 'image')),
ADD CONSTRAINT generation_logs_status_check
    CHECK (status IN ('started', 'completed', 'failed')),
ADD CONSTRAINT generation_logs_source_check
    CHECK (source IN ('app', 'n8n', 'supabase'));

-- =====================================================
-- 7. Grant permissions
-- =====================================================
GRANT ALL ON public.generation_logs TO service_role;

-- =====================================================
-- 8. Add comments
-- =====================================================
COMMENT ON TABLE public.generation_logs IS 'Logs for tracking image and video generation process';
COMMENT ON COLUMN public.generation_logs.user_id IS 'Clerk user ID who initiated the generation';
COMMENT ON COLUMN public.generation_logs.content_id IS 'UUID of ad_video or ad_image being generated';
COMMENT ON COLUMN public.generation_logs.content_type IS 'Type of content: video or image';
COMMENT ON COLUMN public.generation_logs.stage IS 'Current generation stage (init, ad_copy_generation, image_refinement, video_generation, etc.)';
COMMENT ON COLUMN public.generation_logs.status IS 'Status of this stage: started, completed, or failed';
COMMENT ON COLUMN public.generation_logs.source IS 'Where this log originated: app, n8n, or supabase';
COMMENT ON COLUMN public.generation_logs.message IS 'Human-readable status message';
COMMENT ON COLUMN public.generation_logs.error_code IS 'Error code if status is failed';
COMMENT ON COLUMN public.generation_logs.error_message IS 'Detailed error message if status is failed';
COMMENT ON COLUMN public.generation_logs.metadata IS 'Additional JSON data (API responses, timing info, etc.)';

-- =====================================================
-- 9. Verify the setup
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Generation Logs table setup complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Table: public.generation_logs';
    RAISE NOTICE 'RLS: Enabled';
    RAISE NOTICE 'Policies: Service role full access';
    RAISE NOTICE '============================================';
END $$;
