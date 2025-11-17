# 🤖 n8n 워크플로우 자동 수정 가이드

## 📌 개요

이 가이드는 n8n 워크플로우를 **자동으로** 수정하는 방법을 설명합니다.
수동으로 토글을 하나하나 변경하는 대신, 스크립트를 사용하여 한 번에 모든 설정을 수정할 수 있습니다.

---

## 🎯 두 가지 방법

### 방법 1: n8n UI에서 직접 수정 (권장)

**장점:**
- 즉시 적용 가능
- 검증이 쉬움
- 추가 도구 불필요

**단점:**
- 수동 작업 필요
- 실수 가능성

**가이드:** [`N8N_WORKFLOW_CONFIGURATION.md`](N8N_WORKFLOW_CONFIGURATION.md)

---

### 방법 2: 자동 스크립트 사용

**장점:**
- 자동화
- 실수 없음
- 반복 가능

**단점:**
- Node.js 필요
- Export/Import 과정 필요

**가이드:** 아래 참조 ⬇️

---

## 🚀 방법 2: 자동 스크립트 사용 (상세 가이드)

### Step 1: Node.js 설치 확인

```bash
node --version
```

**출력 예시:** `v18.17.0` 또는 `v20.x.x`

만약 Node.js가 설치되어 있지 않다면:
1. https://nodejs.org 접속
2. LTS 버전 다운로드 및 설치

---

### Step 2: n8n 워크플로우 다운로드

1. **n8n 대시보드** 접속
2. "AI 홍보영상 생성" 워크플로우 열기
3. 우측 상단 **메뉴(⋮)** 클릭
4. **"Download"** 클릭
5. JSON 파일 저장 (예: `ai-video-workflow.json`)

---

### Step 3: 스크립트 실행

#### 3-1. 다운로드한 파일을 프로젝트 폴더로 이동

```bash
# Windows (PowerShell)
Move-Item "C:\Users\USER\Downloads\ai-video-workflow.json" "C:\Users\USER\Desktop\oz\oz-edu\base-plate\my-ad1106\scripts\"

# 또는 파일 탐색기에서 드래그 앤 드롭
```

#### 3-2. scripts 폴더로 이동

```bash
cd C:\Users\USER\Desktop\oz\oz-edu\base-plate\my-ad1106\scripts
```

#### 3-3. 스크립트 실행

```bash
node fix-n8n-workflow.js ai-video-workflow.json
```

#### 3-4. 출력 예시

```
🔍 워크플로우 파일 읽는 중...
✅ 워크플로우 파일 로드 완료
📄 워크플로우 이름: AI 홍보영상 생성
📊 총 노드 개수: 15

✅ 타겟 노드 발견: "최종 업데이트: Completed"
   타입: n8n-nodes-base.supabase
   위치: 노드 #12

📋 현재 필드 개수: 7

🔧 필드 수정 중...

⏭️  status: Fixed 모드 유지 (변경 없음)
⏭️  progress_stage: Fixed 모드 유지 (변경 없음)
🔄 video_url: Fixed 모드 → Expression 모드
   이전: ={{ $('응답 처리').item.json.publicUrl }}
   이후: ={{ $('응답 처리').item.json.publicUrl }}
🔄 thumbnail_url: Fixed 모드 → Expression 모드
   이전: ={{ $('응답 처리').item.json.thumbnailUrl }}
   이후: ={{ $('응답 처리').item.json.thumbnailUrl }}
🔄 duration: Fixed 모드 → Expression 모드
   이전: ={{ $('응답 처리').item.json.duration }}
   이후: ={{ $('응답 처리').item.json.duration }}
🔄 file_size: Fixed 모드 → Expression 모드
   이전: ={{ $('응답 처리').item.json.fileSize }}
   이후: ={{ $('응답 처리').item.json.fileSize }}
🔄 completed_at: Fixed 모드 → Expression 모드
   이전: ={{ $now.toISO() }}
   이후: ={{ $now.toISO() }}

📊 수정 결과:
   ✅ 이미 올바른 필드: 0개
   🔄 수정된 필드: 5개
   ⏭️  유지된 필드: 2개

✅ 수정된 워크플로우 저장 완료: ai-video-workflow-fixed.json

🎉 완료! 다음 단계:
1. n8n 대시보드에서 워크플로우 메뉴 열기
2. "Import from File" 클릭
3. "ai-video-workflow-fixed.json" 파일 선택
4. 기존 워크플로우를 덮어쓰기 또는 새로운 워크플로우로 생성
5. 워크플로우 활성화 후 테스트

💡 Tip: 기존 워크플로우를 백업하는 것을 권장합니다!
```

---

### Step 4: 수정된 워크플로우 업로드

1. **n8n 대시보드** 접속
2. 좌측 메뉴에서 **"Workflows"** 클릭
3. 우측 상단 **"Import from File"** 클릭
4. `ai-video-workflow-fixed.json` 파일 선택
5. **옵션 선택:**
   - **"Update existing"** (기존 워크플로우 업데이트) ← 권장
   - 또는 **"Create new"** (새 워크플로우로 생성)
6. **"Import"** 클릭

---

### Step 5: 검증

#### 5-1. 노드 설정 확인

1. 업로드된 워크플로우 열기
2. "최종 업데이트: Completed" 노드 클릭
3. Fields to Set 확인:
   - `video_url` 토글이 **ON** (Expression 모드)인지 확인 ✅
   - `thumbnail_url` 토글이 **ON**인지 확인 ✅
   - `duration` 토글이 **ON**인지 확인 ✅
   - `file_size` 토글이 **ON**인지 확인 ✅
   - `completed_at` 토글이 **ON**인지 확인 ✅

#### 5-2. 워크플로우 활성화

1. 우측 상단 토글 스위치가 **ON** (활성화) 상태인지 확인
2. **"Save"** 클릭

#### 5-3. 실제 테스트

1. 웹 애플리케이션에서 새 이미지 업로드
2. 영상 생성 완료 대기
3. 대시보드에서 확인:
   - ✅ 썸네일 또는 영상 첫 프레임 표시
   - ✅ "영상 보기" 클릭 시 재생됨
   - ✅ "영상 다운로드" 클릭 시 다운로드됨

---

## 🔍 문제 해결

### ❌ "타겟 노드를 찾을 수 없습니다"

**원인:** 노드 이름이 예상과 다름

**해결:**
1. n8n 워크플로우에서 Supabase Update 노드의 실제 이름 확인
2. `fix-n8n-workflow.js` 파일 수정:

```javascript
// 8번째 줄 근처에 있는 targetNodeNames 배열에 실제 노드 이름 추가
const targetNodeNames = [
  '최종 업데이트: Completed',
  '최종 업데이트',
  'Update Completed',
  'Supabase Update',
  '여기에-실제-노드-이름-추가',  // ← 추가
];
```

### ❌ "JSON 파일을 파싱할 수 없습니다"

**원인:** 잘못된 JSON 파일

**해결:**
1. n8n에서 워크플로우를 다시 다운로드
2. 파일을 텍스트 에디터로 열어서 JSON 형식이 올바른지 확인

### ❌ 스크립트 실행 후에도 문제가 해결되지 않음

**원인:** n8n에 업로드하지 않았거나 잘못된 워크플로우 활성화

**해결:**
1. `-fixed.json` 파일을 n8n에 정확히 업로드했는지 확인
2. 올바른 워크플로우가 활성화되어 있는지 확인
3. n8n 워크플로우를 재시작

---

## 📊 비교: 수동 vs 자동

| 항목 | 수동 수정 | 자동 스크립트 |
|------|----------|--------------|
| **소요 시간** | 5-10분 | 1분 |
| **난이도** | 쉬움 | 중간 |
| **실수 가능성** | 높음 | 없음 |
| **반복 작업** | 필요 | 재사용 가능 |
| **사전 준비** | 없음 | Node.js 설치 |
| **검증** | 쉬움 | 중간 |

**권장:**
- **처음 수정:** 방법 1 (수동) 사용
- **여러 워크플로우 수정:** 방법 2 (자동) 사용
- **재배포 시:** 방법 2 (자동) 사용

---

## 🎯 체크리스트

### 자동 수정 프로세스
- [ ] Node.js 설치 확인
- [ ] n8n 워크플로우 다운로드 (JSON)
- [ ] 스크립트 실행: `node fix-n8n-workflow.js <file.json>`
- [ ] `-fixed.json` 파일 생성 확인
- [ ] n8n에 수정된 워크플로우 업로드
- [ ] 노드 설정에서 토글 상태 확인
- [ ] 워크플로우 활성화
- [ ] 새 영상 생성 테스트

### 검증
- [ ] n8n Execution 로그에서 실제 URL 확인
- [ ] Supabase 데이터베이스에서 실제 URL 확인
- [ ] 웹에서 썸네일 표시 확인
- [ ] 웹에서 영상 재생 확인
- [ ] 웹에서 다운로드 확인

---

## 📚 관련 문서

- [`N8N_WORKFLOW_CONFIGURATION.md`](N8N_WORKFLOW_CONFIGURATION.md) - 수동 수정 가이드
- [`QUICK_FIX_CHECKLIST.md`](QUICK_FIX_CHECKLIST.md) - 빠른 수정 체크리스트
- [`fix-n8n-workflow.js`](../scripts/fix-n8n-workflow.js) - 자동 수정 스크립트

---

## 💡 추가 팁

### 여러 환경에 배포

개발, 스테이징, 프로덕션 환경이 각각 있다면:

```bash
# 개발 환경 워크플로우 수정
node fix-n8n-workflow.js dev-workflow.json

# 스테이징 환경 워크플로우 수정
node fix-n8n-workflow.js staging-workflow.json

# 프로덕션 환경 워크플로우 수정
node fix-n8n-workflow.js prod-workflow.json
```

모든 환경에 동일한 수정을 일관되게 적용할 수 있습니다.

### Git으로 버전 관리

수정된 워크플로우를 Git에 커밋하면:

```bash
git add scripts/
git commit -m "Add n8n workflow auto-fix script"
git push
```

팀원들도 동일한 스크립트를 사용할 수 있습니다.

---

## 🎉 완료!

이제 n8n 워크플로우가 자동으로 올바른 URL을 저장합니다!

**더 이상 수동으로 SQL을 실행하거나 토글을 변경할 필요가 없습니다.** 🚀