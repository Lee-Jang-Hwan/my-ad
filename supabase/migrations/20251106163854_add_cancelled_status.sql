-- Migration: Add 'cancelled' status to ad_videos table
-- Date: 2025-11-06

-- Drop the existing status constraint
ALTER TABLE public.ad_videos
DROP CONSTRAINT IF EXISTS ad_videos_status_check;

-- Add the constraint with 'cancelled' status
ALTER TABLE public.ad_videos
ADD CONSTRAINT ad_videos_status_check
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

-- Add comment to explain the change
COMMENT ON COLUMN public.ad_videos.status IS 'Video generation status: pending (waiting to start), processing (in progress), completed (successfully finished), failed (error occurred), cancelled (user cancelled)';
