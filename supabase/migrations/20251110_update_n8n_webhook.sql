-- =====================================================
-- n8n Webhook URL 업데이트
-- =====================================================
-- 작성일: 2025-11-10
-- 설명: 프로덕션 n8n webhook URL 설정
-- =====================================================

-- 기존 워크플로우 모두 비활성화
UPDATE public.n8n_workflows
SET is_active = false;

-- 프로덕션 워크플로우가 존재하는지 확인하고 업데이트 또는 삽입
DO $$
BEGIN
    -- 해당 URL의 워크플로우가 있으면 활성화
    IF EXISTS (
        SELECT 1 FROM public.n8n_workflows
        WHERE webhook_url = 'http://localhost:5678/webhook/51560738-1db2-4110-bdbb-cc24bbaa973b'
    ) THEN
        UPDATE public.n8n_workflows
        SET is_active = true,
            name = 'AI 홍보영상 생성 (Production)',
            description = '이미지와 상품명으로 홍보영상을 자동 생성하는 프로덕션 워크플로우'
        WHERE webhook_url = 'http://localhost:5678/webhook/51560738-1db2-4110-bdbb-cc24bbaa973b';

        RAISE NOTICE '기존 워크플로우를 활성화했습니다.';
    ELSE
        -- 없으면 새로 생성
        INSERT INTO public.n8n_workflows (name, description, webhook_url, is_active)
        VALUES (
            'AI 홍보영상 생성 (Production)',
            '이미지와 상품명으로 홍보영상을 자동 생성하는 프로덕션 워크플로우',
            'http://localhost:5678/webhook/51560738-1db2-4110-bdbb-cc24bbaa973b',
            true
        );

        RAISE NOTICE '새 워크플로우를 생성했습니다.';
    END IF;
END $$;

-- 워크플로우 확인 메시지
DO $$
DECLARE
    active_workflow RECORD;
BEGIN
    SELECT * INTO active_workflow
    FROM public.n8n_workflows
    WHERE is_active = true
    LIMIT 1;

    IF active_workflow IS NOT NULL THEN
        RAISE NOTICE '==============================================';
        RAISE NOTICE 'n8n Webhook 설정 완료!';
        RAISE NOTICE '==============================================';
        RAISE NOTICE 'Active Workflow: %', active_workflow.name;
        RAISE NOTICE 'Webhook URL: %', active_workflow.webhook_url;
        RAISE NOTICE '==============================================';
    ELSE
        RAISE NOTICE '⚠️ 활성화된 워크플로우가 없습니다.';
    END IF;
END $$;
