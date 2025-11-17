# ✅ 빠른 수정 체크리스트

## 현재 상황

- ❌ 영상 재생 안됨
- ❌ 썸네일 안 보임
- ❌ 다운로드 안됨
- ✅ 영상은 Supabase Storage에 저장되어 있음
- ✅ 웹 애플리케이션 코드는 모두 수정 완료

**문제 원인:** `video_url`이 n8n 표현식 문자열로 저장됨
**저장된 값:** `={{ $('응답 처리').item.json.publicUrl }}`
**필요한 값:** `https://...supabase.co/storage/v1/object/public/videos/...`

---

## 🚀 즉시 해야 할 2가지

### 1️⃣ 기존 영상 수정 (임시 해결)

#### Step 1: Supabase Storage에서 영상 URL 찾기

```
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Storage 클릭
4. videos 버킷 클릭
5. user_354SZeUdpOzWRwxkN7bN5QfdXF6/ 폴더 열기
6. 최근 .mp4 파일 찾기
7. 파일 우클릭 → "Copy URL"
```

#### Step 2: SQL 실행

```sql
-- 1. Supabase 대시보드 → SQL Editor
-- 2. 다음 쿼리 실행 (URL을 실제 값으로 교체!)

UPDATE ad_videos
SET
    video_url = 'https://여기에-복사한-실제-URL-붙여넣기.mp4',
    thumbnail_url = NULL,
    duration = 8,
    file_size = 15000000,
    completed_at = NOW()
WHERE id = 'd549de22-57c1-4d9a-acbf-00496e7f26c1';
```

#### Step 3: 확인

```
1. 브라우저에서 http://localhost:3000/dashboard 새로고침
2. 영상 보기 클릭 → 재생되는지 확인 ✅
3. 다운로드 클릭 → 다운로드되는지 확인 ✅
```

**📄 상세 가이드:** [`fix_existing_video.sql`](../fix_existing_video.sql)

---

### 2️⃣ n8n 워크플로우 수정 (근본 해결)

#### Step 1: n8n 워크플로우 열기

```
1. n8n 대시보드 접속
2. "AI 홍보영상 생성" 워크플로우 열기
```

#### Step 2: "최종 업데이트: Completed" 노드 수정

```
1. 워크플로우에서 마지막 Supabase Update 노드 클릭
2. "Fields to Set" 섹션 확인
```

#### Step 3: Expression 토글 켜기 (중요!)

각 필드 옆의 **토글 스위치**를 확인하세요:

| 필드 | 토글 상태 | 값 |
|------|-----------|-----|
| `status` | ⭕ OFF (Fixed) | `completed` |
| `progress_stage` | ⭕ OFF (Fixed) | `completed` |
| `video_url` | ✅ **ON (Expression)** | `{{ $('응답 처리').item.json.publicUrl }}` |
| `thumbnail_url` | ✅ **ON (Expression)** | `{{ $('응답 처리').item.json.thumbnailUrl }}` |
| `duration` | ✅ **ON (Expression)** | `{{ $('응답 처리').item.json.duration }}` |
| `file_size` | ✅ **ON (Expression)** | `{{ $('응답 처리').item.json.fileSize }}` |
| `completed_at` | ✅ **ON (Expression)** | `{{ $now.toISO() }}` |

**⚠️ 핵심:** `video_url`, `thumbnail_url`, `duration`, `file_size`, `completed_at`의 토글을 반드시 **ON**으로!

#### Step 4: 저장 및 테스트

```
1. 워크플로우 저장 (Save 버튼)
2. 웹에서 새 이미지 업로드
3. 영상 생성 완료 대기
4. 대시보드에서 확인
```

**📄 상세 가이드:**
- [`docs/URGENT_FIX_GUIDE.md`](URGENT_FIX_GUIDE.md)
- [`docs/N8N_VIDEO_URL_FIX.md`](N8N_VIDEO_URL_FIX.md)

---

## 🔍 왜 이런 문제가 발생했나?

### n8n Expression 모드 이해

#### Fixed 모드 (토글 OFF)
```
입력: {{ $('응답 처리').item.json.publicUrl }}
저장: "={{ $('응답 처리').item.json.publicUrl }}"  ❌ 문자열 그대로!
```

#### Expression 모드 (토글 ON)
```
입력: {{ $('응답 처리').item.json.publicUrl }}
평가: "https://abc.supabase.co/storage/v1/object/public/videos/..."
저장: "https://abc.supabase.co/storage/v1/object/public/videos/..."  ✅ 올바름!
```

**현재 문제:** `video_url` 필드가 Fixed 모드로 설정되어 표현식이 문자열 그대로 저장됨

---

## 📋 최종 체크리스트

### 기존 영상 수정
- [ ] Supabase Storage에서 영상 URL 복사
- [ ] SQL Editor에서 UPDATE 쿼리 실행
- [ ] 브라우저 새로고침
- [ ] 영상 재생 확인 ✅
- [ ] 다운로드 확인 ✅

### n8n 워크플로우 수정
- [ ] n8n 워크플로우 열기
- [ ] "최종 업데이트: Completed" 노드 찾기
- [ ] `video_url` 토글 ON
- [ ] `thumbnail_url` 토글 ON
- [ ] `duration` 토글 ON
- [ ] `file_size` 토글 ON
- [ ] `completed_at` 토글 ON
- [ ] 워크플로우 저장
- [ ] 새 영상 생성 테스트 ✅

---

## 🎯 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| 웹 애플리케이션 코드 | ✅ 완료 | 다운로드, 썸네일, 에러 메시지 모두 수정됨 |
| 기존 영상 데이터 | ⏳ 대기 | SQL로 수동 업데이트 필요 |
| n8n 워크플로우 | ⏳ 대기 | Expression 토글 ON 필요 |

**웹 코드는 모두 정상입니다!**
이제 Supabase와 n8n에서 직접 수정만 하면 됩니다.

---

## 📞 여전히 안 되면?

### 디버깅 정보 확인

```sql
-- Supabase SQL Editor에서 실행
SELECT
    id,
    status,
    video_url,
    thumbnail_url,
    duration,
    file_size,
    completed_at
FROM ad_videos
WHERE id = 'd549de22-57c1-4d9a-acbf-00496e7f26c1';
```

### 브라우저 콘솔 확인

```
1. F12 → Console 탭
2. 404 에러 없는지 확인
3. video_url이 실제 URL인지 확인
```

### n8n Execution 로그 확인

```
1. n8n → Executions 탭
2. 최근 실행 클릭
3. "응답 처리" 노드 Output 확인:
   {
     "publicUrl": "https://...",  ← 실제 URL이어야 함
     "duration": 8,
     "fileSize": 15000000
   }
```

---

## 📚 관련 문서

- [`fix_existing_video.sql`](../fix_existing_video.sql) - SQL 스크립트
- [`URGENT_FIX_GUIDE.md`](URGENT_FIX_GUIDE.md) - 상세 수정 가이드
- [`N8N_VIDEO_URL_FIX.md`](N8N_VIDEO_URL_FIX.md) - n8n 표현식 설명
- [`IMMEDIATE_FIX_STEPS.md`](IMMEDIATE_FIX_STEPS.md) - 즉시 수정 방법
- [`check_video_data.sql`](../check_video_data.sql) - 진단 쿼리

---

**🎯 핵심 포인트:**
1. 웹 코드는 이미 수정 완료 ✅
2. 기존 영상: SQL로 URL 업데이트 필요
3. 향후 영상: n8n Expression 토글 ON 필요