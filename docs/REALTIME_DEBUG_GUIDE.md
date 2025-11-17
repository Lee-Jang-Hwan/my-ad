# Realtime 문제 완전 해결 가이드

## 🚨 현재 상황

- ✅ n8n 워크플로우가 실행됨
- ✅ Supabase Update 노드가 성공함
- ❌ **웹에서 진행 상태가 변하지 않음** (광고문구 생성에서 멈춤)
- ❌ **브라우저 Console에 Realtime 로그가 전혀 없음**

## 🔍 문제 진단

### 문제: Supabase Realtime이 비활성화되어 있을 가능성

Supabase에서 테이블의 Realtime을 **명시적으로 활성화**해야 합니다.

## ✅ 해결 단계

### 1단계: Supabase Realtime 활성화 (SQL 실행)

**Supabase Dashboard에서:**

1. Supabase Dashboard 접속
2. **SQL Editor** 클릭
3. 다음 SQL 실행:

```sql
-- ad_videos 테이블을 Realtime Publication에 추가
ALTER PUBLICATION supabase_realtime ADD TABLE public.ad_videos;

-- REPLICA IDENTITY 설정 (모든 컬럼 변경 감지)
ALTER TABLE public.ad_videos REPLICA IDENTITY FULL;
```

또는 프로젝트의 SQL 파일 실행:

```bash
# supabase/check_realtime.sql 파일 실행
```

### 2단계: Supabase Dashboard에서 확인

**Database → Replication:**

1. Supabase Dashboard → **Database** → **Replication**
2. **Publications** 탭 클릭
3. `supabase_realtime` publication 찾기
4. **Tables** 목록에서 `ad_videos` 체크박스가 **체크**되어 있는지 확인

**만약 체크박스가 없거나 비활성화:**
- 체크박스 클릭하여 활성화
- **Save** 클릭

### 3단계: 웹 앱 재시작

디버깅 로그가 추가되었으므로 웹 앱을 재시작:

```bash
# 터미널에서
pnpm dev
```

### 4단계: 테스트 및 로그 확인

1. **웹 브라우저 열기** (`http://localhost:3000`)
2. **개발자 도구 Console 열기** (F12)
3. 업로드 페이지로 이동
4. 이미지 업로드 + 상품명 입력
5. **"영상 생성 시작"** 클릭

**Console에서 확인해야 할 로그:**

```javascript
// 1. 구독 시작
🔔 [Realtime] Subscribing to ad_video: <uuid>

// 2. 구독 상태
🔌 [Realtime] Subscription status: SUBSCRIBED

// 3. UPDATE 이벤트 (n8n이 DB 업데이트할 때마다)
📨 [Realtime] UPDATE received: { ... }
📊 [Realtime] Updated video data: {
  status: "processing",
  progress_stage: "ad_copy_generation",
  error_message: null
}

// 4. 다음 단계 업데이트
📨 [Realtime] UPDATE received: { ... }
📊 [Realtime] Updated video data: {
  status: "processing",
  progress_stage: "image_refinement",
  error_message: null
}

// ... 계속
```

## 🐛 문제 별 해결 방법

### 문제 1: Console에 아무 로그도 없음

**원인:** 페이지가 로드되지 않았거나 hook이 실행되지 않음

**해결:**
1. 브라우저 새로고침 (F5)
2. 개발자 도구 Console 탭 확인
3. 필터가 "All levels"로 설정되어 있는지 확인

### 문제 2: "Subscribing" 로그는 있지만 "Subscription status"가 없음

**원인:** Supabase 연결 문제

**해결:**
```javascript
// 브라우저 Console에서 실행
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

// 연결 테스트
const { data, error } = await supabase.from('ad_videos').select('*').limit(1);
console.log('Supabase 연결:', data ? '성공' : '실패', error);
```

### 문제 3: "Subscription status: CHANNEL_ERROR"

**원인:** Realtime이 비활성화되어 있음

**해결:**
1. 위의 [1단계](#1단계-supabase-realtime-활성화-sql-실행) 다시 실행
2. Supabase Dashboard → Database → Replication 확인
3. `ad_videos` 테이블 체크박스 활성화

### 문제 4: "Subscribing" 및 "SUBSCRIBED"는 되지만 UPDATE 이벤트가 안 옴

**원인:** n8n이 실제로 DB를 업데이트하지 않음

**해결:**

#### A. Supabase에서 직접 확인

```sql
-- 최근 ad_videos 레코드 확인
SELECT id, status, progress_stage, updated_at
FROM ad_videos
ORDER BY created_at DESC
LIMIT 5;

-- 3초마다 새로고침하여 progress_stage가 변하는지 확인
```

**만약 progress_stage가 변하지 않으면:**
- n8n Execution 로그 확인
- Update 노드가 **초록색**인지 확인
- Update 노드 Input 데이터에서 올바른 UUID 확인

#### B. n8n Update 노드 다시 확인

각 Update 노드의 **keyValue**가 다음과 같은지 확인:

```javascript
={{ $('Webhook').first().json.body.ad_video_id }}
```

**잘못된 예시:**
```javascript
={{ $('Extract Workflow Data').item.json.ad_video_id }}  // ❌
={{ $json.ad_video_id }}  // ❌
```

### 문제 5: Supabase는 업데이트되는데 Realtime이 안 옴

**원인:** REPLICA IDENTITY 설정 문제

**해결:**

```sql
-- REPLICA IDENTITY 확인
SELECT
    tablename,
    CASE relreplident
        WHEN 'd' THEN 'default (primary key)'
        WHEN 'n' THEN 'nothing'
        WHEN 'f' THEN 'full'
        WHEN 'i' THEN 'index'
    END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_tables t ON t.schemaname = n.nspname AND t.tablename = c.relname
WHERE n.nspname = 'public'
AND c.relname = 'ad_videos';

-- FULL로 설정
ALTER TABLE public.ad_videos REPLICA IDENTITY FULL;
```

## 🧪 수동 테스트

### Supabase에서 직접 UPDATE 실행

Realtime이 작동하는지 테스트:

1. **웹 브라우저에서 업로드 페이지 열기**
2. **개발자 도구 Console 열기**
3. **영상 생성 시작 클릭** (ad_video 레코드 생성)
4. Console에서 ad_video_id 확인:
   ```javascript
   🔔 [Realtime] Subscribing to ad_video: <여기 UUID 복사>
   ```

5. **Supabase SQL Editor에서 직접 업데이트:**
   ```sql
   UPDATE public.ad_videos
   SET progress_stage = 'image_refinement'
   WHERE id = '<위에서 복사한 UUID>';
   ```

6. **웹 브라우저 Console 확인:**
   ```javascript
   📨 [Realtime] UPDATE received: { ... }
   ```

**만약 UPDATE 이벤트가 오면:** ✅ Realtime 작동함! n8n 문제임
**만약 UPDATE 이벤트가 안 오면:** ❌ Realtime 설정 문제

## 📋 종합 체크리스트

### Supabase 설정:
- [ ] `supabase_realtime` publication에 `ad_videos` 테이블 추가됨
- [ ] `ad_videos` 테이블 REPLICA IDENTITY가 FULL로 설정됨
- [ ] Supabase Dashboard → Database → Replication에서 `ad_videos` 체크박스 활성화됨

### n8n 설정:
- [ ] 모든 Update 노드의 keyValue가 `$('Webhook').first().json.body.ad_video_id`
- [ ] n8n Execution 로그에서 Update 노드들이 **초록색** (성공)
- [ ] Update 노드 Input에서 올바른 UUID 확인

### 웹 앱:
- [ ] 웹 앱 재시작됨 (디버깅 로그 반영)
- [ ] Console에서 `🔔 [Realtime] Subscribing` 로그 보임
- [ ] Console에서 `🔌 [Realtime] Subscription status: SUBSCRIBED` 로그 보임
- [ ] Supabase 수동 UPDATE 시 `📨 [Realtime] UPDATE received` 로그 보임

## 🎉 성공 기준

모든 설정 완료 후:

✅ **Console 로그:**
```
🔔 [Realtime] Subscribing to ad_video: <uuid>
🔌 [Realtime] Subscription status: SUBSCRIBED
📨 [Realtime] UPDATE received: { ... }
📊 [Realtime] Updated video data: { status: "processing", progress_stage: "ad_copy_generation" }
📨 [Realtime] UPDATE received: { ... }
📊 [Realtime] Updated video data: { status: "processing", progress_stage: "image_refinement" }
...
```

✅ **웹 UI:**
```
초기화 (0%) → 광고 문구 생성 중 (14%) → 이미지 분석 중 (28%) → ...
```

✅ **에러 발생 시:**
```
📨 [Realtime] UPDATE received: { ... }
📊 [Realtime] Updated video data: { status: "failed", progress_stage: "error", error_message: "..." }
웹 UI: "영상 생성에 실패했습니다" (빨간색 경고)
```

완료! 🎊