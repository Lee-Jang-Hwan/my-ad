# AI 홍보영상 자동 생성 서비스 - User Flow

이 문서는 AI 홍보영상 자동 생성 서비스의 사용자 흐름을 시각화한 다이어그램입니다.

---

## 1. 전체 사용자 여정 (Main User Journey)

```mermaid
flowchart TD
    Start([사용자 방문]) --> Home[홈페이지<br/>'/']
    Home --> CheckAuth{로그인<br/>여부}

    CheckAuth -->|미로그인| SignIn[로그인/회원가입<br/>Clerk]
    CheckAuth -->|로그인됨| Dashboard[대시보드<br/>'/dashboard']

    SignIn --> SyncUser[사용자 동기화<br/>Clerk → Supabase]
    SyncUser --> Dashboard

    Dashboard --> Choice{작업 선택}
    Choice -->|새 영상 생성| Upload[업로드 페이지<br/>'/upload']
    Choice -->|기존 영상 확인| VideoList[영상 목록 조회]

    Upload --> UploadImage[이미지 업로드<br/>드래그앤드롭]
    UploadImage --> EnterName[상품명 입력]
    EnterName --> Submit[생성 시작 버튼]

    Submit --> SaveDB[(DB 저장<br/>product_images<br/>product_info<br/>ad_videos)]
    SaveDB --> TriggerN8N[n8n 웹훅 트리거]

    TriggerN8N --> Progress[진행 상태 페이지<br/>'/generation/[id]']
    Progress --> Realtime[Supabase Realtime<br/>실시간 업데이트]

    Realtime --> CheckStatus{생성 상태}
    CheckStatus -->|processing| Progress
    CheckStatus -->|completed| VideoDetail[영상 상세<br/>'/video/[id]']
    CheckStatus -->|failed| ErrorPage[에러 메시지<br/>+ 재시도 버튼]

    ErrorPage -->|재시도| Submit

    VideoDetail --> Actions{사용자 액션}
    Actions -->|재생| Play[영상 재생]
    Actions -->|다운로드| Download[영상 다운로드]
    Actions -->|공유| Share[링크 복사<br/>SNS 공유]

    VideoList --> VideoDetail

    Play --> End([완료])
    Download --> End
    Share --> End

    style Start fill:#e1f5ff
    style Home fill:#fff3e0
    style SignIn fill:#f3e5f5
    style Upload fill:#e8f5e9
    style Progress fill:#fff9c4
    style VideoDetail fill:#e0f2f1
    style ErrorPage fill:#ffebee
    style End fill:#e1f5ff
```

---

## 2. 영상 생성 프로세스 (Video Generation Process)

```mermaid
sequenceDiagram
    participant U as 사용자
    participant FE as Next.js Frontend
    participant SB as Supabase DB
    participant ST as Supabase Storage
    participant N8N as n8n Workflow
    participant AI as AI APIs<br/>(Gemini, Veo, TTS)

    U->>FE: 이미지 + 상품명 업로드
    FE->>ST: 이미지 저장 (uploads 버킷)
    ST-->>FE: image_url 반환

    FE->>SB: INSERT product_images
    FE->>SB: INSERT product_info
    FE->>SB: INSERT ad_videos (status: pending)
    SB-->>FE: ad_video_id 반환

    FE->>N8N: POST /webhook (ad_video_id)
    N8N-->>FE: 202 Accepted

    FE->>U: 진행 상태 페이지로 이동
    FE->>SB: Realtime 구독 시작

    rect rgb(240, 248, 255)
        Note over N8N,AI: Stage 1: 광고문구 생성
        N8N->>AI: Gemini API 호출
        AI-->>N8N: 광고문구 반환
        N8N->>SB: UPDATE progress_stage='ad_copy_generation'
        SB-->>FE: Realtime 이벤트
        FE->>U: UI 업데이트 (1/8)
    end

    rect rgb(255, 250, 240)
        Note over N8N,AI: Stage 2: 이미지 정제
        N8N->>AI: Gemini 2.5 Flash Image
        AI-->>N8N: 정제된 이미지
        N8N->>SB: UPDATE progress_stage='image_refinement'
        SB-->>FE: Realtime 이벤트
        FE->>U: UI 업데이트 (2/8)
    end

    rect rgb(240, 255, 240)
        Note over N8N,AI: Stage 3: 영상 생성
        N8N->>AI: Veo 3.1 Video Generation
        AI-->>N8N: 생성된 영상
        N8N->>SB: UPDATE progress_stage='video_generation'
        SB-->>FE: Realtime 이벤트
        FE->>U: UI 업데이트 (3/8)
    end

    rect rgb(255, 240, 245)
        Note over N8N,AI: Stage 4: TTS 생성
        N8N->>AI: Google TTS API
        AI-->>N8N: 음성 파일
        N8N->>SB: UPDATE progress_stage='tts_generation'
        SB-->>FE: Realtime 이벤트
        FE->>U: UI 업데이트 (4/8)
    end

    rect rgb(248, 240, 255)
        Note over N8N,AI: Stage 5: 자막 생성
        N8N->>N8N: SRT 파일 생성
        N8N->>SB: UPDATE progress_stage='subtitle_generation'
        SB-->>FE: Realtime 이벤트
        FE->>U: UI 업데이트 (5/8)
    end

    rect rgb(255, 248, 240)
        Note over N8N,AI: Stage 6: 최종 합성
        N8N->>N8N: FFmpeg (영상+TTS+자막)
        N8N->>SB: UPDATE progress_stage='merging'
        SB-->>FE: Realtime 이벤트
        FE->>U: UI 업데이트 (6/8)
    end

    rect rgb(240, 255, 245)
        Note over N8N,ST: Stage 7: 완료
        N8N->>ST: 최종 영상 저장 (videos 버킷)
        ST-->>N8N: video_url 반환
        N8N->>SB: UPDATE status='completed'<br/>progress_stage='completed'<br/>video_url<br/>completed_at
        SB-->>FE: Realtime 이벤트
        FE->>U: 완료 알림 + 영상 재생 화면 (8/8)
    end

    alt 에러 발생 시
        N8N->>SB: UPDATE status='failed'<br/>error_message
        SB-->>FE: Realtime 이벤트
        FE->>U: 에러 메시지 + 재시도 버튼
    end
```

---

## 3. 시스템 아키텍처 플로우 (System Architecture)

```mermaid
graph TB
    subgraph "User Interface"
        Browser[웹 브라우저]
    end

    subgraph "Next.js Application"
        Pages[Pages<br/>/, /upload, /generation, /dashboard, /video]
        Components[React Components<br/>Upload, Progress, VideoPlayer]
        ServerActions[Server Actions<br/>이미지 업로드, n8n 트리거]
        Auth[Clerk Authentication]
    end

    subgraph "Supabase"
        DB[(PostgreSQL Database<br/>users, product_images,<br/>product_info, ad_videos)]
        Storage[Storage Buckets<br/>uploads, videos]
        Realtime[Realtime Subscriptions<br/>ad_videos 테이블 구독]
    end

    subgraph "n8n Workflow Engine"
        Webhook[Webhook Trigger]
        WF[Workflow Nodes<br/>7 Stages]
        Updates[Supabase Update Nodes]
    end

    subgraph "External AI Services"
        Gemini[Gemini 2.5 Flash<br/>광고문구 + 이미지 정제]
        Veo[Veo 3.1<br/>영상 생성]
        TTS[Google TTS<br/>음성 생성]
    end

    Browser <-->|HTTPS| Pages
    Pages --> Components
    Pages --> ServerActions
    Pages --> Auth

    Auth <-->|JWT| DB
    ServerActions -->|SQL| DB
    ServerActions -->|File Upload| Storage
    Components -->|Subscribe| Realtime

    ServerActions -->|POST Webhook| Webhook
    Webhook --> WF
    WF --> Updates
    Updates -->|SQL UPDATE| DB

    WF -->|API Call| Gemini
    WF -->|API Call| Veo
    WF -->|API Call| TTS

    WF -->|Save Video| Storage

    Realtime -->|WebSocket| Components
    Storage -->|Public URL| Components

    style Browser fill:#e3f2fd
    style Pages fill:#fff3e0
    style Auth fill:#f3e5f5
    style DB fill:#e8f5e9
    style Storage fill:#e0f2f1
    style Realtime fill:#fff9c4
    style Webhook fill:#fce4ec
    style WF fill:#f3e5f5
    style Gemini fill:#e8eaf6
    style Veo fill:#e8eaf6
    style TTS fill:#e8eaf6
```

---

## 4. 데이터베이스 관계도 (Database ERD)

```mermaid
erDiagram
    users ||--o{ product_images : "uploads"
    users ||--o{ product_info : "creates"
    users ||--o{ ad_videos : "owns"

    product_images ||--o{ ad_videos : "referenced by"
    product_info ||--o{ ad_videos : "referenced by"

    users {
        uuid id PK
        text clerk_id UK "Clerk 사용자 ID"
        text name
        timestamp created_at
    }

    product_images {
        uuid id PK
        text user_id FK "users.clerk_id"
        text image_url "Supabase Storage 경로"
        text original_filename
        integer file_size "최대 10MB"
        text mime_type "image/jpeg, png, jpg, webp"
        text status "uploaded, processing, completed, failed"
        timestamp created_at
        timestamp updated_at
    }

    product_info {
        uuid id PK
        text user_id FK "users.clerk_id"
        text product_name "1-200자"
        text description "최대 1000자 (추후)"
        text category "최대 100자 (추후)"
        timestamp created_at
    }

    ad_videos {
        uuid id PK
        text user_id FK "users.clerk_id"
        uuid product_image_id FK "product_images.id"
        uuid product_info_id FK "product_info.id"
        text video_url "Supabase Storage 경로"
        text thumbnail_url
        integer duration "초"
        integer file_size "bytes"
        text status "pending, processing, completed, failed"
        text progress_stage "8단계"
        text error_message
        timestamp created_at
        timestamp completed_at
    }

    n8n_workflows {
        uuid id PK
        text name
        text description
        text webhook_url
        boolean is_active
        timestamp created_at
    }
```

---

## 5. 페이지 네비게이션 플로우 (Page Navigation)

```mermaid
stateDiagram-v2
    [*] --> HomePage: 사용자 방문

    HomePage --> SignIn: 미로그인
    HomePage --> Dashboard: 로그인됨

    SignIn --> Dashboard: 인증 완료

    state Dashboard {
        [*] --> VideoGrid: 영상 목록 표시
        VideoGrid --> FilterStatus: 필터 적용
        FilterStatus --> VideoGrid
    }

    Dashboard --> UploadPage: "새 영상 만들기" 클릭
    Dashboard --> VideoDetailPage: 영상 카드 클릭

    state UploadPage {
        [*] --> ImageUpload: 이미지 업로드
        ImageUpload --> ImagePreview: 미리보기
        ImagePreview --> FormInput: 상품명 입력
        FormInput --> ReadyToSubmit: 입력 완료
    }

    UploadPage --> GenerationPage: "생성 시작" 클릭

    state GenerationPage {
        [*] --> Stage1: 광고문구 생성
        Stage1 --> Stage2: 이미지 정제
        Stage2 --> Stage3: 영상 생성
        Stage3 --> Stage4: TTS 생성
        Stage4 --> Stage5: 자막 생성
        Stage5 --> Stage6: 합성 중
        Stage6 --> Stage7: 저장 중
        Stage7 --> Completed: 완료

        Stage1 --> Failed: 에러 발생
        Stage2 --> Failed: 에러 발생
        Stage3 --> Failed: 에러 발생
        Stage4 --> Failed: 에러 발생
        Stage5 --> Failed: 에러 발생
        Stage6 --> Failed: 에러 발생
    }

    GenerationPage --> VideoDetailPage: 완료 시 자동 이동
    GenerationPage --> UploadPage: 재시도 (실패 시)

    state VideoDetailPage {
        [*] --> VideoPlayer: 영상 재생
        VideoPlayer --> Actions: 사용자 액션

        state Actions {
            [*] --> Play: 재생/일시정지
            [*] --> Download: 다운로드
            [*] --> CopyLink: 링크 복사
            [*] --> ShareSNS: SNS 공유 (Phase 5)
        }
    }

    VideoDetailPage --> Dashboard: "목록으로" 클릭

    Dashboard --> HomePage: 로그아웃
    HomePage --> [*]: 종료
```

---

## 6. 에러 핸들링 플로우 (Error Handling)

```mermaid
flowchart TD
    Start([프로세스 시작]) --> Execute[작업 실행]

    Execute --> Check{작업 성공?}

    Check -->|성공| Success[다음 단계 진행]
    Check -->|실패| CaptureError[에러 정보 수집]

    CaptureError --> UpdateDB[DB 업데이트<br/>status='failed'<br/>error_message 저장]

    UpdateDB --> NotifyUser[사용자에게 알림<br/>Realtime 이벤트]

    NotifyUser --> ShowError[에러 메시지 화면 표시]

    ShowError --> UserChoice{사용자 선택}

    UserChoice -->|재시도| RetryCount{재시도<br/>횟수 확인}
    UserChoice -->|취소| Cancel[대시보드로 이동]

    RetryCount -->|3회 미만| ResetStatus[status='pending'<br/>progress_stage='init']
    RetryCount -->|3회 이상| LimitReached[재시도 제한<br/>고객 지원 안내]

    ResetStatus --> Execute

    LimitReached --> End([종료])
    Cancel --> End
    Success --> End

    style Start fill:#e1f5ff
    style Execute fill:#fff3e0
    style Success fill:#e8f5e9
    style CaptureError fill:#ffebee
    style ShowError fill:#ffcdd2
    style Cancel fill:#e0e0e0
    style End fill:#e1f5ff
```

---

## 7. Supabase Storage 구조 (Storage Structure)

```mermaid
graph TD
    Storage[Supabase Storage]

    Storage --> Uploads[uploads 버킷<br/>공개, 최대 10MB]
    Storage --> Videos[videos 버킷<br/>공개, 최대 50MB]

    Uploads --> User1U[user_test001/]
    Uploads --> User2U[user_test002/]
    Uploads --> User3U[user_test003/]

    User1U --> ImagesU1[images/]
    ImagesU1 --> File1[coffee-latte-001.jpg]
    ImagesU1 --> File2[bakery-croissant-001.jpg]

    Videos --> User1V[user_test001/]
    Videos --> User2V[user_test002/]
    Videos --> User3V[user_test003/]

    User1V --> VideosFolder1[videos/]
    VideosFolder1 --> Video1[a1b2c3d4-...uuid.mp4]

    User1V --> Thumbnails1[videos/thumbnails/]
    Thumbnails1 --> Thumb1[a1b2c3d4-...uuid.jpg]

    style Storage fill:#e0f2f1
    style Uploads fill:#e8f5e9
    style Videos fill:#fff9c4
    style User1U fill:#f3e5f5
    style User1V fill:#f3e5f5
```

---

## 8. 진행 단계 상태 전이도 (Progress Stage Transitions)

```mermaid
stateDiagram-v2
    [*] --> init: ad_video 생성

    init --> ad_copy_generation: n8n 웹훅 트리거
    ad_copy_generation --> image_refinement: Gemini API 완료
    image_refinement --> video_generation: 이미지 정제 완료
    video_generation --> tts_generation: Veo 3.1 완료
    tts_generation --> subtitle_generation: Google TTS 완료
    subtitle_generation --> merging: SRT 파일 생성 완료
    merging --> completed: FFmpeg 합성 완료

    completed --> [*]: 프로세스 종료

    ad_copy_generation --> failed: API 에러
    image_refinement --> failed: API 에러
    video_generation --> failed: API 에러 / 타임아웃
    tts_generation --> failed: API 에러
    subtitle_generation --> failed: 생성 실패
    merging --> failed: FFmpeg 에러

    failed --> init: 재시도
    failed --> [*]: 취소

    note right of init
        status: pending
        progress_stage: init
    end note

    note right of ad_copy_generation
        status: processing
        광고문구 생성 중
    end note

    note right of completed
        status: completed
        video_url 설정됨
        completed_at 기록
    end note

    note right of failed
        status: failed
        error_message 기록
    end note
```

---

## 참고사항

### 색상 코드
- 🔵 파란색: 시작/종료 상태
- 🟡 노란색: 진행 중 상태
- 🟢 초록색: 성공 상태
- 🔴 빨간색: 에러 상태
- 🟣 보라색: 인증 관련
- 🟠 주황색: 외부 서비스

### 주요 URL
- 홈: `/`
- 업로드: `/upload`
- 진행 상태: `/generation/[id]`
- 대시보드: `/dashboard`
- 영상 상세: `/video/[id]`

### 웹훅 URL
```
http://localhost:5678/webhook/6632eae6-fcdf-4f22-9f71-298989a39734
```

### 데이터베이스 상태
- **status**: `pending`, `processing`, `completed`, `failed`
- **progress_stage**: `init`, `ad_copy_generation`, `image_refinement`, `video_generation`, `tts_generation`, `subtitle_generation`, `merging`, `completed`

---

_작성일: 2025-01-06_
_버전: 1.0.0_
_기반 문서: PRD.md, my_ad_schema.sql_
