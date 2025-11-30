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

### 결제 시스템

- **결제 SDK**: @tosspayments/tosspayments-sdk (V2)
- **결제 방식**: 결제위젯 (카드, 간편결제, 계좌이체 등)
- **크레딧**: 영상 생성당 80 크레딧 차감

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

## Phase 8: 결제 시스템 (구현 완료 ✅)

### 데이터베이스 마이그레이션

- [x] `supabase/migrations/20251127000001_add_user_credits_and_role.sql`
  - [x] `users` 테이블에 `credit_balance`, `role` 컬럼 추가
  - [x] 역할 검증 CHECK 제약조건

- [x] `supabase/migrations/20251127000002_create_pricing_tiers.sql`
  - [x] `pricing_tiers` 테이블 생성
  - [x] 3개 기본 요금제 데이터 삽입
    - Single: 100 크레딧, ₩17,900
    - Business 5: 500 크레딧, ₩75,500 (HOT 배지)
    - Business 10: 1000 크레딧, ₩153,000

- [x] `supabase/migrations/20251127000003_create_payments.sql`
  - [x] `payments` 테이블 생성
  - [x] TossPayments 연동 필드 (order_id, payment_key)
  - [x] RLS 정책 설정

- [x] `supabase/migrations/20251127000004_create_credit_transactions.sql`
  - [x] `credit_transactions` 테이블 생성
  - [x] 거래 유형별 관리 (purchase, usage, refund, admin_grant)
  - [x] RLS 정책 설정

### 타입 정의

- [x] `types/payment.ts` 결제 관련 타입
  - [x] PricingTier 타입
  - [x] Payment 타입
  - [x] CreditTransaction 타입
  - [x] PaymentStatus 타입
  - [x] TossPaymentConfirmRequest/Response 타입

### 상수 정의

- [x] `lib/constants/credits.ts` 크레딧 상수
  - [x] VIDEO_GENERATION_COST = 80
  - [x] USER_ROLES 상수
  - [x] formatCredits 헬퍼 함수

### TossPayments 연동

- [x] `lib/tosspayments/client.ts` 클라이언트 유틸리티
  - [x] loadTossPayments 함수
  - [x] generateOrderId 함수

- [x] `lib/tosspayments/server.ts` 서버 유틸리티
  - [x] confirmPayment 함수 (결제 승인)
  - [x] cancelPayment 함수 (결제 취소)
  - [x] Basic Auth 인증 처리

### Server Actions - 결제

- [x] `actions/payment/create-order.ts` 주문 생성
  - [x] 요금제 조회
  - [x] payments 레코드 생성 (pending)
  - [x] orderId 반환

- [x] `actions/payment/confirm-payment.ts` 결제 승인
  - [x] TossPayments API 호출
  - [x] payments 상태 업데이트 (completed)
  - [x] 크레딧 부여
  - [x] credit_transactions 기록

- [x] `actions/payment/cancel-payment.ts` 결제 취소
  - [x] TossPayments API 호출
  - [x] payments 상태 업데이트 (cancelled)
  - [x] 크레딧 회수

### Server Actions - 크레딧

- [x] `actions/credit/check-balance.ts` 잔액 조회
  - [x] 사용자 크레딧 잔액 반환
  - [x] 관리자 여부 확인

- [x] `actions/credit/deduct-credit.ts` 크레딧 차감
  - [x] 잔액 검증
  - [x] 크레딧 차감
  - [x] credit_transactions 기록

- [x] `actions/credit/grant-credit.ts` 크레딧 부여 (관리자)
  - [x] 관리자 권한 검증
  - [x] 크레딧 부여
  - [x] credit_transactions 기록

### Server Actions - 관리자

- [x] `actions/admin/check-admin.ts` 관리자 권한 확인
- [x] `actions/admin/get-payments.ts` 결제 내역 조회
- [x] `actions/admin/get-users.ts` 사용자 목록 조회

### 결제 컴포넌트

- [x] `components/payment/pricing-card.tsx` 요금제 카드
  - [x] 요금제 정보 표시
  - [x] 할인가/정가 표시
  - [x] HOT/BEST 배지
  - [x] 구매 버튼

- [x] `components/payment/pricing-grid.tsx` 요금제 그리드
  - [x] 요금제 목록 렌더링
  - [x] 반응형 레이아웃

- [x] `components/payment/payment-widget.tsx` 결제위젯
  - [x] TossPayments 결제위젯 통합
  - [x] 결제 요청/승인 처리

- [x] `components/payment/payment-result.tsx` 결제 결과
  - [x] 성공/실패 메시지 표시
  - [x] 다음 단계 안내

### 크레딧 컴포넌트

- [x] `components/credit/credit-display.tsx` 크레딧 표시
  - [x] 현재 잔액 표시
  - [x] 충전 버튼

- [x] `components/credit/insufficient-credit-modal.tsx` 크레딧 부족 모달
  - [x] 부족 메시지
  - [x] 요금제 페이지 이동 버튼

- [x] `components/credit/credit-history.tsx` 크레딧 내역
  - [x] 거래 내역 목록
  - [x] 거래 유형별 아이콘

### 크레딧 Hook

- [x] `hooks/use-credit-balance.ts` 크레딧 잔액 훅
  - [x] 잔액 조회
  - [x] 관리자 여부 확인
  - [x] 새로고침 기능

### 결제 페이지

- [x] `app/pricing/page.tsx` 요금제 페이지
  - [x] PricingGrid 컴포넌트 사용
  - [x] 요금제 선택 후 결제 진행

- [x] `app/payment/success/page.tsx` 결제 성공 페이지
  - [x] paymentKey, orderId, amount 파라미터 처리
  - [x] 결제 승인 API 호출
  - [x] 성공 메시지 및 크레딧 표시

- [x] `app/payment/fail/page.tsx` 결제 실패 페이지
  - [x] 에러 코드/메시지 표시
  - [x] 재시도 버튼

### 관리자 컴포넌트

- [x] `components/admin/grant-credit-dialog.tsx` 크레딧 부여 다이얼로그
  - [x] 부여할 크레딧 입력
  - [x] 사유 입력
  - [x] 부여 확인

### 관리자 페이지

- [x] `app/admin/layout.tsx` 관리자 레이아웃
  - [x] 관리자 권한 확인
  - [x] 사이드 네비게이션

- [x] `app/admin/page.tsx` 관리자 대시보드
  - [x] 총 사용자 수
  - [x] 총 결제 금액
  - [x] 총 크레딧 사용량

- [x] `app/admin/payments/page.tsx` 결제 내역 관리
  - [x] 결제 목록 테이블
  - [x] 상태별 필터링
  - [x] 결제 취소 기능

- [x] `app/admin/users/page.tsx` 사용자 관리
  - [x] 사용자 목록 테이블
  - [x] 크레딧 잔액 표시
  - [x] 크레딧 부여 버튼

### 기존 코드 수정

- [x] `actions/trigger-n8n.ts` 크레딧 검증 추가
  - [x] 영상 생성 전 크레딧 잔액 확인
  - [x] 관리자는 크레딧 검증 우회
  - [x] 생성 성공 시 크레딧 차감
  - [x] insufficientCredits 응답 필드 추가

- [x] `types/upload.ts` 타입 수정
  - [x] TriggerN8nResult에 insufficientCredits 필드 추가

- [x] `lib/supabase/service-role.ts` alias 추가
  - [x] createServiceRoleClient alias export

---

## Phase 9: 광고문구 선택 기능 (진행 중) 🚧

> **개요:** 영상 생성 전 사용자가 AI 생성 광고문구 5개 중 1개를 선택하는 기능 추가

### n8n 워크플로우

- **sapp-studio-adcopy**: `https://n8n.sappstudio.kr/webhook/84e18e95-00b9-4963-9a6f-c14225a84d15`
  - 광고문구 5개 생성 (Gemini 2.5 Pro, B급 키치 마케팅 스타일)
- **sapp-studio-advideo**: `https://n8n.sappstudio.kr/webhook/70980457-f61e-42f1-84c3-5245f1438435`
  - selected_ad_copy 파라미터로 선택된 광고문구 전달

### 데이터베이스 마이그레이션

- [ ] `supabase/migrations/20251129000001_create_ad_copies.sql`
  - [ ] ad_copies 테이블 생성 (광고문구 5개 저장)
  - [ ] 인덱스 및 RLS 정책

- [ ] `supabase/migrations/20251129000002_update_ad_videos_for_ad_copy.sql`
  - [ ] ad_videos.progress_stage에 'ad_copy_selection' 추가
  - [ ] ad_videos.selected_ad_copy 칼럼 추가

### 타입 정의

- [ ] `types/ad-copy.ts` 광고문구 관련 타입
  - [ ] AdCopy 타입
  - [ ] AdCopyResponse 타입 (webhook 응답)
  - [ ] GenerateAdCopiesResult 타입
  - [ ] SelectAdCopyResult 타입

### 상수 수정

- [ ] `constants/generation.ts` 진행 단계 업데이트
  - [ ] STAGE_ORDER에 'ad_copy_selection' 추가
  - [ ] STAGE_LABELS, STAGE_DESCRIPTIONS 업데이트
  - [ ] 6단계 진행 표시기로 변경

- [ ] `types/generation.ts` GenerationStage 업데이트

### Server Actions

- [ ] `actions/generate-ad-copies.ts` 광고문구 생성
  - [ ] adcopy webhook 호출
  - [ ] ad_copies 테이블에 5개 저장
  - [ ] ad_videos.progress_stage → 'ad_copy_selection'

- [ ] `actions/select-ad-copy.ts` 광고문구 선택 & 영상생성 진행
  - [ ] 선택된 광고문구 저장
  - [ ] 크레딧 차감 (이 시점에 차감)
  - [ ] advideo webhook 호출 (selected_ad_copy 포함)

- [ ] `actions/fetch-ad-copies.ts` 광고문구 조회
  - [ ] ad_video_id로 5개 광고문구 조회

- [ ] `actions/trigger-n8n.ts` 수정
  - [ ] selected_ad_copy 파라미터 추가

### UI 컴포넌트

- [ ] `components/upload/ad-copy-card.tsx` 광고문구 카드
  - [ ] 카드 번호 (1~5)
  - [ ] 광고문구 텍스트
  - [ ] 선택 버튼 및 하이라이트

- [ ] `components/upload/ad-copy-selection.tsx` 광고문구 선택 메인
  - [ ] 5개 카드 그리드
  - [ ] "다시 생성" 버튼
  - [ ] "선택 완료 & 진행" 버튼
  - [ ] 상품 정보 요약 표시

- [ ] `components/upload/ad-copy-skeleton.tsx` 로딩 스켈레톤

- [ ] `components/upload/upload-form.tsx` 수정
  - [ ] 4단계 워크플로우로 변경
  - [ ] Step 3: 광고문구 생성 & 선택

### 진행 상태 UI 수정

- [ ] `components/generation/step-indicator.tsx` 6단계로 수정
- [ ] `lib/generation-utils.ts` 진행률 계산 로직 수정

### 환경변수

```bash
N8N_ADCOPY_WEBHOOK_URL=https://n8n.sappstudio.kr/webhook/84e18e95-00b9-4963-9a6f-c14225a84d15
N8N_ADVIDEO_WEBHOOK_URL=https://n8n.sappstudio.kr/webhook/70980457-f61e-42f1-84c3-5245f1438435
```

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

### Phase 8 완료 기준 ✅

- [x] TossPayments 결제위젯 연동 완료
- [x] 크레딧 시스템 구현 완료
- [x] 관리자 페이지 구현 완료
- [x] 영상 생성 시 크레딧 차감 연동 완료
- [x] 빌드 성공

### Phase 9 완료 기준 (광고문구 선택 기능)

- [ ] ad_copies 테이블 생성 마이그레이션
- [ ] ad_videos 테이블 수정 마이그레이션 (ad_copy_selection 단계, selected_ad_copy 칼럼)
- [ ] 광고문구 생성/선택/조회 Server Actions
- [ ] 광고문구 선택 UI 컴포넌트
- [ ] 업로드 폼 4단계 워크플로우
- [ ] 진행 표시기 6단계로 업데이트
- [ ] 전체 플로우 테스트

---

## 📊 프로젝트 현황

**총 예상 개발 기간: 6-7주**

**현재 진행 상황:**

- ✅ Phase 1 (기본 인프라): 100% 완료
- ✅ Phase 2 (업로드 기능): 100% 완료
- ✅ Phase 3 (진행 상태 표시): 100% 완료
- ✅ Phase 4 (영상 관리): 100% 완료
- ✅ UI/UX 개선: 100% 완료 (다크모드, 반응형, 스켈레톤, 접근성)
- ✅ **Phase 8 (결제 시스템): 100% 완료** 🎉
  - TossPayments V2 결제위젯 연동
  - 크레딧 시스템 (80 크레딧/영상)
  - 3가지 요금제 (Single, Business 5, Business 10)
  - 관리자 대시보드 및 사용자/결제 관리
  - 관리자 크레딧 면제 기능
- ⏳ Phase 5 (SNS 공유): 준비 완료 (Instagram OAuth만 구현됨)
- ⏳ Phase 6 (n8n 워크플로우): 대기 중 (n8n 워크플로우 준비 필요)
- ⏳ Phase 7 (테스트 & 배포): 대기 중
- 🚧 **Phase 9 (광고문구 선택 기능): 진행 중**
  - sapp-studio-adcopy webhook 연동 (광고문구 5개 생성)
  - 광고문구 선택 UI (카드 형태, 다시 생성)
  - sapp-studio-advideo webhook에 selected_ad_copy 전달
  - 4단계 업로드 워크플로우

**기술 스택 구현 상태:**

- ✅ Next.js 15 + React 19 + App Router
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS v4 + shadcn/ui
- ✅ Context API (ThemeProvider, SyncUserProvider)
- ✅ Server Actions 패턴 적용
- ✅ Supabase (PostgreSQL + Storage + Realtime)
- ✅ Clerk 인증 통합
- ✅ Turbopack 빌드
- ✅ **TossPayments V2 결제 시스템**
- ⏳ n8n 워크플로우 통합 (준비 완료, 테스트 대기)
- ⏳ Google Vertex AI (n8n 워크플로우 내)

**구현된 주요 파일:**

```
# 결제 시스템
├── types/payment.ts                          # 결제 타입 정의
├── lib/constants/credits.ts                  # 크레딧 상수
├── lib/tosspayments/
│   ├── client.ts                             # 클라이언트 유틸리티
│   └── server.ts                             # 서버 유틸리티
├── actions/
│   ├── payment/
│   │   ├── create-order.ts                   # 주문 생성
│   │   ├── confirm-payment.ts                # 결제 승인
│   │   └── cancel-payment.ts                 # 결제 취소
│   ├── credit/
│   │   ├── check-balance.ts                  # 잔액 조회
│   │   ├── deduct-credit.ts                  # 크레딧 차감
│   │   └── grant-credit.ts                   # 크레딧 부여 (관리자)
│   └── admin/
│       ├── check-admin.ts                    # 관리자 확인
│       ├── get-payments.ts                   # 결제 내역
│       └── get-users.ts                      # 사용자 목록
├── components/
│   ├── payment/
│   │   ├── pricing-card.tsx                  # 요금제 카드
│   │   ├── pricing-grid.tsx                  # 요금제 그리드
│   │   ├── payment-widget.tsx                # 결제위젯
│   │   └── payment-result.tsx                # 결제 결과
│   ├── credit/
│   │   ├── credit-display.tsx                # 크레딧 표시
│   │   ├── insufficient-credit-modal.tsx     # 크레딧 부족 모달
│   │   └── credit-history.tsx                # 크레딧 내역
│   └── admin/
│       └── grant-credit-dialog.tsx           # 크레딧 부여 다이얼로그
├── hooks/
│   └── use-credit-balance.ts                 # 크레딧 잔액 훅
├── app/
│   ├── pricing/page.tsx                      # 요금제 페이지
│   ├── payment/
│   │   ├── success/page.tsx                  # 결제 성공
│   │   └── fail/page.tsx                     # 결제 실패
│   └── admin/
│       ├── layout.tsx                        # 관리자 레이아웃
│       ├── page.tsx                          # 관리자 대시보드
│       ├── payments/page.tsx                 # 결제 관리
│       └── users/page.tsx                    # 사용자 관리
└── supabase/migrations/
    ├── 20251127000001_add_user_credits_and_role.sql
    ├── 20251127000002_create_pricing_tiers.sql
    ├── 20251127000003_create_payments.sql
    └── 20251127000004_create_credit_transactions.sql
```

_최종 수정일: 2025-11-27_
