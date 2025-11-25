-- =====================================================
-- Update n8n Webhook URL to Production
-- =====================================================
-- Created: 2025-11-25
-- Description: Updates the n8n webhook URL to production endpoint
--              Webhook ID: 70980457-f61e-42f1-84c3-5245f1438435
--              Production URL: https://n8n.sappstudio.kr
-- =====================================================

-- =====================================================
-- 1. Deactivate existing active workflows
-- =====================================================
UPDATE public.n8n_workflows
SET is_active = false
WHERE is_active = true;

-- =====================================================
-- 2. Insert new workflow with production webhook URL
-- =====================================================
INSERT INTO public.n8n_workflows (
    name,
    webhook_url,
    is_active,
    description
) VALUES (
    'AI 홍보영상 생성 (Production)',
    'https://n8n.sappstudio.kr/webhook/70980457-f61e-42f1-84c3-5245f1438435',
    true,
    'Veo 3.1으로 음성과 자막이 포함된 완성 영상을 생성하는 프로덕션 워크플로우'
);

-- =====================================================
-- 3. Verify the update
-- =====================================================
DO $$
DECLARE
    v_webhook_url TEXT;
    v_name TEXT;
    v_count INTEGER;
BEGIN
    -- Get the active webhook URL
    SELECT name, webhook_url INTO v_name, v_webhook_url
    FROM public.n8n_workflows
    WHERE is_active = true
    LIMIT 1;

    -- Get count of active workflows
    SELECT COUNT(*) INTO v_count
    FROM public.n8n_workflows
    WHERE is_active = true;

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'n8n Webhook URL Update Complete';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Active workflows: %', v_count;
    IF v_webhook_url IS NOT NULL THEN
        RAISE NOTICE 'Workflow Name: %', v_name;
        RAISE NOTICE 'Webhook URL: %', v_webhook_url;
        RAISE NOTICE '';

        -- Verify it's the production URL
        IF v_webhook_url LIKE 'https://n8n.sappstudio.kr%' THEN
            RAISE NOTICE '✅ Production URL verified';
        ELSE
            RAISE WARNING '⚠️  URL is not production endpoint';
        END IF;
    ELSE
        RAISE WARNING '⚠️  No active workflow found';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
END $$;
