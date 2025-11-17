-- =====================================================
-- Social Media OAuth Accounts Table
-- =====================================================
-- 작성일: 2025-11-06
-- 설명: Instagram, Facebook, YouTube OAuth 토큰 및 계정 정보 저장

CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,

    -- 플랫폼 식별
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube')),
    platform_user_id TEXT NOT NULL, -- Instagram Business Account ID / Facebook User ID / YouTube Channel ID
    platform_username TEXT, -- 사용자명 (선택)

    -- OAuth 토큰
    access_token TEXT NOT NULL,
    token_type TEXT DEFAULT 'bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_token TEXT, -- YouTube 등에서 사용

    -- 계정 메타데이터
    account_type TEXT, -- 'business', 'creator', 'personal'
    page_id TEXT, -- Facebook Page ID (Instagram Business 계정에 필수)
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- 사용자당 플랫폼당 하나의 계정만 연결
    UNIQUE(user_id, platform, platform_user_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.social_accounts OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_is_active ON public.social_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_social_accounts_expires_at ON public.social_accounts(expires_at);

-- Row Level Security (RLS) 설정
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 작업 허용 (개발 모드)
CREATE POLICY "Allow all operations for social_accounts"
ON public.social_accounts
FOR ALL
USING (true)
WITH CHECK (true);

-- 권한 부여
GRANT ALL ON TABLE public.social_accounts TO anon;
GRANT ALL ON TABLE public.social_accounts TO authenticated;
GRANT ALL ON TABLE public.social_accounts TO service_role;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON public.social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 테이블 주석
COMMENT ON TABLE public.social_accounts IS 'SNS OAuth 토큰 및 계정 정보 저장 (Instagram, Facebook, YouTube)';
COMMENT ON COLUMN public.social_accounts.platform IS '소셜 미디어 플랫폼: instagram, facebook, youtube';
COMMENT ON COLUMN public.social_accounts.platform_user_id IS '플랫폼에서 발급한 사용자 ID';
COMMENT ON COLUMN public.social_accounts.access_token IS 'OAuth 액세스 토큰 (프로덕션에서는 암호화 권장)';
COMMENT ON COLUMN public.social_accounts.expires_at IS '토큰 만료 시간';
COMMENT ON COLUMN public.social_accounts.page_id IS 'Facebook Page ID (Instagram Business 계정에 필수)';
COMMENT ON COLUMN public.social_accounts.is_active IS '계정 활성화 여부 (false = 연결 해제)';
