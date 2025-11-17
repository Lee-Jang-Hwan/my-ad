-- 현재 저장된 video_url과 thumbnail_url 확인
SELECT
    id,
    status,
    video_url,
    thumbnail_url,
    created_at
FROM ad_videos
WHERE user_id = 'user_354SZeUdpOzWRwxkN7bN5QfdXF6'
ORDER BY created_at DESC
LIMIT 5;

-- video_url이 표현식으로 저장된 레코드 확인
SELECT
    id,
    status,
    video_url,
    created_at
FROM ad_videos
WHERE video_url LIKE '%{{%'
ORDER BY created_at DESC;