# AI 홍보영상 자동 생성 서비스 - TODO List

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

- [ ] Supabase Storage 설정
  - [ ] Dashboard에서 `uploads` 버킷 생성 (10MB, 이미지)
  - [ ] Dashboard에서 `videos` 버킷 생성 (50MB, 영상)
  - [x] `supabase/migrations/my_ad_storage.sql` 실행
    - [x] RLS 정책 설정
    - [x] 헬퍼 함수 생성
    - [x] 뷰 생성

- [ ] Supabase 클라이언트 설정
  - [ ] `lib/supabase/clerk-client.ts` 확인/수정
  - [ ] `lib/supabase/server.ts` 확인/수정
  - [ ] `lib/supabase/service-role.ts` 확인/수정

- [ ] 기본 레이아웃 및 라우팅
  - [ ] `app/layout.tsx` 최적화
  - [ ] `app/page.tsx` (홈페이지 라우트)
  - [ ] `app/upload/page.tsx` (업로드 페이지 라우트)
  - [ ] `app/generation/[id]/page.tsx` (진행 상태 페이지 라우트)
  - [ ] `app/dashboard/page.tsx` (대시보드 라우트)
  - [ ] `app/video/[id]/page.tsx` (영상 상세 페이지 라우트)
  - [ ] `components/layout/header.tsx` 헤더 컴포넌트
  - [ ] `components/layout/footer.tsx` 푸터 컴포넌트
  - [ ] `components/layout/navigation.tsx` 네비게이션

---

## Phase 2: 업로드 기능 (1주)

### 홈페이지 UI
- [ ] `app/page.tsx` 홈페이지 구현
  - [ ] `components/home/hero-section.tsx` 히어로 섹션
    - [ ] 서비스 소개 문구
    - [ ] CTA 버튼 (지금 시작하기)
    - [ ] 샘플 영상 표시
  - [ ] `components/home/how-it-works.tsx` 사용 방법 안내
    - [ ] 3단계 프로세스 설명
    - [ ] 각 단계별 아이콘 및 설명
  - [ ] `components/home/sample-videos.tsx` 샘플 영상 그리드
  - [ ] `components/home/footer.tsx` 홈 푸터

### 업로드 페이지
- [ ] `app/upload/page.tsx` 업로드 페이지
  - [ ] `components/upload/image-dropzone.tsx` 이미지 드래그 앤 드롭
    - [ ] react-dropzone 통합
    - [ ] 파일 선택 버튼
    - [ ] 파일 크기 검증 (최대 10MB)
    - [ ] MIME 타입 검증 (jpeg, png, jpg, webp)
  - [ ] `components/upload/image-preview.tsx` 이미지 프리뷰
    - [ ] 썸네일 표시
    - [ ] 파일 정보 (이름, 크기)
    - [ ] 삭제 버튼
  - [ ] `components/upload/product-form.tsx` 상품 정보 입력 폼
    - [ ] 상품명 입력 (필수, 1-200자)
    - [ ] react-hook-form + Zod 검증
  - [ ] `components/upload/submit-button.tsx` 생성 시작 버튼
    - [ ] 로딩 상태 표시
    - [ ] 비활성화 로직

### Server Actions
- [ ] `actions/upload-image.ts` 이미지 업로드 액션
  - [ ] Clerk 사용자 인증 확인
  - [ ] Supabase Storage에 이미지 저장
  - [ ] `product_images` 테이블에 메타데이터 저장
  - [ ] 에러 핸들링 (업로드 실패, 용량 초과 등)

- [ ] `actions/save-product-info.ts` 상품 정보 저장 액션
  - [ ] `product_info` 테이블에 저장
  - [ ] 입력 데이터 검증 (Zod)

- [ ] `actions/trigger-n8n.ts` n8n 웹훅 트리거 액션
  - [ ] `ad_videos` 레코드 생성 (status: pending)
  - [ ] n8n 웹훅 호출
    ```json
    {
      "product_image_id": "uuid",
      "product_info_id": "uuid",
      "ad_video_id": "uuid"
    }
    ```
  - [ ] 웹훅 응답 확인
  - [ ] 에러 핸들링

### Types
- [ ] `types/database.ts` 데이터베이스 타입
  - [ ] ProductImage 타입
  - [ ] ProductInfo 타입
  - [ ] AdVideo 타입
  - [ ] ProgressStage 타입
  - [ ] VideoStatus 타입

- [ ] `types/upload.ts` 업로드 관련 타입
  - [ ] UploadFormData 타입
  - [ ] ImageFile 타입
  - [ ] ValidationError 타입

---

## Phase 3: 진행 상태 표시 (1주)

### 진행 상태 페이지
- [ ] `app/generation/[id]/page.tsx` 진행 상태 페이지
  - [ ] `components/generation/step-indicator.tsx` 스텝 인디케이터
    - [ ] 8단계 표시 (init → completed)
    - [ ] 현재 단계 강조
    - [ ] 완료/진행 중/대기 상태 구분
  - [ ] `components/generation/stage-icons.tsx` 각 단계별 아이콘
    - [ ] lucide-react 아이콘 사용
    - [ ] 단계별 설명 텍스트
  - [ ] `components/generation/loading-animation.tsx` 로딩 애니메이션
    - [ ] 단계별 맞춤 애니메이션
  - [ ] `components/generation/estimated-time.tsx` 예상 소요 시간 표시
    - [ ] 단계별 소요 시간 계산
    - [ ] 남은 시간 카운트다운
  - [ ] `components/generation/cancel-button.tsx` 취소 버튼 (선택)

### Supabase Realtime 구독
- [ ] `hooks/use-realtime-video.ts` Realtime 구독 훅
  - [ ] `ad_videos` 테이블 실시간 구독
  - [ ] `progress_stage` 변경 감지
  - [ ] `status` 변경 감지
  - [ ] 자동 리렌더링

- [ ] `components/generation/realtime-provider.tsx` Realtime 프로바이더
  - [ ] Supabase Realtime 연결 관리
  - [ ] 재연결 로직

### 에러 핸들링
- [ ] `components/generation/error-message.tsx` 에러 메시지 표시
  - [ ] `error_message` 필드 파싱
  - [ ] 에러 타입별 메시지
  - [ ] 재시도 가이드

- [ ] `components/generation/retry-button.tsx` 재시도 버튼
  - [ ] `actions/retry-generation.ts` 재시도 액션
  - [ ] status/progress_stage 초기화
  - [ ] n8n 웹훅 재호출

### 완료 시 리다이렉션
- [ ] `hooks/use-generation-complete.ts` 완료 감지 훅
  - [ ] status: 'completed' 감지
  - [ ] `/video/[id]`로 자동 이동
  - [ ] 완료 알림 (toast)

---

## Phase 4: 영상 관리 (1주)

### 대시보드 (마이페이지)
- [ ] `app/dashboard/page.tsx` 대시보드 페이지
  - [ ] `components/dashboard/video-grid.tsx` 영상 그리드
    - [ ] 썸네일 그리드 레이아웃
    - [ ] 무한 스크롤 or 페이지네이션
  - [ ] `components/dashboard/video-card.tsx` 영상 카드
    - [ ] 썸네일 이미지
    - [ ] 상품명
    - [ ] 생성 날짜
    - [ ] 상태 배지 (생성 중, 완료, 실패)
    - [ ] 상세보기 버튼
  - [ ] `components/dashboard/filter-bar.tsx` 필터 바
    - [ ] 상태별 필터 (전체, 생성 중, 완료, 실패)
    - [ ] 날짜 정렬 (최신순, 오래된순)
  - [ ] `components/dashboard/empty-state.tsx` 빈 상태 UI
    - [ ] 영상 없을 때 표시
    - [ ] CTA 버튼 (첫 영상 만들기)

- [ ] `actions/fetch-user-videos.ts` 사용자 영상 목록 조회 액션
  - [ ] Clerk user ID로 필터링
  - [ ] 상태별 필터 적용
  - [ ] 정렬 적용
  - [ ] 페이지네이션

### 영상 상세 페이지
- [ ] `app/video/[id]/page.tsx` 영상 상세 페이지
  - [ ] `components/video/video-player.tsx` 영상 플레이어
    - [ ] HTML5 video 태그 or react-player
    - [ ] 재생/일시정지
    - [ ] 볼륨 조절
    - [ ] 전체화면
    - [ ] 재생 시간 표시
  - [ ] `components/video/video-info.tsx` 영상 정보
    - [ ] 상품명
    - [ ] 생성 날짜
    - [ ] 영상 길이
    - [ ] 파일 크기
  - [ ] `components/video/action-buttons.tsx` 액션 버튼
    - [ ] 다운로드 버튼
    - [ ] 링크 복사 버튼
    - [ ] SNS 공유 버튼 (Phase 5)

### 다운로드 기능
- [ ] `actions/download-video.ts` 영상 다운로드 액션
  - [ ] Supabase Storage에서 영상 URL 가져오기
  - [ ] 파일명 자동 생성 (상품명 + 날짜)
  - [ ] 다운로드 트리거

- [ ] `components/video/download-button.tsx` 다운로드 버튼
  - [ ] 로딩 상태
  - [ ] 다운로드 진행률 (선택)

### 링크 복사
- [ ] `components/video/copy-link-button.tsx` 링크 복사 버튼
  - [ ] 클립보드 API 사용
  - [ ] 복사 완료 알림 (toast)

---

## Phase 5: SNS 공유 (1-2주)

### Instagram 연동
- [ ] `app/api/auth/instagram/route.ts` Instagram OAuth
  - [ ] Instagram Graph API 인증
  - [ ] Access Token 저장

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

### n8n 워크플로우 노드 추가
- [ ] `my-ad.json` 워크플로우 수정
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
- [ ] 이미지 최적화
  - [ ] Next.js Image 컴포넌트 사용
  - [ ] WebP 변환
- [ ] 코드 스플리팅
  - [ ] 라우트별 분리
  - [ ] 동적 import
- [ ] 데이터베이스 쿼리 최적화
  - [ ] 인덱스 확인
  - [ ] N+1 문제 해결
- [ ] 캐싱 전략
  - [ ] Static 페이지 캐싱
  - [ ] API 응답 캐싱

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
- [ ] 다크 모드 지원
- [ ] 반응형 디자인 최적화 (모바일/태블릿)
- [ ] 로딩 스켈레톤 추가
- [ ] 애니메이션 및 트랜지션
- [ ] 접근성 개선 (ARIA 라벨, 키보드 내비게이션)

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
- [ ] Storage 버킷 생성 완료
- [ ] 기본 라우팅 작동

### Phase 2 완료 기준
- [ ] 이미지 업로드 가능
- [ ] 상품 정보 저장 가능
- [ ] n8n 웹훅 트리거 성공

### Phase 3 완료 기준
- [ ] 실시간 진행 상태 표시
- [ ] 8단계 모두 UI 업데이트
- [ ] 에러 처리 작동

### Phase 4 완료 기준
- [ ] 영상 목록 조회 가능
- [ ] 영상 재생 가능
- [ ] 다운로드 가능

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

**총 예상 개발 기간: 6-7주**
**현재 진행 상황: Phase 1 (80% 완료 - Storage 버킷 생성 대기 중)**

_최종 수정일: 2025-01-06_
