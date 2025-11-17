# AI 홍보영상 자동 생성 서비스 - PRD (Product Requirements Document)

## 📋 프로젝트 개요

### 목적

- **핵심 목표**: 소상공인을 위한 AI 기반 홍보영상 자동 생성 플랫폼
- **검증 가설**: 이미지와 상품명만으로 전문적인 홍보영상을 자동 생성하여 마케팅 비용 절감
- **출시 형태**: n8n 워크플로우와 연동된 웹 서비스 (MVP)

### 핵심 가치

- **간편함**: 이미지 + 상품명만 업로드하면 자동으로 홍보영상 생성
- **전문성**: AI가 광고 문구, 이미지 정제, 영상 편집, TTS, 자막을 자동 생성
- **효율성**: 수동 작업 시간을 1/10로 단축
- **확장성**: 다양한 AI 워크플로우를 선택하여 사용 가능한 구조

---

## 🎯 타겟 사용자

### Primary User

- **연령대**: 30-50대 소상공인
- **특징**:
  - 마케팅 전문 지식 없음
  - 제한된 예산과 시간
  - SNS 마케팅 필요성은 느끼지만 방법을 모름
  - 스마트폰 또는 PC로 간단한 작업 가능

---

## 🏗️ 기술 스택

### Package Manager

- pnpm

### Frontend

- Next.js 15.5.6 (React 19, App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Radix UI 기반)
- lucide-react (아이콘)

### State Management

- Context API (기본 테마, 사용자 동기화 등)
- Zustand (추후 복잡한 전역 상태 필요 시)
- 원칙: 전역 상태 최소화, Server State는 캐싱 패턴 사용

### API Communication

- **Server Actions** (데이터 조작 우선)
- RESTful API Routes (웹훅, 외부 API 호출 시)
- Supabase Client (DB 쿼리 및 Realtime 구독)

### Backend & Database

- Supabase (PostgreSQL + Storage)
- **RLS 미사용** (서버 사이드 권한 체크)

### 인증

- Clerk (로그인/회원가입, 한국어 지원)
- Supabase에는 사용자 추가 정보만 저장

### AI 워크플로우

- n8n (워크플로우 엔진)
- Google Vertex AI (Gemini, Veo)
- 웹훅 URL: `http://localhost:5678/webhook/6632eae6-fcdf-4f22-9f71-298989a39734`

### Build Tool

- Next.js built-in (Turbopack)

### 외부 API (Phase 5)

- Instagram Graph API
- Facebook Graph API
- YouTube Data API v3

---

## 🏛️ 시스템 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────────────────────┐
│          Frontend (Next.js 15 + React 19)           │
│  - Pages (App Router)                               │
│  - Components (shadcn/ui)                           │
│  - Client State (Context API, Zustand)              │
│  - Realtime Updates (Supabase Realtime)             │
├─────────────────────────────────────────────────────┤
│      API Layer (Server Actions + API Routes)        │
│  - Server Actions (데이터 조작 우선)                 │
│  - API Routes (웹훅, 외부 API 호출)                  │
│  - Authentication Check (Clerk)                     │
│  - Database Access (Supabase Client)                │
├─────────────────────────────────────────────────────┤
│          n8n Webhook Integration Layer              │
│  - Webhook Trigger (POST /webhook/...)              │
│  - Request Validation                               │
│  - Workflow Execution                               │
├─────────────────────────────────────────────────────┤
│         n8n AI Workflows (Google Vertex AI)         │
│  - 광고문구 생성 (Gemini)                            │
│  - 이미지 정제 (Gemini Vision)                       │
│  - 영상 생성 (Veo 3.1)                              │
│  - TTS 생성 (Google TTS)                            │
│  - 자막 생성 (SRT Generator)                        │
│  - 최종 합성 (FFmpeg)                               │
├─────────────────────────────────────────────────────┤
│              Data & Storage Layer                   │
│  - Supabase PostgreSQL (메타데이터)                 │
│  - Supabase Storage (이미지, 영상)                  │
│  - Clerk (사용자 인증 정보)                          │
└─────────────────────────────────────────────────────┘
```

### 아키텍처 원칙

1. **Server-First Architecture**
   - Server Actions 우선 사용 (데이터 조작)
   - API Routes는 웹훅, 외부 API 호출 시만 사용
   - 서버 사이드에서 권한 체크

2. **Separation of Concerns**
   - Frontend: UI 렌더링 및 사용자 인터랙션
   - API Layer: 비즈니스 로직 및 권한 체크
   - n8n: AI 워크플로우 실행
   - Database: 데이터 저장 및 조회

3. **Real-time Updates**
   - Supabase Realtime으로 진행 상태 실시간 업데이트
   - 폴링 대신 이벤트 기반 아키텍처

4. **Stateless API**
   - 각 요청은 독립적
   - 세션 상태는 Clerk가 관리

---

## 🗄️ 데이터베이스 스키마

### users 테이블 (기존)

```sql
id UUID PRIMARY KEY
clerk_id TEXT UNIQUE NOT NULL
name TEXT
created_at TIMESTAMP DEFAULT NOW()
```

### product_images 테이블

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id TEXT NOT NULL REFERENCES users(clerk_id)
image_url TEXT NOT NULL -- Supabase Storage 경로
original_filename TEXT NOT NULL
file_size INTEGER
mime_type TEXT
status TEXT DEFAULT 'uploaded' -- uploaded, processing, completed, failed
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### product_info 테이블

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id TEXT NOT NULL REFERENCES users(clerk_id)
product_name TEXT NOT NULL
description TEXT -- 추후 확장용
category TEXT -- 추후 확장용
created_at TIMESTAMP DEFAULT NOW()
```

### ad_videos 테이블

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id TEXT NOT NULL REFERENCES users(clerk_id)
product_image_id UUID REFERENCES product_images(id)
product_info_id UUID REFERENCES product_info(id)
video_url TEXT -- Supabase Storage 경로 (최종 영상)
thumbnail_url TEXT -- 썸네일 이미지
duration INTEGER -- 영상 길이 (초)
file_size INTEGER
status TEXT DEFAULT 'pending' -- pending, processing, completed, failed
progress_stage TEXT DEFAULT 'init' -- init, 광고문구생성, 이미지정제, 영상생성, TTS생성, 자막생성, 합성중, 완료
error_message TEXT
created_at TIMESTAMP DEFAULT NOW()
completed_at TIMESTAMP
```

### n8n_workflows 테이블 (추후 확장용)

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL -- 워크플로우 이름
description TEXT
webhook_url TEXT NOT NULL
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT NOW()
```

### Supabase Storage 버킷

- `uploads`: 사용자가 업로드한 원본 이미지
  - 경로 구조: `{clerk_user_id}/images/{filename}`
- `videos`: n8n이 생성한 최종 영상
  - 경로 구조: `{clerk_user_id}/videos/{video_id}.mp4`

---

## 🔄 시스템 플로우

### 1. 사용자 입력 (프론트엔드)

```
사용자 → 이미지 업로드 + 상품명 입력
  ↓
Supabase Storage (이미지 저장)
  ↓
Supabase DB (product_images, product_info 저장)
  ↓
ad_videos 레코드 생성 (status: pending)
```

### 2. n8n 워크플로우 트리거 (프론트엔드 → n8n)

```
POST http://localhost:5678/webhook/6632eae6-fcdf-4f22-9f71-298989a39734
Body: {
  "product_image_id": "uuid",
  "product_info_id": "uuid",
  "ad_video_id": "uuid"
}
```

### 3. n8n 워크플로우 실행 (n8n → Supabase)

n8n이 각 단계마다 Supabase `ad_videos` 테이블 업데이트:

```
1. 광고문구 생성 (progress_stage: '광고문구생성')
   → 광고문구 생성기 AI Agent

2. 이미지 정제 (progress_stage: '이미지정제')
   → Gemini 2.5 Flash Image API

3. 영상 생성 (progress_stage: '영상생성')
   → Veo 3.1 Video Generation

4. TTS 생성 (progress_stage: 'TTS생성')
   → Google TTS API

5. 자막 생성 (progress_stage: '자막생성')
   → SRT 파일 생성

6. 최종 합성 (progress_stage: '합성중')
   → FFmpeg (영상 + TTS + 자막)

7. 완료 (progress_stage: '완료', status: 'completed')
   → video_url 업데이트
```

### 4. 프론트엔드 실시간 업데이트

```
Supabase Realtime 구독
  ↓
ad_videos 테이블 변경 감지
  ↓
progress_stage 변경 → UI 업데이트 (진행 바, 로딩 애니메이션)
  ↓
status: 'completed' → 영상 재생 화면 표시
```

### 5. 영상 다운로드 및 공유

```
영상 재생 → 다운로드 버튼 클릭
  ↓
Supabase Storage에서 영상 다운로드

또는

SNS 공유 버튼 클릭 (Phase 4)
  ↓
Instagram/Facebook/YouTube API 호출
  ↓
직접 업로드
```

---

## 🚀 개발 우선순위

### Phase 1: 기본 인프라 (1주)

- [x] Next.js 프로젝트 셋업 (완료됨)
- [x] Supabase 프로젝트 생성 (완료됨)
- [x] Clerk 연동 (완료됨)
- [ ] 데이터베이스 테이블 마이그레이션 생성
  - [ ] `product_images` 테이블
  - [ ] `product_info` 테이블
  - [ ] `ad_videos` 테이블
- [ ] Supabase Storage 버킷 생성
  - [ ] `uploads` 버킷
  - [ ] `videos` 버킷
- [ ] 기본 레이아웃 및 라우팅

### Phase 2: 업로드 기능 (1주)

- [ ] 홈페이지 UI
  - [ ] 히어로 섹션
  - [ ] 사용 방법 안내
- [ ] 업로드 페이지
  - [ ] 이미지 드래그 앤 드롭
  - [ ] 이미지 프리뷰
  - [ ] 상품명 입력 폼
  - [ ] 업로드 버튼
- [ ] 서버 액션: 이미지 업로드
  - [ ] Supabase Storage에 저장
  - [ ] `product_images` 테이블에 메타데이터 저장
- [ ] 서버 액션: 상품 정보 저장
  - [ ] `product_info` 테이블에 저장
- [ ] 서버 액션: n8n 웹훅 트리거
  - [ ] `ad_videos` 레코드 생성
  - [ ] n8n 웹훅 호출

### Phase 3: 진행 상태 표시 (1주)

- [ ] 진행 상태 페이지
  - [ ] 단계별 진행 표시 (스텝 인디케이터)
  - [ ] 각 단계별 로딩 애니메이션
  - [ ] 예상 소요 시간 표시
- [ ] Supabase Realtime 구독
  - [ ] `ad_videos` 테이블 실시간 업데이트
  - [ ] `progress_stage` 변경 감지
  - [ ] UI 자동 업데이트
- [ ] 에러 핸들링
  - [ ] 실패 시 에러 메시지 표시
  - [ ] 재시도 버튼

### Phase 4: 영상 관리 (1주)

- [ ] 마이페이지
  - [ ] 생성한 영상 목록
  - [ ] 썸네일 그리드 뷰
  - [ ] 필터링 (날짜, 상태)
- [ ] 영상 상세 페이지
  - [ ] 영상 플레이어
  - [ ] 상품 정보 표시
  - [ ] 다운로드 버튼
  - [ ] 공유 버튼 (링크 복사)
- [ ] 영상 다운로드 기능
  - [ ] Supabase Storage에서 다운로드
  - [ ] 파일명 자동 생성

### Phase 5: SNS 공유 (1-2주)

- [ ] Instagram 연동
  - [ ] Instagram OAuth 인증
  - [ ] 비즈니스 계정 연결
  - [ ] 영상 업로드 API
- [ ] Facebook 연동
  - [ ] Facebook OAuth 인증
  - [ ] 페이지 연결
  - [ ] 영상 업로드 API
- [ ] YouTube 연동
  - [ ] YouTube OAuth 인증
  - [ ] 채널 연결
  - [ ] 영상 업로드 API

### Phase 6: n8n 워크플로우 수정 (1-2일)

- [ ] 각 단계마다 Supabase Update 노드 추가
  - [ ] 광고문구 생성 후 → progress_stage 업데이트
  - [ ] 이미지 정제 후 → progress_stage 업데이트
  - [ ] 영상 생성 후 → progress_stage 업데이트
  - [ ] TTS 생성 후 → progress_stage 업데이트
  - [ ] 자막 생성 후 → progress_stage 업데이트
  - [ ] 최종 합성 후 → progress_stage + video_url 업데이트
- [ ] 에러 발생 시 → status: 'failed', error_message 업데이트

### Phase 7: 테스트 & 배포 (1주)

- [ ] 전체 플로우 테스트
  - [ ] 이미지 업로드 → 영상 생성 → 다운로드
  - [ ] 에러 케이스 테스트
- [ ] 버그 수정
- [ ] 성능 최적화
- [ ] Vercel 배포

**총 예상 개발 기간: 6-7주**

---

## 📈 성공 지표 (MVP 검증 기준)

### 정량적 지표

- 회원가입 수: 최소 100명
- 영상 생성 시도: 최소 50건
- 영상 생성 성공률: 80% 이상
- 평균 생성 시간: 5분 이내
- 다운로드 수: 생성 수의 70% 이상

### 정성적 지표

- 사용자 피드백 수집 (만족도 설문)
- UI/UX 개선 포인트 파악
- n8n 워크플로우 안정성 검증
- 기술 스택 검증 (Next.js + Clerk + Supabase + n8n)

---

## 🎨 주요 페이지 구성

### 1. 홈페이지 (`/`)

- 히어로 섹션
  - 서비스 소개 (한 줄 카피)
  - CTA 버튼 (지금 시작하기)
  - 샘플 영상 (이전에 생성된 영상)
- 사용 방법 (3단계)
  1. 이미지 + 상품명 업로드
  2. AI가 자동으로 영상 생성
  3. 다운로드 & SNS 공유
- 가격 안내 (추후)
- Footer

### 2. 업로드 페이지 (`/upload`)

- 이미지 업로드 영역
  - 드래그 앤 드롭
  - 파일 선택 버튼
  - 이미지 프리뷰
- 상품 정보 입력 폼
  - 상품명 (필수)
  - 설명 (선택, 추후)
- 생성 시작 버튼

### 3. 진행 상태 페이지 (`/generation/[id]`)

- 진행 단계 표시
  - 스텝 인디케이터 (7단계)
  - 현재 단계 강조
  - 각 단계별 아이콘 + 설명
- 로딩 애니메이션
- 예상 소요 시간
- 취소 버튼 (선택)

### 4. 마이페이지 (`/dashboard`)

- 생성한 영상 목록
  - 썸네일 그리드
  - 상태별 필터 (전체, 생성 중, 완료, 실패)
  - 날짜 정렬
- 각 영상 카드
  - 썸네일
  - 상품명
  - 생성 날짜
  - 상태 배지
  - 상세보기 버튼

### 5. 영상 상세 페이지 (`/video/[id]`)

- 영상 플레이어
  - 재생/일시정지
  - 볼륨 조절
  - 전체화면
- 상품 정보
  - 상품명
  - 생성 날짜
  - 영상 길이
- 액션 버튼
  - 다운로드
  - 링크 복사
  - SNS 공유 (Instagram, Facebook, YouTube)

---

## 🚨 제약사항 및 주의사항

### 기술적 제약

- Supabase RLS는 사용하지 않습니다 (서버 액션에서 권한 체크)
- n8n은 로컬에서 실행 (추후 클라우드 배포 고려)
- 영상 생성 시간: 약 3-5분 소요 (n8n 워크플로우 특성상)
- 파일 크기 제한:
  - 이미지: 최대 10MB
  - 영상: Supabase Storage 제한 (50MB, 추후 확장)

### 보안 고려사항

- 사용자 인증: Clerk만 담당
- 파일 접근: 서버 액션에서 user_id 검증
- API 키: 환경변수로 관리 (절대 클라이언트 노출 금지)
- n8n 웹훅: 시크릿 토큰 추가 고려

### MVP 제외 기능

- 어드민 대시보드 (추후)
- 결제 시스템 (추후)
- 워크플로우 선택 UI (추후)
- 영상 편집 기능 (추후)
- 멀티플 영상 일괄 생성 (추후)
- 영상 분석 (조회수, 공유 수) (추후)

---

## 🔐 환경 변수

`.env` 파일 필수 항목:

```bash
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

# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/6632eae6-fcdf-4f22-9f71-298989a39734
N8N_WEBHOOK_SECRET= # 추후 추가

# SNS APIs (Phase 5)
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
```

---

## 📦 개발 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일 편집 (위 필수 항목 입력)
```

### 2. 데이터베이스 마이그레이션

```bash
# Supabase 마이그레이션 생성
# (다음 단계에서 생성할 예정)
```

### 3. 개발 서버 실행

```bash
# Next.js 개발 서버
pnpm dev

# n8n 로컬 서버 (별도 터미널)
n8n start
```

### 4. 개발 순서

1. Phase 1부터 순차적으로 진행
2. 각 Phase 완료 후 테스트
3. 버그 수정 후 다음 Phase 진행
4. TypeScript strict 모드 준수
5. 에러 핸들링 철저히
6. 컴포넌트 재사용성 고려

---

## 📚 참고 문서

- [Next.js 15 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [n8n 문서](https://docs.n8n.io/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [YouTube Data API](https://developers.google.com/youtube/v3)

---

## 🎯 다음 단계

1. ✅ PRD 검토 및 승인
2. ⏭️ Phase 1: 데이터베이스 마이그레이션 파일 생성
3. ⏭️ Phase 2: 업로드 페이지 UI 개발 시작

---

_작성일: 2025-01-06_
_버전: 1.0.0_
_작성자: Claude Code_
