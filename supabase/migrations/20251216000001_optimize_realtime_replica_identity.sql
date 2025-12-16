-- =====================================================
-- Optimize Realtime: Change REPLICA IDENTITY to DEFAULT
-- =====================================================
-- Created: 2025-12-16
-- Description: Reduces WAL overhead by only logging primary key changes
--              instead of all columns (FULL mode)
-- =====================================================

-- =====================================================
-- 1. Change ad_videos REPLICA IDENTITY from FULL to DEFAULT
-- =====================================================
-- FULL mode logs all columns on every UPDATE, causing excessive WAL writes
-- DEFAULT mode only logs the primary key, which is sufficient for Realtime
-- since we only use payload.new (not payload.old)

ALTER TABLE public.ad_videos REPLICA IDENTITY DEFAULT;

-- =====================================================
-- 2. Change ad_images REPLICA IDENTITY if it's set to FULL
-- =====================================================
DO $$
DECLARE
    v_replica_identity TEXT;
BEGIN
    -- Check current REPLICA IDENTITY for ad_images
    SELECT
        CASE relreplident
            WHEN 'd' THEN 'default'
            WHEN 'n' THEN 'nothing'
            WHEN 'f' THEN 'full'
            WHEN 'i' THEN 'index'
        END
    INTO v_replica_identity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'ad_images';

    IF v_replica_identity = 'full' THEN
        ALTER TABLE public.ad_images REPLICA IDENTITY DEFAULT;
        RAISE NOTICE '✅ ad_images REPLICA IDENTITY changed from FULL to DEFAULT';
    ELSE
        RAISE NOTICE '✅ ad_images REPLICA IDENTITY is already: %', v_replica_identity;
    END IF;
END $$;

-- =====================================================
-- 3. Verify settings
-- =====================================================
DO $$
DECLARE
    v_ad_videos_ri TEXT;
    v_ad_images_ri TEXT;
BEGIN
    -- Check ad_videos
    SELECT
        CASE relreplident
            WHEN 'd' THEN 'default (primary key)'
            WHEN 'n' THEN 'nothing'
            WHEN 'f' THEN 'full'
            WHEN 'i' THEN 'index'
        END
    INTO v_ad_videos_ri
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'ad_videos';

    -- Check ad_images
    SELECT
        CASE relreplident
            WHEN 'd' THEN 'default (primary key)'
            WHEN 'n' THEN 'nothing'
            WHEN 'f' THEN 'full'
            WHEN 'i' THEN 'index'
        END
    INTO v_ad_images_ri
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'ad_images';

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'REPLICA IDENTITY Optimization Complete';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'ad_videos: %', v_ad_videos_ri;
    RAISE NOTICE 'ad_images: %', v_ad_images_ri;
    RAISE NOTICE '';
    RAISE NOTICE 'Benefits:';
    RAISE NOTICE '  - Reduced WAL write overhead';
    RAISE NOTICE '  - Lower realtime.list_changes query time';
    RAISE NOTICE '  - Decreased database CPU usage';
    RAISE NOTICE '==============================================';
END $$;
