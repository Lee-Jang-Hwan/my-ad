# 🚨 긴급 수정 가이드 - 영상 재생/다운로드 오류

## 📊 현재 상태 진단

### 콘솔 에러 분석
```
:3000/video_url:%20=%7B%7B%20$('%EC%9D%91%EB%8B%B5%20%EC%B2%98%EB%A6%AC').item.json.publicUrl%20%7D%7D:1
Failed to load resource: the server responded with a status of 404 (Not Found)
```

**문제 확인:**
- `video_url`이 실제 URL이 아닌 n8n 표현식 문자열로 저장됨
- 데이터베이스에 저장된 값: `={{ $('응답 처리').item.json.publicUrl }}`
- 예상되는 올바른 값: `https://your-project.supabase.co/storage/v1/object/public/videos/...`

---

## 🔍 원인 분석

### 문제의 근본 원인

n8n 워크플로우의 **"최종 업데이트: Completed"** 노드에서:
- `video_url` 필드의 Expression 토글이 **OFF** 상태
- 결과: 표현식이 평가되지 않고 **문자열 그대로** 데이터베이스에 저장됨

### 왜 3가지 문제가 모두 발생하는가?

1. **썸네일 안 보임** → `thumbnail_url`도 표현식으로 저장됨
2. **영상 재생 안됨** → `video_url`이 유효한 URL이 아님
3. **다운로드 안됨** → `video_url`을 파싱할 수 없음 (URL.parse 실패)

---

## ✅ 해결 방법

### 📌 방법 1: n8n 워크플로우 수정 (근본 해결)

#### Step 1: n8n 워크플로우 열기
1. n8n 대시보드 접속
2. "AI 홍보영상 생성" 워크플로우 열기

#### Step 2: "최종 업데이트: Completed" 노드 찾기
워크플로우의 **맨 마지막 노드** (Supabase Update)

#### Step 3: 노드 설정 수정

**중요:** 각 필드 옆의 토글 스위치를 확인하세요!

##### 수정할 필드들:

1. **status**
   - 토글: ⭕ **OFF** (Fixed 모드)
   - 값: `completed`

2. **progress_stage**
   - 토글: ⭕ **OFF** (Fixed 모드)
   - 값: `completed`

3. **video_url** ⚠️ **중요!**
   - 토글: ✅ **ON** (Expression 모드)
   - 표현식: `{{ $('응답 처리').item.json.publicUrl }}`
   - **반드시 토글을 켜야 합니다!**

4. **thumbnail_url** ⚠️ **중요!**
   - 토글: ✅ **ON** (Expression 모드)
   - 표현식: `{{ $('응답 처리').item.json.thumbnailUrl }}`
   - **반드시 토글을 켜야 합니다!**

5. **duration**
   - 토글: ✅ **ON** (Expression 모드)
   - 표현식: `{{ $('응답 처리').item.json.duration }}`

6. **file_size**
   - 토글: ✅ **ON** (Expression 모드)
   - 표현식: `{{ $('응답 처리').item.json.fileSize }}`

7. **completed_at**
   - 토글: ✅ **ON** (Expression 모드)
   - 표현식: `{{ $now.toISO() }}`

#### Step 4: 워크플로우 저장
우측 상단 "Save" 버튼 클릭

#### Step 5: 테스트
1. 웹에서 새 이미지 업로드
2. 영상 생성 완료 대기
3. 대시보드에서 영상 확인

---

### 📌 방법 2: 기존 영상 데이터 수정 (임시 해결)

현재 잘못 저장된 영상 데이터를 수동으로 수정합니다.

#### Step 1: Supabase 대시보드 접속
1. Supabase 프로젝트 대시보드 열기
2. SQL Editor 메뉴 클릭

#### Step 2: 잘못된 레코드 확인

다음 SQL을 실행하여 문제가 있는 레코드 확인:

```sql
-- 표현식으로 저장된 레코드 찾기
SELECT
    id,
    status,
    video_url,
    thumbnail_url,
    created_at
FROM ad_videos
WHERE video_url LIKE '%{{%'
ORDER BY created_at DESC;
```

#### Step 3: n8n 실행 로그에서 실제 URL 찾기

1. n8n 워크플로우 "Executions" 탭 열기
2. 가장 최근 성공한 실행 클릭
3. "응답 처리" 노드 클릭
4. Output에서 다음 값 확인:
   ```json
   {
     "publicUrl": "https://...실제_URL...",
     "thumbnailUrl": "https://...실제_URL...",
     "duration": 8,
     "fileSize": 15000000
   }
   ```

#### Step 4: 데이터베이스 직접 업데이트

**주의:** 실제 URL로 교체하세요!

```sql
-- video_url과 thumbnail_url을 실제 URL로 업데이트
UPDATE ad_videos
SET
    video_url = 'https://your-project.supabase.co/storage/v1/object/public/videos/user_xxx/video_xxx.mp4',
    thumbnail_url = 'https://your-project.supabase.co/storage/v1/object/public/videos/user_xxx/thumbnail_xxx.jpg'
WHERE id = 'd549de22-57c1-4d9a-acbf-00496e7f26c1';  -- 실제 video ID
```

#### Step 5: 확인

```sql
-- 수정 확인
SELECT id, video_url, thumbnail_url
FROM ad_videos
WHERE id = 'd549de22-57c1-4d9a-acbf-00496e7f26c1';
```

---

## 🧪 수정 후 테스트

### 1. 썸네일 표시 확인
- **기대 결과:** 대시보드에서 영상 썸네일 또는 첫 프레임 표시
- **확인 방법:** 대시보드 새로고침

### 2. 영상 재생 확인
- **기대 결과:** "영상 보기" 클릭 시 영상 정상 재생
- **확인 방법:** 영상 페이지에서 재생 버튼 클릭

### 3. 다운로드 확인
- **기대 결과:** "영상 다운로드" 클릭 시 파일 다운로드 시작
- **확인 방법:** 다운로드 버튼 클릭

### 4. 콘솔 에러 확인
- **기대 결과:** 404 에러 없음
- **확인 방법:** 브라우저 개발자 도구 Console 탭

---

## 🔍 디버깅: "응답 처리" 노드 확인

만약 n8n 워크플로우를 수정했는데도 문제가 계속되면, "응답 처리" 노드를 확인하세요.

### 확인 사항:

1. **"응답 처리" 노드가 올바른 데이터를 반환하는가?**

   n8n Execution에서 "응답 처리" 노드의 Output 확인:
   ```json
   {
     "publicUrl": "https://...",  // ✅ 실제 URL이어야 함
     "thumbnailUrl": "https://...",  // ✅ 실제 URL이어야 함
     "duration": 8,
     "fileSize": 15000000
   }
   ```

2. **만약 위 데이터가 없다면:**
   - "응답 처리" 노드의 로직을 수정해야 함
   - Supabase Storage에 업로드 후 publicUrl을 가져오는 로직 확인

---

## 📝 체크리스트

수정 후 다음을 모두 확인하세요:

- [ ] n8n "최종 업데이트: Completed" 노드에서 `video_url` 토글 **ON**
- [ ] n8n "최종 업데이트: Completed" 노드에서 `thumbnail_url` 토글 **ON**
- [ ] 워크플로우 저장됨
- [ ] 새 영상 생성 테스트 완료
- [ ] 대시보드에서 썸네일 표시 확인
- [ ] 영상 재생 확인
- [ ] 영상 다운로드 확인
- [ ] 콘솔에 404 에러 없음

---

## 🚨 여전히 안 되면?

### n8n 노드 설정 스크린샷 필요

다음 스크린샷을 확인해주세요:

1. **"최종 업데이트: Completed" 노드 설정**
   - Fields to Set 섹션
   - 각 필드의 토글 상태 (ON/OFF)

2. **"응답 처리" 노드 Output**
   - Execution 탭에서 Output JSON

3. **데이터베이스 레코드**
   ```sql
   SELECT id, video_url, thumbnail_url, status
   FROM ad_videos
   WHERE id = 'your-video-id';
   ```

---

## 💡 왜 이런 문제가 발생했나?

### n8n Expression 모드 이해

n8n에는 두 가지 입력 모드가 있습니다:

#### 1. Fixed 모드 (토글 OFF)
- 입력한 텍스트를 **그대로** 저장
- 예시:
  - 입력: `completed`
  - 저장: `"completed"` ✅
  - 입력: `{{ $('Test').item.url }}`
  - 저장: `"={{ $('Test').item.url }}"` ❌ (문자열!)

#### 2. Expression 모드 (토글 ON)
- 표현식을 **평가**하여 결과 저장
- 예시:
  - 입력: `{{ $('응답 처리').item.json.publicUrl }}`
  - 평가: `"https://...supabase.co/storage/..."`
  - 저장: `"https://...supabase.co/storage/..."` ✅

### 현재 문제:
- `video_url` 필드가 **Fixed 모드**로 설정됨
- 표현식이 평가되지 않고 **문자열 그대로** 저장됨

### 해결:
- `video_url` 필드를 **Expression 모드**로 변경
- 표현식이 평가되어 **실제 URL** 저장됨

---

## 📚 관련 문서

- [N8N_VIDEO_URL_FIX.md](N8N_VIDEO_URL_FIX.md) - 상세 가이드
- [N8N_FINAL_FIX.md](N8N_FINAL_FIX.md) - n8n 워크플로우 수정
- [FIXES_SUMMARY.md](FIXES_SUMMARY.md) - 전체 수정 내역

---

## 🎯 요약

**문제:** n8n 워크플로우 설정 오류
**원인:** Expression 토글 OFF 상태
**해결:** Expression 토글 ON으로 변경

**n8n 워크플로우를 수정하지 않으면 이 문제는 해결되지 않습니다.**