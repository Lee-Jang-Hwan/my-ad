-- =====================================================
-- Enable Supabase Realtime for ad_videos table
-- =====================================================
-- Created: 2025-11-20
-- Description: Enables Realtime publication and sets REPLICA IDENTITY
--              to ensure UPDATE events are properly broadcasted
-- =====================================================

-- =====================================================
-- 1. Add ad_videos to supabase_realtime publication
-- =====================================================
DO $$
BEGIN
    -- Check if ad_videos is already in the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'ad_videos'
    ) THEN
        -- Add table to publication
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ad_videos;
        RAISE NOTICE '✅ ad_videos added to supabase_realtime publication';
    ELSE
        RAISE NOTICE '✅ ad_videos already in supabase_realtime publication';
    END IF;
END $$;

-- =====================================================
-- 2. Set REPLICA IDENTITY to FULL
-- =====================================================
-- This ensures all column changes are detected and broadcast
-- Required for UPDATE and DELETE events in Realtime
ALTER TABLE public.ad_videos REPLICA IDENTITY FULL;

-- =====================================================
-- 3. Verify settings
-- =====================================================
DO $$
DECLARE
    v_replica_identity TEXT;
BEGIN
    -- Check REPLICA IDENTITY setting
    SELECT
        CASE relreplident
            WHEN 'd' THEN 'default (primary key)'
            WHEN 'n' THEN 'nothing'
            WHEN 'f' THEN 'full'
            WHEN 'i' THEN 'index'
        END
    INTO v_replica_identity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'ad_videos';

    RAISE NOTICE '✅ ad_videos REPLICA IDENTITY: %', v_replica_identity;

    -- Verify publication
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'ad_videos'
    ) THEN
        RAISE NOTICE '✅ ad_videos is in supabase_realtime publication';
    ELSE
        RAISE WARNING '⚠️  ad_videos is NOT in supabase_realtime publication';
    END IF;
END $$;

-- =====================================================
-- 4. Summary
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Supabase Realtime enabled for ad_videos';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Configuration:';
    RAISE NOTICE '  ✅ Publication: supabase_realtime';
    RAISE NOTICE '  ✅ REPLICA IDENTITY: FULL';
    RAISE NOTICE '';
    RAISE NOTICE 'This migration enables:';
    RAISE NOTICE '  - Real-time INSERT notifications';
    RAISE NOTICE '  - Real-time UPDATE notifications';
    RAISE NOTICE '  - Real-time DELETE notifications';
    RAISE NOTICE '';
    RAISE NOTICE 'Clients can now subscribe to changes using:';
    RAISE NOTICE '  supabase.channel("ad_video:id")';
    RAISE NOTICE '    .on("postgres_changes", ...)';
    RAISE NOTICE '==============================================';
END $$;
