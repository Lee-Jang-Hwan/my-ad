# 영상 생성 완료 후 페이지 이동 문제 해결

## 문제 상황

영상 생성이 완료되었는데 자동으로 영상 페이지(`/video/[id]`)로 이동하지 않는 문제가 발생했습니다.

## 원인 분석

여러 가지 원인이 있을 수 있습니다:

1. **상태 불일치**: `isCompleted` 플래그가 true가 되지 않음
2. **video_url 누락**: n8n 워크플로우에서 `video_url`을 업데이트하지 않음
3. **Realtime 연결 문제**: Supabase Realtime이 제대로 작동하지 않아 상태 업데이트가 전달되지 않음
4. **디버깅 부족**: 어느 단계에서 문제가 발생하는지 추적할 수 없음

## 해결 방법

### 1. useGenerationComplete 훅 개선

#### 변경 사항 ([use-generation-complete.ts](../hooks/use-generation-complete.ts))

- **이중 체크 로직 추가**
  ```typescript
  const shouldRedirect =
    (isCompleted && video) ||
    (video?.status === "completed");
  ```
  - `isCompleted` 플래그 체크
  - `video.status === "completed"` 직접 체크
  - 두 조건 중 하나만 만족해도 리디렉션 실행

- **video_url 없이도 리디렉션 허용**
  ```typescript
  if (shouldRedirect && video) {
    if (!video.video_url) {
      console.warn("⚠️ Video URL is missing! Still redirecting...");
    }
    // 리디렉션 실행
  }
  ```
  - `video_url`이 없어도 `/video/[id]` 페이지로 이동
  - 해당 페이지에서 별도로 에러 처리

- **상세한 디버깅 로그**
  - 모든 상태 변화 추적
  - 리디렉션 조건 체크 결과 로깅
  - 타임아웃 및 cleanup 로깅

### 2. useRealtimeVideo 훅 로그 강화

#### 변경 사항 ([use-realtime-video.ts](../hooks/use-realtime-video.ts))

- **Realtime 업데이트 로깅**
  ```typescript
  console.log("🔄 [Realtime] State update:", {
    previousStatus: prev.video.status,
    newStatus: updatedVideo.status,
    previousStage: prev.currentStage,
    newStage,
    isCompleted,
    isFailed,
    hasVideoUrl: !!updatedVideo.video_url,
    videoUrl: updatedVideo.video_url,
  });
  ```

- **Polling 업데이트 로깅**
  - Realtime이 실패한 경우 polling으로 fallback
  - polling에서도 동일한 상세 로그 출력

### 3. GenerationProgress 컴포넌트 개선

#### 변경 사항 ([generation-progress.tsx](../components/generation/generation-progress.tsx))

- **렌더링 로그 추가**
  ```typescript
  console.log("📹 [GenerationProgress] Render with state:", {
    videoId: video?.id,
    status: video?.status,
    isCompleted,
    isFailed,
    currentStage,
    progressPercent,
    hasVideoUrl: !!video?.video_url,
    videoUrl: video?.video_url,
  });
  ```

- **개발 모드 디버그 UI 추가**
  - Video ID, Status, isCompleted, isFailed 등 실시간 표시
  - video_url 유무 확인
  - 개발 환경에서만 표시 (`process.env.NODE_ENV === "development"`)

## 검증 방법

### 1. 브라우저 콘솔 확인

영상 생성이 완료되면 다음과 같은 로그가 출력되어야 합니다:

#### 정상적인 경우:
```
📨 [Realtime] UPDATE received: {...}
📊 [Realtime] Updated video data: {status: "completed", ...}
🔄 [Realtime] State update: {isCompleted: true, hasVideoUrl: true, ...}
📹 [GenerationProgress] Render with state: {isCompleted: true, ...}
🎬 [GenerationComplete] Effect triggered: {isCompleted: true, ...}
✅ [GenerationComplete] Video completed!
📊 [GenerationComplete] Video data: {video_url: "https://...", ...}
🚀 [GenerationComplete] Redirecting to /video/{id} in 2000ms...
🔄 [GenerationComplete] Executing redirect to /video/{id}
```

#### video_url이 없는 경우:
```
📨 [Realtime] UPDATE received: {...}
🔄 [Realtime] State update: {isCompleted: true, hasVideoUrl: false, ...}
🎬 [GenerationComplete] Effect triggered: {isCompleted: true, ...}
✅ [GenerationComplete] Video completed!
⚠️ [GenerationComplete] Video URL is missing! Still redirecting...
⚠️ [GenerationComplete] This might indicate n8n workflow didn't update video_url
🚀 [GenerationComplete] Redirecting to /video/{id} in 2000ms...
```

#### Realtime이 작동하지 않는 경우:
```
⚠️ [Realtime] No realtime events received, falling back to polling
🔄 [Polling] Video data changed: {status: "completed", ...}
🔄 [Polling] State update: {isCompleted: true, ...}
(이후 동일하게 리디렉션 실행)
```

### 2. 디버그 UI 확인

개발 모드에서 영상 생성 페이지(`/generation/[id]`)를 열면:
- 상단에 파란색 "디버그 정보" 카드 표시
- "상태 정보 보기"를 클릭하여 펼침
- 실시간으로 상태 변경 확인

**확인 항목:**
- ✅ **Status**: `completed`로 변경되는지
- ✅ **isCompleted**: `true`로 변경되는지
- ✅ **Has Video URL**: `Yes`로 표시되는지
- ✅ **Progress**: `100%`로 표시되는지

### 3. 데이터베이스 직접 확인

만약 여전히 리디렉션이 작동하지 않는다면, Supabase에서 직접 확인:

```sql
SELECT
  id,
  status,
  progress_stage,
  video_url,
  error_message,
  updated_at
FROM ad_videos
WHERE id = 'your-video-id'
ORDER BY updated_at DESC;
```

**확인 사항:**
- `status`가 `completed`로 변경되었는지
- `progress_stage`가 `completed`로 변경되었는지
- `video_url`이 설정되었는지 (없으면 n8n 워크플로우 문제)

## 가능한 문제 시나리오

### 시나리오 1: n8n 워크플로우가 status를 업데이트하지 않음

**증상:**
- 로그에 realtime 이벤트가 없음
- 데이터베이스에서 `status`가 여전히 `processing`

**해결:**
- n8n 워크플로우 확인
- 마지막 단계에서 `UPDATE ad_videos SET status = 'completed'` 실행 여부 확인

### 시나리오 2: video_url은 없지만 status는 completed

**증상:**
```
⚠️ [GenerationComplete] Video URL is missing! Still redirecting...
```

**해결:**
- 수정된 코드로 인해 리디렉션은 실행됨
- `/video/[id]` 페이지에서 video_url이 없으면 에러 메시지 표시
- n8n 워크플로우에서 video_url 업데이트 로직 확인

### 시나리오 3: Realtime 연결 끊김

**증상:**
```
⚠️ [Realtime] No realtime events received, falling back to polling
🔄 [Polling] Video data changed: ...
```

**해결:**
- polling이 자동으로 fallback으로 작동
- 3초마다 데이터베이스 polling
- Supabase Realtime 설정 확인 (RLS 정책 등)

### 시나리오 4: isCompleted 플래그가 설정되지 않음

**증상:**
```
⏳ [GenerationComplete] Waiting for completion... {isCompleted: false}
```

**해결:**
- 이제 `video.status === "completed"` 직접 체크도 추가되어 해결됨
- `useRealtimeVideo`에서 상태 업데이트 로직 확인

## 추가 개선 사항

### 1. 자동 리디렉션 지연 조정

현재 2초 지연 (`COMPLETION_REDIRECT_DELAY = 2000`):
```typescript
// constants/generation.ts
export const COMPLETION_REDIRECT_DELAY = 2000; // 2초
```

더 빠르게 또는 느리게 조정 가능.

### 2. Toast 알림 추가

리디렉션 전 사용자에게 알림:
```typescript
import { toast } from "sonner";

// use-generation-complete.ts에서
toast.success("영상 생성이 완료되었습니다! 잠시 후 영상 페이지로 이동합니다.");
```

### 3. 수동 리디렉션 버튼 추가

자동 리디렉션이 실패한 경우를 대비:
```tsx
{isCompleted && (
  <Button onClick={() => router.push(`/video/${video.id}`)}>
    영상 보러 가기
  </Button>
)}
```

## 프로덕션 배포 전 작업

개발이 완료되고 문제가 해결되었다면:

1. **디버그 로그 정리**
   - console.log 제거 또는 환경변수로 제어
   - 프로덕션에서는 최소한의 로그만 유지

2. **디버그 UI 제거 확인**
   - `process.env.NODE_ENV === "development"` 조건 확인
   - 프로덕션 빌드 테스트

3. **성능 테스트**
   - Realtime 연결 안정성 확인
   - Polling fallback 작동 확인

## 관련 파일

- [hooks/use-generation-complete.ts](../hooks/use-generation-complete.ts) - 자동 리디렉션 로직
- [hooks/use-realtime-video.ts](../hooks/use-realtime-video.ts) - Realtime 구독 및 상태 관리
- [components/generation/generation-progress.tsx](../components/generation/generation-progress.tsx) - 진행 상황 표시
- [app/generation/[id]/page.tsx](../app/generation/[id]/page.tsx) - 생성 진행 페이지
- [constants/generation.ts](../constants/generation.ts) - 리디렉션 지연 설정

## 다음 단계

1. 개발 서버에서 영상 생성 전체 플로우 테스트
2. 브라우저 콘솔에서 로그 확인
3. 디버그 UI에서 상태 변경 확인
4. 문제가 여전히 발생하면 로그 공유 및 추가 분석
