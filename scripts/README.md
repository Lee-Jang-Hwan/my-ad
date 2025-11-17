# 데모 샘플 데이터 생성 스크립트

이 폴더에는 프로젝트의 데모용 샘플 데이터를 생성하는 스크립트가 포함되어 있습니다.

## 📁 파일 구조

```
scripts/
├── seed-demo-data.sql     # SQL 마이그레이션 파일
├── seed-demo-data.ts      # TypeScript 실행 스크립트
└── README.md              # 이 파일
```

## 🎯 생성되는 데이터

### 샘플 영상 (완성됨)
- 6개의 완성된 홍보영상 (`step1-sample.mp4` ~ `step6-sample.mp4`)
- 실제 `public/videos/` 폴더의 파일과 연결됨
- 각 영상은 약 15초 길이

### 진행 중인 영상
- 2개의 진행 중인 영상 (서로 다른 단계)
- 실시간 업데이트 UI 테스트용

### 실패한 영상
- 1개의 실패한 영상 (에러 메시지 포함)
- 에러 핸들링 UI 테스트용

### 데모 사용자
- 3명의 테스트 사용자
- `user_demo_001`, `user_demo_002`, `user_demo_003`

## 🚀 사용 방법

### 방법 1: TypeScript 스크립트 (권장)

```bash
# 1. 환경변수 설정 확인 (.env 파일)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 2. 스크립트 실행
pnpm tsx scripts/seed-demo-data.ts
```

**장점:**
- 실행 결과를 즉시 확인 가능
- 에러 메시지가 명확함
- 생성된 데이터를 테이블로 출력

### 방법 2: SQL 직접 실행

#### Supabase Dashboard 사용

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 선택
4. **New query** 버튼 클릭
5. `scripts/seed-demo-data.sql` 파일 내용 복사 & 붙여넣기
6. **Run** 버튼 클릭

#### psql 사용

```bash
# PostgreSQL CLI로 직접 실행
psql -h your-db-host -U postgres -d postgres -f scripts/seed-demo-data.sql
```

## 📊 데이터 확인

### 1. 홈페이지에서 확인

```bash
pnpm dev
# http://localhost:3000 접속
# 샘플 영상 섹션에서 6개 영상 확인 가능
```

### 2. 대시보드에서 확인

```bash
# 1. 데모 계정으로 Clerk 로그인
# 2. /dashboard 페이지 이동
# 3. 완성된 영상, 진행 중인 영상, 실패한 영상 확인
```

### 3. Supabase Dashboard에서 확인

```sql
-- 생성된 영상 목록 확인
SELECT
    av.id,
    av.user_id,
    pf.product_name,
    av.video_url,
    av.status,
    av.progress_stage,
    av.created_at
FROM
    ad_videos av
JOIN
    product_info pf ON av.product_info_id = pf.id
WHERE
    av.user_id LIKE 'user_demo%'
ORDER BY
    av.created_at DESC;
```

## 🔄 데이터 재생성

기존 데모 데이터를 삭제하고 다시 생성하려면:

### TypeScript 스크립트

```typescript
// scripts/seed-demo-data.ts 파일 상단 주석 해제
DELETE FROM public.ad_videos WHERE user_id LIKE 'user_demo%';
DELETE FROM public.product_info WHERE user_id LIKE 'user_demo%';
DELETE FROM public.product_images WHERE user_id LIKE 'user_demo%';
DELETE FROM public.users WHERE clerk_id LIKE 'user_demo%';
```

### SQL 직접 실행

```sql
-- 1. 기존 데모 데이터 삭제
DELETE FROM public.ad_videos WHERE user_id LIKE 'user_demo%';
DELETE FROM public.product_info WHERE user_id LIKE 'user_demo%';
DELETE FROM public.product_images WHERE user_id LIKE 'user_demo%';
DELETE FROM public.users WHERE clerk_id LIKE 'user_demo%';

-- 2. scripts/seed-demo-data.sql 다시 실행
```

## 🎬 샘플 영상 파일 위치

```
public/
└── videos/
    ├── step1-sample.mp4  # 프리미엄 제품 샘플 1
    ├── step2-sample.mp4  # 프리미엄 제품 샘플 2
    ├── step3-sample.mp4  # 프리미엄 제품 샘플 3
    ├── step4-sample.mp4  # 프리미엄 제품 샘플 4
    ├── step5-sample.mp4  # 프리미엄 제품 샘플 5
    └── step6-sample.mp4  # 프리미엄 제품 샘플 6
```

**주의:** 이 파일들은 Next.js의 `public` 폴더에 있어야 하며, URL은 `/videos/step1-sample.mp4` 형식으로 접근 가능합니다.

## 🐛 문제 해결

### 에러: "환경변수가 설정되지 않았습니다"

```bash
# .env 파일에 다음 변수 추가
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 에러: "foreign key constraint violation"

- `users` 테이블이 먼저 생성되지 않았을 수 있습니다
- `supabase/migrations/my_ad_schema.sql` 먼저 실행 필요

### 에러: "duplicate key value violates unique constraint"

- 이미 데모 데이터가 존재합니다
- 위의 "데이터 재생성" 섹션 참고하여 기존 데이터 삭제 후 재실행

## 📝 데이터 구조

### users 테이블
```typescript
{
  clerk_id: 'user_demo_001',
  name: '데모 사용자 1',
  created_at: '2025-01-10T12:00:00Z'
}
```

### product_images 테이블
```typescript
{
  id: '11111111-1111-1111-1111-111111111111',
  user_id: 'user_demo_001',
  image_url: 'demo/images/sample1.jpg',
  original_filename: 'product-sample-1.jpg',
  file_size: 2500000,
  mime_type: 'image/jpeg',
  status: 'completed'
}
```

### product_info 테이블
```typescript
{
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  user_id: 'user_demo_001',
  product_name: '프리미엄 제품 샘플 1',
  description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
  category: '데모/샘플'
}
```

### ad_videos 테이블
```typescript
{
  id: '10000000-0000-0000-0000-000000000001',
  user_id: 'user_demo_001',
  product_image_id: '11111111-1111-1111-1111-111111111111',
  product_info_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  video_url: '/videos/step1-sample.mp4',
  duration: 15,
  file_size: 5242880,
  status: 'completed',
  progress_stage: 'completed',
  completed_at: '2025-01-10T12:05:00Z'
}
```

## 🔗 관련 문서

- [PRD.md](../docs/PRD.md) - 프로젝트 요구사항
- [CLAUDE.md](../CLAUDE.md) - 프로젝트 구조 및 컨벤션
- [Supabase 마이그레이션](../supabase/migrations/) - 데이터베이스 스키마

## 📞 문의

스크립트 실행 중 문제가 발생하면 프로젝트 이슈 트래커에 등록해주세요.
