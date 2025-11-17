# AI 홍보영상 자동 생성 서비스 - TODO List

## 📚 기술 스택 개요

### Frontend

- **Framework**: Next.js 15.5.6 (React 19, App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Context API (기본), Zustand (복잡한 전역 상태 시)
- **API Communication**: Server Actions 우선, RESTful API Routes (웹훅/외부 API)

### Backend & Database

- **Database**: Supabase (PostgreSQL + Storage)
- **Authentication**: Clerk (한국어 지원)
- **RLS**: 미사용 (서버 사이드 권한 체크)

### AI & Workflow

- **Workflow Engine**: n8n
- **AI Platform**: Google Vertex AI (Gemini, Veo)
- **Integration**: n8n Webhook → Supabase Realtime

### Build & Deploy

- **Package Manager**: pnpm
- **Build Tool**: Next.js built-in (Turbopack)
- **Deploy**: Vercel (예정)

### 아키텍처 레이어

```
Frontend (Next.js + React)
    ↓
API Layer (Server Actions + API Routes)
    ↓
n8n Webhook Integration
    ↓
n8n AI Workflows (Google Vertex AI)
    ↓
Data & Storage Layer (Supabase + Clerk)
```

---

## Phase 1: 기본 인프라 (1주)

- [x] 프로젝트 초기 설정

  - [x] Next.js 15.5.6 프로젝트 셋업
  - [x] Supabase 프로젝트 생성
  - [x] Clerk 인증 연동
  - [x] 환경변수 설정 (`.env`)

- [x] 데이터베이스 마이그레이션

  - [x] `supabase/migrations/my_ad_schema.sql` 생성
    - [x] `users` 테이블
    - [x] `product_images` 테이블
    - [x] `product_info` 테이블
    - [x] `ad_videos` 테이블
    - [x] `n8n_workflows` 테이블
    - [x] 인덱스 및 RLS 정책
    - [x] 샘플 데이터 (20개)

- [x] Supabase Storage 설정

  - [x] Dashboard에서 `uploads` 버킷 생성 (10MB, 이미지)
    - ✅ MIME types: jpeg, png, jpg, webp
  - [x] Dashboard에서 `videos` 버킷 생성 (50MB, 영상)
    - ✅ MIME types: mp4, webm, quicktime
  - [x] `supabase/migrations/my_ad_storage.sql` 실행
    - [x] RLS 정책 설정
    - [x] 헬퍼 함수 생성
    - [x] 뷰 생성

- [x] Supabase 클라이언트 설정

  - [x] `lib/supabase/clerk-client.ts` 확인/수정
    - ✅ 2025 Clerk + Supabase 네이티브 통합 패턴 구현
    - ✅ useClerkSupabaseClient() hook 제공
  - [x] `lib/supabase/server.ts` 확인/수정
    - ✅ createClerkSupabaseClient() 함수 제공
    - ✅ Server Component/Server Action용
  - [x] `lib/supabase/service-role.ts` 확인/수정
    - ✅ getServiceRoleClient() 함수 제공
    - ✅ 관리자 권한 작업용

- [x] 기본 레이아웃 및 라우팅
  - [x] `app/layout.tsx` 최적화
    - ✅ SEO 메타데이터 업데이트 (title, description, keywords, OpenGraph)
    - ✅ Semantic HTML 구조 (header, main, footer)
    - ✅ min-h-screen flex layout 구조
    - ✅ suppressHydrationWarning 추가
  - [x] `components/Navbar.tsx` 업데이트
    - ✅ 브랜드명 변경 ("AI 홍보영상 생성")
    - ✅ Sticky header (sticky top-0)
    - ✅ 인증 상태별 네비게이션 링크 (내 영상, 영상 만들기)
    - ✅ 반투명 배경 + backdrop-blur 효과
  - [x] `app/page.tsx` (홈페이지 라우트)
    - ✅ Hero Section (서비스 소개 + CTA 버튼)
    - ✅ How It Works Section (3단계 사용 방법)
    - ✅ Sample Videos Section (샘플 영상 그리드)
  - [x] `components/footer.tsx` 푸터 컴포넌트
    - ✅ 4-column grid layout (회사정보, 빠른링크, 리소스, 법적)
    - ✅ Social media links
    - ✅ Copyright notice
  - [x] shadcn/ui 컴포넌트 설치
    - ✅ Card component
    - ✅ Badge component
    - ✅ Separator component
    - ✅ Input, Label, Form components
  - [x] `app/upload/page.tsx` (업로드 페이지 라우트)
    - ✅ Image dropzone with drag & drop (react-dropzone)
    - ✅ Image preview with file info
    - ✅ Product name form (react-hook-form + Zod validation)
    - ✅ Submit button with loading state
    - ✅ Server actions: uploadImage, saveProductInfo, triggerN8nWorkflow
    - ✅ Type definitions (types/database.ts, types/upload.ts)
    - ✅ Validation schemas (lib/validation.ts)
    - ✅ Error handling and user feedback
  - [x] `app/generation/[id]/page.tsx` (진행 상태 페이지 라우트)
  - [x] `app/dashboard/page.tsx` (대시보드 라우트)
  - [x] `app/video/[id]/page.tsx` (영상 상세 페이지 라우트)

---

## Phase 2: 업로드 기능 (1주)

### 홈페이지 UI

- [x] `app/page.tsx` 홈페이지 구현
  - [x] `components/home/hero-section.tsx` 히어로 섹션
    - ✅ 서비스 소개 문구
    - ✅ CTA 버튼 (지금 시작하기)
    - ✅ 샘플 영상 표시
  - [x] `components/home/how-it-works.tsx` 사용 방법 안내
    - ✅ 3단계 프로세스 설명
    - ✅ 각 단계별 아이콘 및 설명
  - [x] `components/home/sample-videos.tsx` 샘플 영상 그리드
  - [x] `components/home/footer.tsx` 홈 푸터

### 업로드 페이지

- [x] `app/upload/page.tsx` 업로드 페이지
  - [x] `components/upload/image-dropzone.tsx` 이미지 드래그 앤 드롭
    - ✅ react-dropzone 통합
    - ✅ 파일 선택 버튼
    - ✅ 파일 크기 검증 (최대 10MB)
    - ✅ MIME 타입 검증 (jpeg, png, jpg, webp)
  - [x] `components/upload/image-preview.tsx` 이미지 프리뷰
    - ✅ 썸네일 표시
    - ✅ 파일 정보 (이름, 크기)
    - ✅ 삭제 버튼
  - [x] `components/upload/product-form.tsx` 상품 정보 입력 폼
    - ✅ 상품명 입력 (필수, 1-200자)
    - ✅ react-hook-form + Zod 검증
  - [x] `components/upload/upload-form.tsx` 메인 업로드 폼 (submit 포함)
    - ✅ 로딩 상태 표시
    - ✅ 비활성화 로직

### Server Actions

- [x] `actions/upload-image.ts` 이미지 업로드 액션

  - ✅ Clerk 사용자 인증 확인
  - ✅ Supabase Storage에 이미지 저장
  - ✅ `product_images` 테이블에 메타데이터 저장
  - ✅ 에러 핸들링 (업로드 실패, 용량 초과 등)

- [x] `actions/save-product-info.ts` 상품 정보 저장 액션

  - ✅ `product_info` 테이블에 저장
  - ✅ 입력 데이터 검증 (Zod)

- [x] `actions/trigger-n8n.ts` n8n 웹훅 트리거 액션
  - ✅ `ad_videos` 레코드 생성 (status: init)
  - ✅ n8n 웹훅 호출
    ```json
    {
      "ad_video_id": "uuid",
      "product_info_id": "uuid",
      "user_id": "uuid",
      "clerk_id": "string"
    }
    ```
  - ✅ 웹훅 응답 확인 (executionId 저장)
  - ✅ 에러 핸들링 (실패 시 status: failed)

### Types

- [x] `types/database.ts` 데이터베이스 타입

  - ✅ ProductImage 타입
  - ✅ ProductInfo 타입
  - ✅ AdVideo 타입
  - ✅ VideoStatus 타입 (8단계)
  - ✅ N8nWorkflow 타입

- [x] `types/upload.ts` 업로드 관련 타입
  - ✅ UploadFormData 타입
  - ✅ ImageFile 타입
  - ✅ ValidationError 타입
  - ✅ Result 타입들 (UploadImageResult, SaveProductInfoResult, TriggerN8nResult)

---

## Phase 3: 진행 상태 표시 (1주)

### 진행 상태 페이지

- [x] `app/generation/[id]/page.tsx` 진행 상태 페이지
  - [x] `components/generation/step-indicator.tsx` 스텝 인디케이터
    - [x] 8단계 표시 (init → completed)
    - [x] 현재 단계 강조
    - [x] 완료/진행 중/대기 상태 구분
  - [x] `components/generation/stage-icons.tsx` 각 단계별 아이콘
    - [x] lucide-react 아이콘 사용
    - [x] 단계별 설명 텍스트
  - [x] `components/generation/loading-animation.tsx` 로딩 애니메이션
    - [x] 단계별 맞춤 애니메이션
  - [x] `components/generation/estimated-time.tsx` 예상 소요 시간 표시
    - [x] 단계별 소요 시간 계산
    - [x] 남은 시간 카운트다운
  - [x] `components/generation/cancel-button.tsx` 취소 버튼 (선택)

### Supabase Realtime 구독

- [x] `hooks/use-realtime-video.ts` Realtime 구독 훅

  - [x] `ad_videos` 테이블 실시간 구독
  - [x] `progress_stage` 변경 감지
  - [x] `status` 변경 감지
  - [x] 자동 리렌더링

- [ ] `components/generation/realtime-provider.tsx` Realtime 프로바이더 (선택, 현재는 훅으로 충분)
  - [ ] Supabase Realtime 연결 관리
  - [ ] 재연결 로직

### 에러 핸들링

- [x] `components/generation/error-message.tsx` 에러 메시지 표시

  - [x] `error_message` 필드 파싱
  - [x] 에러 타입별 메시지
  - [x] 재시도 가이드

- [x] `components/generation/retry-button.tsx` 재시도 버튼
  - [x] `actions/retry-generation.ts` 재시도 액션
  - [x] status/progress_stage 초기화
  - [x] n8n 웹훅 재호출

### 완료 시 리다이렉션

- [x] `hooks/use-generation-complete.ts` 완료 감지 훅
  - [x] status: 'completed' 감지
  - [x] `/video/[id]`로 자동 이동
  - [x] 완료 알림 (toast)

---

## Phase 4: 영상 관리 (1주)

### 대시보드 (마이페이지)

- [x] `app/dashboard/page.tsx` 대시보드 페이지

  - [x] `components/dashboard/video-grid.tsx` 영상 그리드
    - [x] 썸네일 그리드 레이아웃
    - [x] 무한 스크롤 or 페이지네이션
  - [x] `components/dashboard/video-card.tsx` 영상 카드
    - [x] 썸네일 이미지
    - [x] 상품명
    - [x] 생성 날짜
    - [x] 상태 배지 (생성 중, 완료, 실패)
    - [x] 상세보기 버튼
  - [x] `components/dashboard/filter-bar.tsx` 필터 바
    - [x] 상태별 필터 (전체, 생성 중, 완료, 실패)
    - [x] 날짜 정렬 (최신순, 오래된순)
  - [x] `components/dashboard/empty-state.tsx` 빈 상태 UI
    - [x] 영상 없을 때 표시
    - [x] CTA 버튼 (첫 영상 만들기)

- [x] `actions/fetch-user-videos.ts` 사용자 영상 목록 조회 액션
  - [x] Clerk user ID로 필터링
  - [x] 상태별 필터 적용
  - [x] 정렬 적용
  - [x] 페이지네이션

### 영상 상세 페이지

- [x] `app/video/[id]/page.tsx` 영상 상세 페이지
  - [x] `components/video/video-player.tsx` 영상 플레이어
    - [x] HTML5 video 태그 or react-player
    - [x] 재생/일시정지
    - [x] 볼륨 조절
    - [x] 전체화면
    - [x] 재생 시간 표시
  - [x] `components/video/video-info.tsx` 영상 정보
    - [x] 상품명
    - [x] 생성 날짜
    - [x] 영상 길이
    - [x] 파일 크기
  - [x] `components/video/action-buttons.tsx` 액션 버튼
    - [x] 다운로드 버튼
    - [x] 링크 복사 버튼
    - [ ] SNS 공유 버튼 (Phase 5)

### 다운로드 기능

- [x] `actions/download-video.ts` 영상 다운로드 액션

  - [x] Supabase Storage에서 영상 URL 가져오기
  - [x] 파일명 자동 생성 (상품명 + 날짜)
  - [x] 다운로드 트리거

- [x] `components/video/download-button.tsx` 다운로드 버튼
  - [x] 로딩 상태
  - [ ] 다운로드 진행률 (선택)

### 링크 복사

- [x] `components/video/copy-link-button.tsx` 링크 복사 버튼
  - [x] 클립보드 API 사용
  - [x] 복사 완료 알림 (toast)

---

## Phase 5: SNS 공유 (1-2주) - 추후 개발 예정

> **참고:** 이 기능은 추후 개발 예정입니다. Instagram OAuth 인증 부분만 현재 완료되었습니다.

### Instagram 연동

- [x] `app/api/auth/instagram/route.ts` Instagram OAuth

  - [x] Instagram Graph API 인증
  - [x] Access Token 저장

- [ ] `actions/upload-to-instagram.ts` Instagram 업로드 액션

  - [ ] 비즈니스 계정 확인
  - [ ] 영상 업로드 API 호출
  - [ ] 업로드 상태 확인

- [ ] `components/video/instagram-button.tsx` Instagram 공유 버튼

### Facebook 연동

- [ ] `app/api/auth/facebook/route.ts` Facebook OAuth

  - [ ] Facebook Graph API 인증
  - [ ] Access Token 저장

- [ ] `actions/upload-to-facebook.ts` Facebook 업로드 액션

  - [ ] 페이지 연결 확인
  - [ ] 영상 업로드 API 호출

- [ ] `components/video/facebook-button.tsx` Facebook 공유 버튼

### YouTube 연동

- [ ] `app/api/auth/youtube/route.ts` YouTube OAuth

  - [ ] YouTube Data API v3 인증
  - [ ] Access Token 저장

- [ ] `actions/upload-to-youtube.ts` YouTube 업로드 액션

  - [ ] 채널 연결 확인
  - [ ] 영상 업로드 API 호출
  - [ ] 메타데이터 설정 (제목, 설명, 태그)

- [ ] `components/video/youtube-button.tsx` YouTube 공유 버튼

### SNS 공유 공통

- [ ] `types/sns.ts` SNS 관련 타입

  - [ ] SocialPlatform 타입
  - [ ] UploadStatus 타입
  - [ ] AuthToken 타입

- [ ] `lib/sns/` SNS 유틸리티
  - [ ] `instagram.ts` Instagram API 헬퍼
  - [ ] `facebook.ts` Facebook API 헬퍼
  - [ ] `youtube.ts` YouTube API 헬퍼

---

## Phase 6: n8n 워크플로우 수정 (1-2일)

> **참고:** 이 작업은 추후 n8n 워크플로우가 준비되면 진행 예정입니다.

### n8n 워크플로우 노드 추가

- [ ] `my-ad.json` 워크플로우 수정 (추후 구현)
  - [ ] Supabase Update 노드 추가 (광고문구 생성 후)
    - [ ] progress_stage: 'ad_copy_generation'
    - [ ] status: 'processing'
  - [ ] Supabase Update 노드 추가 (이미지 정제 후)
    - [ ] progress_stage: 'image_refinement'
  - [ ] Supabase Update 노드 추가 (영상 생성 후)
    - [ ] progress_stage: 'video_generation'
  - [ ] Supabase Update 노드 추가 (TTS 생성 후)
    - [ ] progress_stage: 'tts_generation'
  - [ ] Supabase Update 노드 추가 (자막 생성 후)
    - [ ] progress_stage: 'subtitle_generation'
  - [ ] Supabase Update 노드 추가 (최종 합성 후)
    - [ ] progress_stage: 'merging'
  - [ ] Supabase Update 노드 추가 (완료 시)
    - [ ] progress_stage: 'completed'
    - [ ] status: 'completed'
    - [ ] video_url 업데이트
    - [ ] completed_at 업데이트

### 에러 핸들링

- [ ] n8n 에러 처리 노드 추가
  - [ ] 각 단계에서 에러 발생 시
  - [ ] status: 'failed' 업데이트
  - [ ] error_message 저장
  - [ ] 알림 전송 (선택)

### 테스트

- [ ] n8n 워크플로우 테스트
  - [ ] 전체 플로우 실행
  - [ ] 각 단계별 DB 업데이트 확인
  - [ ] 에러 케이스 테스트

---

## Phase 7: 테스트 & 배포 (1주)

### 전체 플로우 테스트

- [ ] E2E 테스트 (Playwright)

  - [ ] 회원가입/로그인 테스트
  - [ ] 이미지 업로드 테스트
  - [ ] 진행 상태 확인 테스트
  - [ ] 영상 다운로드 테스트

- [ ] 수동 테스트 시나리오
  - [ ] 정상 플로우: 업로드 → 생성 → 다운로드
  - [ ] 에러 케이스: 파일 크기 초과
  - [ ] 에러 케이스: 잘못된 파일 형식
  - [ ] 에러 케이스: n8n 워크플로우 실패
  - [ ] 재시도 기능 테스트

### 버그 수정

- [ ] 버그 리스트 작성
- [ ] 우선순위별 버그 수정
- [ ] 회귀 테스트

### 성능 최적화

- [x] 이미지 최적화
  - [x] Next.js Image 컴포넌트 사용
  - [x] WebP 변환
- [x] 코드 스플리팅
  - [x] 라우트별 분리
  - [x] 동적 import (next/dynamic 사용)
- [x] 데이터베이스 쿼리 최적화
  - [x] 인덱스 확인 및 복합 인덱스 추가
  - [x] N+1 문제 해결 (JOIN 사용)
  - [x] SELECT \* 대신 명시적 컬럼 선택
- [x] 캐싱 전략
  - [x] Next.js 15 unstable_cache 적용
  - [x] Server Actions 캐싱 (fetch-user-videos, fetch-video-detail)
  - [x] Cache revalidation 유틸리티 생성 (lib/cache.ts)
  - [x] 자동 캐시 무효화 (trigger, retry, cancel actions)

### Vercel 배포

- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정
  - [ ] Clerk 키
  - [ ] Supabase 키
  - [ ] n8n 웹훅 URL (프로덕션)
- [ ] 도메인 연결 (선택)
- [ ] 배포 확인
- [ ] 프로덕션 테스트

---

## 추가 작업

### UI/UX 개선

- [x] 다크 모드 지원
  - [x] next-themes 라이브러리 통합
  - [x] ThemeProvider 컴포넌트 생성
  - [x] ThemeToggle 버튼 컴포넌트 (Sun/Moon 아이콘)
  - [x] Navbar에 테마 토글 추가
- [x] 반응형 디자인 최적화 (모바일/태블릿)
  - [x] 모바일 메뉴 컴포넌트 (Sheet 사용)
  - [x] Navbar 반응형 레이아웃 (sm 브레이크포인트)
  - [x] 모바일 화면에서 네비게이션 링크 숨김 처리
- [x] 로딩 스켈레톤 추가
  - [x] VideoCardSkeleton 컴포넌트 (대시보드용)
  - [x] VideoGridSkeleton 컴포넌트
  - [x] UploadFormSkeleton 컴포넌트
  - [x] GenerationSkeleton 컴포넌트
- [x] 애니메이션 및 트랜지션 (기존 컴포넌트에 적용됨)
  - [x] 테마 전환 애니메이션 (rotate, scale 트랜지션)
  - [x] 네비게이션 링크 hover 효과
  - [x] 버튼 hover/active 상태 트랜지션
- [x] 접근성 개선 (ARIA 라벨, 키보드 내비게이션)
  - [x] ThemeToggle에 aria-label 추가
  - [x] MobileMenu에 aria-label 추가
  - [x] 스크린 리더용 sr-only 클래스 활용
  - [x] 키보드 내비게이션 지원 (Button 컴포넌트 기본 지원)

### 문서화

- [x] `docs/PRD.md` PRD 문서
- [x] `docs/mermaid.md` User Flow 다이어그램
- [x] `supabase/STORAGE_SETUP_GUIDE.md` Storage 설정 가이드
- [ ] `docs/API.md` API 문서
- [ ] `docs/DEPLOYMENT.md` 배포 가이드
- [ ] `README.md` 프로젝트 README

### 모니터링 및 분석

- [ ] 에러 트래킹 (Sentry)
- [ ] 분석 도구 (Google Analytics or Vercel Analytics)
- [ ] 로깅 시스템

### 보안

- [ ] 환경변수 보안 점검
- [ ] API 키 노출 확인
- [ ] CORS 설정
- [ ] Rate Limiting (n8n 웹훅)
- [ ] 파일 업로드 검증 강화

---

## 완료 체크리스트

### Phase 1 완료 기준

- [x] 데이터베이스 마이그레이션 성공
- [x] Storage 버킷 생성 완료
- [x] 기본 라우팅 작동

### Phase 2 완료 기준

- [x] 이미지 업로드 가능
- [x] 상품 정보 저장 가능
- [x] n8n 웹훅 트리거 성공

### Phase 3 완료 기준

- [x] 실시간 진행 상태 표시
- [x] 8단계 모두 UI 업데이트
- [x] 에러 처리 작동

### Phase 4 완료 기준

- [x] 영상 목록 조회 가능
- [x] 영상 재생 가능
- [x] 다운로드 가능

### Phase 5 완료 기준

- [ ] Instagram 업로드 성공
- [ ] Facebook 업로드 성공
- [ ] YouTube 업로드 성공

### Phase 6 완료 기준

- [ ] n8n 워크플로우 모든 단계 DB 업데이트
- [ ] 에러 시 자동으로 DB 업데이트

### Phase 7 완료 기준

- [ ] 모든 테스트 통과
- [ ] 프로덕션 배포 성공
- [ ] 실제 사용자 테스트 완료

---

## 📊 프로젝트 현황

**총 예상 개발 기간: 6-7주**

**현재 진행 상황:**

- ✅ Phase 1 (기본 인프라): 100% 완료
- ✅ Phase 2 (업로드 기능): 100% 완료
- ✅ Phase 3 (진행 상태 표시): 100% 완료
- ✅ Phase 4 (영상 관리): 100% 완료
- ✅ UI/UX 개선: 100% 완료 (다크모드, 반응형, 스켈레톤, 접근성)
- ⏳ Phase 5 (SNS 공유): 준비 완료 (Instagram OAuth만 구현됨)
- ⏳ Phase 6 (n8n 워크플로우): 대기 중 (n8n 워크플로우 준비 필요)
- ⏳ Phase 7 (테스트 & 배포): 대기 중

**기술 스택 구현 상태:**

- ✅ Next.js 15 + React 19 + App Router
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS v4 + shadcn/ui
- ✅ Context API (ThemeProvider, SyncUserProvider)
- ✅ Server Actions 패턴 적용
- ✅ Supabase (PostgreSQL + Storage + Realtime)
- ✅ Clerk 인증 통합
- ✅ Turbopack 빌드
- ⏳ n8n 워크플로우 통합 (준비 완료, 테스트 대기)
- ⏳ Google Vertex AI (n8n 워크플로우 내)

_최종 수정일: 2025-11-06_
