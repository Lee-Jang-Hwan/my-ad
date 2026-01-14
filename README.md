# [삽가능 스튜디오] 광고 영상 및 이미지 제작 서비스

<div align="center">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.JS_15-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
    <img src="https://img.shields.io/badge/-Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwind" />
    <img src="https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logoColor=white&logo=clerk" alt="clerk" />
    <img src="https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase" />
  </div>

  <!-- 대표 이미지 추가 위치 -->
  <!-- ![Frame 1](./public/images/hero-banner.png) -->

  <h3 align="center">삽가능 스튜디오</h3>

  <p align="center">
    <strong>상품명</strong>과 <strong>상품사진</strong>만 있다면 쉽게 <strong>삽가능!</strong>
  </p>

  <p align="center">
    AI 기반 광고 영상 및 이미지 자동 생성 플랫폼
  </p>

  <p align="center">
    https://www.sappstudio.kr/
  </p>
</div>

---

## 🛠️ 페이지 별 주요 기능

### 💙 홈

- 히어로 섹션 (서비스 소개 및 CTA 버튼)
- 서비스 이용 방법 안내 (How It Works)
- 샘플 영상 갤러리 (인기순 Top 10)
- 샘플 이미지 갤러리 (최신순)
- 프로모션 팝업

<!-- ![홈 화면](./docs/screenshots/home.png) -->

### 💙 비디오 생성

- 상품 이미지 드래그 앤 드롭 업로드
- 상품명 입력
- AI가 6개의 광고 문구 자동 생성
- 원하는 광고 문구 선택
- n8n 워크플로우를 통한 영상 자동 생성
- 실시간 생성 진행률 표시 (Supabase Realtime)

<!-- ![비디오 생성](./docs/screenshots/video-generation.png) -->

### 💙 이미지 생성

- 상품 이미지 업로드
- AI 광고 문구 생성 및 선택
- 광고 이미지 자동 생성
- 비디오 대비 빠른 생성 속도 (20 크레딧)

<!-- ![이미지 생성](./docs/screenshots/image-generation.png) -->

### 💙 스토리보드

- AI가 자동으로 씬 구조 생성
- 씬별 상세 설정:
  - 씬 설명 및 대사/나레이션
  - 카메라 각도 (9종) 및 움직임 (10종)
  - 전환 효과 (8종) 및 전환 시간
  - BGM 및 효과음 선택
  - 자막 스타일 (위치, 폰트, 색상)
  - 참조 이미지 업로드
- 씬별 이미지 생성 → 클립 생성 → 최종 병합
- 실시간 생성 진행 상황 표시

<!-- ![스토리보드](./docs/screenshots/storyboard.png) -->

### 💙 대시보드

- 내가 생성한 영상/이미지 목록
- 필터링 (전체, 완료, 진행 중, 실패)
- 정렬 (최신순, 오래된 순)
- 페이지네이션
- 영상/이미지 공개/비공개 설정
- 다운로드 및 삭제

<!-- ![대시보드](./docs/screenshots/dashboard.png) -->

### 💙 결제 (크레딧 충전)

- 3가지 크레딧 패키지 제공
  - 싱글 (100 크레딧): ₩17,900
  - 비즈니스 5 (500 크레딧): ₩75,500
  - 비즈니스 10 (1,000 크레딧): ₩153,000
- 토스페이먼츠 연동 (신용카드, 계좌이체 등)
- 결제 성공/실패 콜백 처리
- 크레딧 잔액 실시간 표시

<!-- ![결제](./docs/screenshots/pricing.png) -->

### 💙 관리자 대시보드

- 전체 사용자 목록 및 크레딧 관리
- 크레딧 지급/차감 기능
- 결제 내역 조회
- 사용량 분석 (영상, 이미지, 스토리보드)
- 생성 로그 확인 및 에러 추적

<!-- ![관리자](./docs/screenshots/admin.png) -->

### 💙 마이페이지

- Clerk를 통한 프로필 관리
- 크레딧 잔액 확인
- 크레딧 거래 내역
- 회원 탈퇴 (모든 데이터 삭제)

<!-- ![마이페이지](./docs/screenshots/mypage.png) -->

---

## 🌐 서비스 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js 15)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   홈     │  │  영상    │  │  이미지  │  │   스토리보드     │ │
│  │  페이지  │  │  생성    │  │  생성    │  │      편집       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel (Edge Network)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Server (App Router)                  │   │
│  │  ┌────────────────┐  ┌────────────────┐                  │   │
│  │  │ Server Actions │  │  API Routes    │                  │   │
│  │  │   (56개)       │  │  (sync-user,   │                  │   │
│  │  │                │  │   instagram)   │                  │   │
│  │  └────────────────┘  └────────────────┘                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│    Clerk     │    │    Supabase      │    │     n8n      │
│  (인증/JWT)  │    │  ┌────────────┐  │    │  (워크플로우) │
│              │    │  │ PostgreSQL │  │    │              │
│  - 회원가입  │    │  │ (27 tables)│  │    │  - 영상 생성 │
│  - 로그인    │◄──►│  └────────────┘  │◄──►│  - 이미지    │
│  - OAuth     │    │  ┌────────────┐  │    │  - 병합      │
│              │    │  │  Storage   │  │    │              │
└──────────────┘    │  │  (uploads) │  │    └──────────────┘
                    │  └────────────┘  │
                    │  ┌────────────┐  │
                    │  │  Realtime  │  │
                    │  │  (진행률)  │  │
                    │  └────────────┘  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Toss Payments  │
                    │   (KRW 결제)     │
                    └──────────────────┘
```

<!-- ![Architecture](./docs/architecture.png) -->

---

## 🔧 기술적 의사결정

| **공통 기술** | |
| --- | --- |
| Next.js 15 (App Router) | React 19의 Server Components와 Server Actions를 활용하여 성능 최적화. API Routes 대신 Server Actions 우선 사용으로 코드 간결화 및 타입 안전성 확보. Turbopack을 통한 빠른 개발 환경 제공. |
| Supabase Realtime | 영상/이미지 생성 진행률을 실시간으로 표시하기 위해 선택. WebSocket 기반으로 폴링 대비 서버 부하 감소. 연결 실패 시 15초 폴링 폴백 구현. |
| Clerk + Supabase 통합 | 2025년 네이티브 통합 방식 사용. JWT 템플릿 없이 Clerk JWT를 Supabase에서 직접 검증. RLS 정책에서 `auth.jwt()->>'sub'`로 사용자 확인. |
| **프론트엔드** | |
| React 19 | 최신 React 기능 활용 (use hook, Server Components). Concurrent Features로 더 나은 UX 제공. |
| Tailwind CSS v4 | 설정 파일 없이 `globals.css`에서 직접 설정. CSS 변수 기반 다크/라이트 모드 지원. |
| shadcn/ui | Radix UI 기반의 접근성 높은 컴포넌트. 프로젝트에 직접 복사되어 커스터마이징 용이. |
| react-hook-form + Zod | 폼 상태 관리와 런타임 타입 검증을 결합. 타입스크립트와의 완벽한 통합으로 개발 생산성 향상. |
| lucide-react | 일관된 아이콘 디자인. 트리 쉐이킹 지원으로 번들 크기 최적화. |
| framer-motion | 부드러운 애니메이션 효과로 UX 향상. 생성 진행률 표시 등에 활용. |
| **백엔드** | |
| Supabase PostgreSQL | 관계형 데이터베이스로 복잡한 쿼리 지원. Row Level Security로 데이터 보안 강화. 27개 마이그레이션으로 스키마 버전 관리. |
| Supabase Storage | 사용자 업로드 이미지 저장. RLS 정책으로 사용자별 폴더 격리. CDN을 통한 빠른 이미지 제공. |
| n8n Workflow | 영상/이미지 생성 파이프라인 자동화. 외부 AI 서비스 연동. 웹훅을 통한 비동기 처리. |
| Toss Payments | 한국 결제 환경에 최적화. 다양한 결제 수단 지원 (카드, 계좌이체, 가상계좌). SDK로 간편한 연동. |
| Vercel | Next.js 최적화 호스팅. Edge Network로 글로벌 성능. 자동 배포 및 프리뷰 환경. |

---

## 💣 트러블슈팅

### FE (프론트엔드)

#### Supabase Realtime 연결 끊김

❗ **문제상황**

- 영상 생성 중 Realtime 연결이 간헐적으로 끊어져 진행률 업데이트가 멈추는 현상 발생
- 특히 JWT 토큰 만료 시점에서 재연결 실패

❗ **이전 코드의 문제점**

- 단순히 Supabase Realtime 채널을 구독하고 상태 변경만 감지
- 토큰 만료나 네트워크 불안정에 대한 처리 없음

✅ **문제 해결**

- `useRealtimeVideo` 훅에서 다중 복구 전략 구현:
  1. **토큰 자동 갱신**: `getToken({ skipCache: true })`로 항상 새 토큰 사용
  2. **폴링 폴백**: Realtime 실패 시 15초 간격 폴링으로 전환
  3. **지수 백오프 재연결**: 최대 5회까지 재시도, 간격 점진적 증가
  4. **하트비트 체크**: 15초마다 연결 상태 확인
  5. **10분 타임아웃**: 장기간 응답 없을 시 에러 상태로 전환

```typescript
// 이전 코드
const channel = supabase
  .channel('video-updates')
  .on('postgres_changes', { ... }, handleChange)
  .subscribe();

// 수정 코드 (486줄의 완성된 훅)
export function useRealtimeVideo(videoId: string) {
  // 토큰 갱신, 폴링 폴백, 재연결 로직 포함
  // 타임아웃 감지, 하트비트 체크 구현
  // onComplete, onError 콜백 지원
}
```

---

#### 무한 스크롤 상태 관리

❗ **문제상황**

- 대시보드에서 스크롤 시 동일 데이터가 중복 로드되거나 누락되는 현상

❗ **원인 분석**

- 페이지네이션 커서와 로딩 상태 관리가 비동기 특성을 고려하지 않음

✅ **문제 해결**

- `useInfiniteScroll` 커스텀 훅 구현
- `IntersectionObserver`로 스크롤 위치 감지
- 로딩 중 추가 요청 방지를 위한 상태 플래그 사용
- 커서 기반 페이지네이션으로 일관된 데이터 로드

---

#### 이미지 드롭존 미리보기

❗ **문제상황**

- 대용량 이미지 업로드 시 브라우저가 멈추는 현상

✅ **문제 해결**

- 클라이언트에서 이미지 리사이징 후 미리보기 표시
- 실제 업로드는 원본 또는 최적화된 크기로 진행
- `FileReader`와 `canvas`를 활용한 썸네일 생성

---

### BE (백엔드/인프라)

#### Clerk JWT + Supabase RLS 통합

❗ **문제상황**

- Clerk 사용자 ID(`user_xxx`)와 Supabase의 `auth.uid()` 불일치로 RLS 정책 실패

❗ **원인 분석**

- Supabase 기본 RLS는 자체 인증 시스템의 `auth.uid()`를 기대
- Clerk JWT는 `sub` 클레임에 사용자 ID 저장

✅ **문제 해결**

- RLS 정책에서 `auth.jwt()->>'sub'`으로 Clerk user ID 직접 추출
- 데이터베이스 `user_id` 컬럼에 Clerk ID (`clerk_id`) 저장
- 네이티브 통합 방식으로 JWT 템플릿 불필요

```sql
-- RLS 정책 예시
CREATE POLICY "Users can view own videos"
ON ad_videos FOR SELECT
USING (user_id = auth.jwt()->>'sub');
```

---

#### 토큰 만료로 인한 Storage 업로드 실패

❗ **문제상황**

- 장시간 페이지 유지 후 파일 업로드 시 401 Unauthorized 에러

❗ **원인 분석**

- Supabase 클라이언트 생성 시 토큰이 캐시되어 만료된 토큰 사용

✅ **문제 해결**

- `useClerkSupabaseClient` 훅에서 `accessToken` 옵션에 함수 전달
- 매 요청마다 `getToken({ skipCache: true })`로 새 토큰 획득
- Realtime 채널에서도 동일 패턴 적용

```typescript
// clerk-client.ts
const client = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${await getToken({ skipCache: true })}`,
    },
  },
});
```

---

#### n8n 웹훅 타임아웃

❗ **문제상황**

- 복잡한 영상 생성 시 n8n 웹훅 응답 대기 중 타임아웃 발생

✅ **문제 해결**

- 웹훅 호출을 비동기로 변경 (fire-and-forget)
- n8n이 완료 시 별도 콜백으로 상태 업데이트
- 클라이언트는 Realtime으로 상태 변경 감지

---

#### 크레딧 동시성 문제

❗ **문제상황**

- 동시에 여러 생성 요청 시 크레딧이 음수가 되는 경우 발생

✅ **문제 해결**

- 트랜잭션 내에서 크레딧 확인 및 차감
- `FOR UPDATE` 락으로 동시 접근 방지
- 크레딧 부족 시 에러 반환 후 생성 중단

---

#### 스토리보드 씬 순서 동기화

❗ **문제상황**

- 드래그 앤 드롭으로 씬 순서 변경 시 다른 사용자 화면과 불일치

✅ **문제 해결**

- `scene_order` 컬럼으로 순서 관리
- `reorder-scenes` Server Action에서 배치 업데이트
- Realtime으로 다른 탭/기기에 순서 변경 전파

---

## 📊 크레딧 비용 구조

| 기능 | 크레딧 |
| --- | --- |
| 비디오 생성 | 80 |
| 이미지 생성 | 20 |
| 스토리보드 AI 초안 | 10 |
| 씬 이미지 생성 (개당) | 5 |
| 씬 클립 생성 (개당) | 15 |
| 최종 영상 병합 | 20 |

**스토리보드 예시 (5씬 기준)**
= 10 + (5 × 5) + (5 × 15) + 20 = **135 크레딧**

---

## 📁 프로젝트 구조

```
my-ad1106/
├── app/                          # Next.js App Router (36 라우트)
│   ├── (auth)/                   # 인증 관련 페이지
│   │   ├── sign-in/             # 로그인
│   │   └── sign-up/             # 회원가입
│   ├── admin/                    # 관리자 페이지
│   │   ├── analytics/           # 사용량 분석
│   │   ├── logs/                # 생성 로그
│   │   ├── payments/            # 결제 내역
│   │   └── users/               # 사용자 관리
│   ├── api/                      # API Routes
│   │   ├── sync-user/           # Clerk → Supabase 동기화
│   │   └── auth/instagram/      # Instagram OAuth
│   ├── dashboard/                # 대시보드
│   ├── generation/[id]/          # 비디오 생성 진행
│   ├── image/                    # 이미지 허브
│   ├── image-generation/[id]/    # 이미지 생성 진행
│   ├── payment/                  # 결제 결과
│   ├── pricing/                  # 요금제
│   ├── storyboard/               # 스토리보드
│   │   ├── [id]/                # 스토리보드 편집
│   │   └── new/                 # 새 스토리보드
│   ├── video/                    # 비디오 허브
│   └── layout.tsx                # Root Layout
│
├── components/                   # React 컴포넌트 (70+)
│   ├── admin/                    # 관리자 컴포넌트
│   ├── chatbot/                  # AI 챗봇
│   ├── credit/                   # 크레딧 관련
│   ├── dashboard/                # 대시보드 컴포넌트
│   ├── generation/               # 영상 생성 진행률
│   ├── home/                     # 홈페이지 섹션
│   ├── image-generation/         # 이미지 생성 진행률
│   ├── payment/                  # 결제 컴포넌트
│   ├── providers/                # Context Providers
│   ├── storyboard/               # 스토리보드 컴포넌트
│   ├── ui/                       # shadcn/ui (수정 금지)
│   ├── upload/                   # 업로드 폼
│   ├── upload-image/             # 이미지 업로드
│   └── video/                    # 비디오 플레이어
│
├── actions/                      # Server Actions (56개)
│   ├── admin/                    # 관리자 액션
│   ├── credit/                   # 크레딧 관리
│   ├── image/                    # 이미지 액션
│   ├── payment/                  # 결제 액션
│   ├── storyboard/               # 스토리보드 액션
│   └── *.ts                      # 비디오 관련 액션
│
├── hooks/                        # Custom Hooks
│   ├── use-credit-balance.ts     # 크레딧 잔액
│   ├── use-realtime-video.ts     # 실시간 비디오 상태
│   ├── use-realtime-image.ts     # 실시간 이미지 상태
│   ├── use-realtime-storyboard.ts # 실시간 스토리보드
│   └── use-sync-user.ts          # 사용자 동기화
│
├── lib/                          # 유틸리티
│   ├── supabase/                 # Supabase 클라이언트
│   │   ├── clerk-client.ts      # Client Component용
│   │   ├── server.ts            # Server Component용
│   │   └── service-role.ts      # 관리자용
│   ├── constants/                # 상수 (크레딧 비용 등)
│   ├── tosspayments/             # 토스페이먼츠
│   └── utils.ts                  # 공통 유틸
│
├── types/                        # TypeScript 타입
│   ├── database.ts               # DB 테이블 타입
│   ├── generation.ts             # 생성 관련 타입
│   ├── storyboard.ts             # 스토리보드 타입 (524줄)
│   └── *.ts                      # 기타 타입
│
├── supabase/                     # 데이터베이스
│   ├── migrations/               # 27개 마이그레이션
│   └── config.toml               # Supabase 설정
│
├── middleware.ts                 # Clerk 미들웨어
├── CLAUDE.md                     # AI 에이전트 가이드
└── AGENTS.md                     # 프로젝트 규칙
```

---

## 📦 주요 의존성

```json
{
  "next": "15.5.9",
  "react": "19.2.3",
  "@clerk/nextjs": "6.20.0",
  "@supabase/supabase-js": "2.49.8",
  "tailwindcss": "4",
  "react-hook-form": "7.56.4",
  "zod": "3.25.32",
  "lucide-react": "0.511.0",
  "framer-motion": "12.23.25",
  "@tosspayments/tosspayments-sdk": "2.4.1",
  "date-fns": "4.1.0",
  "next-themes": "0.4.6",
  "sonner": "2.0.7"
}
```

---

## 🚀 실행 방법

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (Turbopack)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint
```

---

## 🔐 환경 변수

`.env.example` 참고:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# n8n Webhook
N8N_WEBHOOK_URL=
N8N_WEBHOOK_USER=
N8N_WEBHOOK_PASSWORD=

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=
```

---

## 👨‍👩‍👧‍👦 팀원 소개

<!-- 팀원 정보 추가 위치 -->
| 역할 | 이름 | GitHub |
| --- | --- | --- |
| Full-stack | - | - |

---

## 📄 라이선스

Private - All Rights Reserved
