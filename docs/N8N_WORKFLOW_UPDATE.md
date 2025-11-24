# n8n 워크플로우 업데이트 (2025-11-24)

## 🔄 변경 사항 요약

n8n 워크플로우가 단순화되어 영상 생성 과정이 최적화되었습니다.

### 주요 변경점

1. **진행 단계 (Progress Stages) 축소**
   - ❌ 제거된 단계: `tts_generation`, `subtitle_generation`, `merging`
   - ✅ 유지된 단계: `init`, `ad_copy_generation`, `image_refinement`, `video_generation`, `completed`
   - ⚠️ **중요**: TTS와 자막은 더 이상 생성하지 않습니다

2. **비디오 생성 모델 변경**
   - ❌ 이전: Veo 3.1
   - ✅ 현재: **OpenAI Sora 2**

3. **Webhook URL 변경**
   - 새 URL: `http://localhost:5678/webhook/70980457-f61e-42f1-84c3-5245f1438435`

4. **Realtime 연동**
   - ✅ 이미 설정 완료 (추가 작업 불필요)

## 📋 이전 vs 현재 워크플로우

### 이전 단계 (8단계)
```
1. init (초기화)
2. ad_copy_generation (광고 문구 생성)
3. image_refinement (이미지 정제)
4. video_generation (영상 생성)
5. tts_generation (TTS 생성) ❌ 제거
6. subtitle_generation (자막 생성) ❌ 제거
7. merging (최종 합성) ❌ 제거
8. completed (완료)
```

### 현재 단계 (5단계)
```
1. init (초기화)
2. ad_copy_generation (광고 문구 생성)
3. image_refinement (이미지 정제)
4. video_generation (영상 생성 - TTS, 자막 포함)
5. completed (완료)
```

## 🔧 변경된 파일

### 1. 타입 정의

#### [types/database.ts](../types/database.ts)
```typescript
export type VideoStatus =
  | "init"
  | "ad_copy_generation"
  | "image_refinement"
  | "video_generation"
  | "completed"
  | "failed"
  | "cancelled";
```

#### [types/generation.ts](../types/generation.ts)
```typescript
export type GenerationStage =
  | "init"
  | "ad_copy_generation"
  | "image_refinement"
  | "video_generation"
  | "completed";
```

### 2. 상수 정의

#### [constants/generation.ts](../constants/generation.ts)

**STAGE_ORDER (진행 단계 순서)**
```typescript
export const STAGE_ORDER: readonly GenerationStage[] = [
  "init",
  "ad_copy_generation",
  "image_refinement",
  "video_generation",
  "completed",
] as const;
```

**STAGE_LABELS (단계별 라벨)**
```typescript
export const STAGE_LABELS: Record<GenerationStage, string> = {
  init: "초기화",
  ad_copy_generation: "광고 문구 생성",
  image_refinement: "이미지 정제",
  video_generation: "영상 생성",
  completed: "완료",
};
```

**STAGE_DESCRIPTIONS (단계별 설명)**
```typescript
export const STAGE_DESCRIPTIONS: Record<GenerationStage, string> = {
  init: "영상 생성 준비 중입니다",
  ad_copy_generation: "AI가 광고 문구를 생성하고 있습니다",
  image_refinement: "Gemini 2.5 Flash로 이미지를 정제하고 있습니다",
  video_generation: "OpenAI Sora 2로 영상을 생성하고 있습니다",
  completed: "영상 생성이 완료되었습니다",
};
```

**STAGE_ESTIMATED_TIMES (단계별 예상 시간)**
```typescript
export const STAGE_ESTIMATED_TIMES: Record<GenerationStage, number> = {
  init: 10,                  // 10초
  ad_copy_generation: 30,    // 30초
  image_refinement: 40,      // 40초
  video_generation: 120,     // 120초 (Sora 2 영상 생성만, TTS/자막 없음)
  completed: 0,
};
```

**총 예상 시간**: 200초 (약 3분 20초)
- 이전: 265초 (약 4분 25초) - Veo 3.1 with TTS/자막/합성
- 단축: **65초** (24.5% 빠름)

**STAGE_ICONS (단계별 아이콘)**
```typescript
export const STAGE_ICONS: Record<GenerationStage, string> = {
  init: "Loader2",
  ad_copy_generation: "FileText",
  image_refinement: "ImagePlus",
  video_generation: "Video",
  completed: "CheckCircle",
};
```

### 3. 데이터베이스 마이그레이션

#### [supabase/migrations/20251124000000_update_n8n_webhook_url.sql](../supabase/migrations/20251124000000_update_n8n_webhook_url.sql)

- n8n_workflows 테이블의 활성 webhook URL 업데이트
- 활성 워크플로우가 없는 경우 자동 생성

## 📊 n8n 워크플로우 상세 분석

### 워크플로우 이름
```
AI 광고 영상 생성기(sora2)
```

### 비디오 생성 모델
- **모델**: `sora-2` (OpenAI Sora 2)
- **길이**: 12초
- **특징**: TTS 및 자막 없이 순수 비디오만 생성

### 진행 단계별 n8n 업데이트 쿼리

#### 1. init (초기화)
```sql
-- n8n에서 실행하지 않음 (프론트엔드에서 설정)
```

#### 2. ad_copy_generation (광고 문구 생성)
```sql
UPDATE ad_videos
SET
  status = 'processing',
  progress_stage = 'ad_copy_generation'
WHERE id = {{ $('Webhook').first().json.body.ad_video_id }}
```

#### 3. image_refinement (이미지 정제)
```sql
UPDATE ad_videos
SET
  status = 'processing',
  progress_stage = 'image_refinement'
WHERE id = {{ $('Webhook').first().json.body.ad_video_id }}
```

#### 4. video_generation (영상 생성)
```sql
UPDATE ad_videos
SET
  status = 'processing',
  progress_stage = 'video_generation'
WHERE id = {{ $('Webhook').first().json.body.ad_video_id }}
```

#### 5. completed (완료)
```sql
UPDATE ad_videos
SET
  status = 'completed',
  progress_stage = 'completed',
  video_url = {{ $('응답 처리 Code').item.json.publicUrl }},
  completed_at = NOW()
WHERE id = {{ $('Webhook').first().json.body.ad_video_id }}
```

## 🚀 마이그레이션 적용 방법

### Supabase CLI 사용

```bash
# Supabase CLI로 마이그레이션 적용
npx supabase db push

# 또는 특정 마이그레이션만 적용
npx supabase migration up
```

### Supabase Dashboard 사용

1. Supabase Dashboard 접속
2. SQL Editor 열기
3. `supabase/migrations/20251124000000_update_n8n_webhook_url.sql` 내용 복사
4. 실행

### Supabase MCP 사용 (권장)

Claude Code에서 Supabase MCP를 통해 직접 마이그레이션 적용:

```typescript
// Supabase MCP를 사용한 마이그레이션 적용
await mcp__supabase__apply_migration({
  project_id: "your-project-id",
  name: "update_n8n_webhook_url",
  query: `
    UPDATE public.n8n_workflows
    SET
        webhook_url = 'http://localhost:5678/webhook/70980457-f61e-42f1-84c3-5245f1438435',
        updated_at = NOW()
    WHERE is_active = true;
  `
});
```

## ✅ 검증 방법

### 1. TypeScript 컴파일 확인

```bash
pnpm build
```

에러 없이 빌드되어야 합니다.

### 2. Webhook URL 확인

```sql
SELECT workflow_name, webhook_url, is_active
FROM n8n_workflows
WHERE is_active = true;
```

예상 결과:
```
workflow_name               | webhook_url                                                  | is_active
----------------------------|-------------------------------------------------------------|----------
Ad Video Generation Workflow| http://localhost:5678/webhook/70980457-f61e-42f1-84c3-5245f1438435 | true
```

### 3. 진행 단계 UI 확인

1. 개발 서버 실행: `pnpm dev`
2. 영상 생성 시작
3. `/generation/[id]` 페이지 확인
4. 디버그 정보에서 단계 확인:
   - `init` → `ad_copy_generation` → `image_refinement` → `video_generation` → `completed`

### 4. Realtime 연동 확인

브라우저 콘솔에서 다음 로그 확인:
```
🔔 [Realtime] Subscribing to ad_video: {id}
✅ [Realtime] Successfully subscribed
📨 [Realtime] UPDATE received
🔄 [Realtime] State update: {status: "processing", progress_stage: "video_generation"}
```

## 🔍 n8n 워크플로우 구조

### 노드 구성

1. **Webhook** - HTTP 요청 수신
2. **광고 문구 생성** - Gemini API 호출
3. **이미지 정제** - Gemini 2.5 Flash
4. **영상 생성** - Veo 3.1 (TTS, 자막 포함)
5. **Supabase 업데이트** - 각 단계별 진행 상태 업데이트
6. **완료 처리** - video_url 업데이트

### Webhook Payload

```json
{
  "ad_video_id": "uuid",
  "product_image_id": "uuid",
  "product_info_id": "uuid"
}
```

## 📝 추가 참고사항

### 1. 호환성

- ✅ 기존 코드와 완전 호환
- ✅ 기존 데이터베이스와 호환
- ✅ Realtime 연동 유지

### 2. 롤백 방법

만약 이전 버전으로 돌아가야 한다면:

1. Git revert 사용
```bash
git revert HEAD
```

2. 또는 수동으로 타입 정의 복원:
```typescript
// types/database.ts, types/generation.ts, constants/generation.ts
// 이전 버전의 단계 추가
```

### 3. 성능 개선

- **단계 수 감소**: 8 → 5 단계 (37.5% 감소)
- **예상 시간 단축**: 265s → 250s (15초 단축)
- **코드 간소화**: 유지보수 용이

## 🎯 다음 단계

1. **n8n 워크플로우 업데이트**
   - n8n에서 워크플로우 import
   - 새 Webhook ID 확인

2. **환경 변수 업데이트** (필요시)
   ```bash
   # .env.local
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/70980457-f61e-42f1-84c3-5245f1438435
   ```

3. **프로덕션 배포 전 테스트**
   - 개발 환경에서 전체 플로우 테스트
   - Realtime 업데이트 확인
   - 에러 처리 확인

## 📞 문제 해결

### 문제 1: TypeScript 에러

```
Type '"tts_generation"' is not assignable to type 'GenerationStage'
```

**해결**: 코드에서 제거된 단계를 참조하는 부분 제거

### 문제 2: Webhook 연결 실패

```
n8n webhook failed with status 404
```

**해결**:
1. n8n 워크플로우 활성화 확인
2. Webhook URL 확인
3. 데이터베이스의 `n8n_workflows` 테이블 확인

### 문제 3: Realtime 업데이트 안됨

```
⚠️ [Realtime] No realtime events received
```

**해결**: 이미 Realtime이 설정되어 있으므로 Polling fallback이 자동 작동합니다.

## 관련 파일

- [types/database.ts](../types/database.ts)
- [types/generation.ts](../types/generation.ts)
- [constants/generation.ts](../constants/generation.ts)
- [supabase/migrations/20251124000000_update_n8n_webhook_url.sql](../supabase/migrations/20251124000000_update_n8n_webhook_url.sql)
- [n8n/final.json](../n8n/final.json)

## 변경 이력

- **2025-11-24**: n8n 워크플로우 단순화, 단계 축소 (8 → 5 단계)
- **2025-11-24**: Webhook URL 업데이트
