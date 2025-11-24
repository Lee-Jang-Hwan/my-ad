-- =====================================================
-- Update n8n Webhook URL
-- =====================================================
-- Created: 2025-11-24
-- Description: Updates the n8n webhook URL to the new endpoint
--              Webhook ID: 70980457-f61e-42f1-84c3-5245f1438435
-- =====================================================

-- =====================================================
-- 1. Deactivate existing active workflows
-- =====================================================
UPDATE public.n8n_workflows
SET is_active = false
WHERE is_active = true;

-- =====================================================
-- 2. Insert new workflow with updated webhook URL
-- =====================================================
INSERT INTO public.n8n_workflows (
    name,
    webhook_url,
    is_active,
    description
) VALUES (
    'AI 홍보영상 생성 (Final)',
    'http://localhost:5678/webhook/70980457-f61e-42f1-84c3-5245f1438435',
    true,
    'Veo 3.1으로 음성과 자막이 포함된 완성 영상을 생성하는 최종 워크플로우'
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
    ELSE
        RAISE WARNING '⚠️  No active workflow found';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
END $$;
