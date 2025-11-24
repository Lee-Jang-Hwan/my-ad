-- Add is_public column to ad_videos table
ALTER TABLE ad_videos
ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- Create index for faster public video queries
CREATE INDEX idx_ad_videos_is_public_created_at
ON ad_videos(is_public, created_at DESC)
WHERE is_public = TRUE;

-- Update RLS policy to allow public read access to public videos
CREATE POLICY "Public videos are viewable by everyone"
ON ad_videos FOR SELECT
TO anon
USING (is_public = TRUE);
