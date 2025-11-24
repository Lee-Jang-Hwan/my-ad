# 파일 업로드 문제 해결

## 문제 상황

웹에서 영상 생성 시 업로드 파일을 선택했는데 파일이 적용되지 않는 문제가 발생했습니다.

## 원인 분석

1. **react-dropzone의 onDrop 콜백에서 rejected files 처리 부재**
   - `onDrop` 콜백에서 `rejectedFiles` 파라미터를 받지 않아 파일 거부 이유를 확인할 수 없었음
   - 파일이 거부된 경우에 대한 명확한 에러 메시지가 없었음

2. **디버깅 정보 부족**
   - 파일 선택 과정에서 어떤 단계에서 문제가 발생하는지 추적할 수 없었음
   - 상태 업데이트가 실제로 일어나는지 확인할 방법이 없었음

## 해결 방법

### 1. ImageDropzone 컴포넌트 개선

#### 변경 사항 ([image-dropzone.tsx](../components/upload/image-dropzone.tsx))

- **onDrop 콜백 개선**
  ```typescript
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // rejected files 처리 추가
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors && rejection.errors.length > 0) {
          const error = rejection.errors[0];
          if (error.code === "file-too-large") {
            alert("파일 크기는 최대 10MB까지 업로드 가능합니다.");
          } else if (error.code === "file-invalid-type") {
            alert("지원하지 않는 파일 형식입니다. (JPEG, PNG, WEBP만 가능)");
          }
        }
        return;
      }
      // ... 나머지 로직
    },
    [onImageSelected]
  );
  ```

- **디버깅 로그 추가**
  - 파일 선택 시 콘솔에 파일 정보 출력
  - accepted/rejected files 구분하여 로깅
  - 검증 실패 시 상세한 에러 메시지 출력

- **fileRejections 상태 활용**
  ```typescript
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    // ...
  });

  if (fileRejections.length > 0) {
    console.log("File rejections:", fileRejections);
  }
  ```

### 2. UploadForm 컴포넌트 개선

#### 변경 사항 ([upload-form.tsx](../components/upload/upload-form.tsx))

- **상태 변경 로깅 추가**
  ```typescript
  const handleImageSelected = (image: ImageFile) => {
    console.log("UploadForm: handleImageSelected called with:", image);
    setSelectedImage(image);
    setError(null);
    console.log("UploadForm: selectedImage state updated");
  };
  ```

- **개발 모드 디버그 UI 추가**
  - 선택된 파일 정보 표시
  - 폼 유효성 상태 표시
  - development 환경에서만 표시되도록 설정

  ```tsx
  {process.env.NODE_ENV === "development" && (
    <Card className="p-4 bg-blue-50 dark:bg-blue-950">
      <details>
        <summary>디버그 정보 (개발 모드)</summary>
        <div className="mt-2 space-y-1 text-xs font-mono">
          <p><strong>선택된 이미지:</strong> {selectedImage ? selectedImage.file.name : "없음"}</p>
          <p><strong>폼 유효성:</strong> {isFormValid ? "유효" : "무효"}</p>
        </div>
      </details>
    </Card>
  )}
  ```

### 3. 테스트 페이지 생성

#### 새로운 파일: [upload-test/page.tsx](../app/upload-test/page.tsx)

파일 업로드 기능만을 테스트할 수 있는 전용 페이지를 생성했습니다.

**주요 기능:**
- 실시간 상태 정보 표시
- 타임스탬프가 포함된 로그 표시
- 파일 선택/제거 이벤트 추적

**접근 방법:**
- 개발 서버 실행: `pnpm dev`
- 브라우저에서 `http://localhost:3001/upload-test` 접근

## 검증 방법

### 1. 로컬 테스트
```bash
pnpm dev
```

브라우저에서 다음을 확인:
1. `http://localhost:3001/upload` - 실제 업로드 페이지
2. `http://localhost:3001/upload-test` - 테스트 페이지

### 2. 브라우저 콘솔 확인

파일 선택 시 다음과 같은 로그가 출력되어야 합니다:

```
onDrop called
Accepted files: [File]
Processing file: example.jpg 123456 image/jpeg
Preview URL created: blob:...
Calling onImageSelected
UploadForm: handleImageSelected called with: {file: File, preview: "blob:..."}
UploadForm: selectedImage state updated
```

### 3. 에러 케이스 테스트

다음 상황을 테스트하여 적절한 에러 메시지가 표시되는지 확인:

- ❌ 지원하지 않는 파일 형식 (.txt, .pdf 등)
  → "지원하지 않는 파일 형식입니다. (JPEG, PNG, WEBP만 가능)"

- ❌ 10MB 초과 파일
  → "파일 크기는 최대 10MB까지 업로드 가능합니다."

- ✅ 정상 파일 (JPEG, PNG, WEBP, 10MB 이하)
  → 파일 미리보기 표시 및 "영상 생성 시작" 버튼 활성화

## 주요 개선 사항

### 1. 에러 처리 강화
- rejected files에 대한 명확한 에러 메시지 제공
- 파일 타입, 크기에 따른 구체적인 안내

### 2. 디버깅 기능
- 개발 환경에서 실시간 상태 확인 가능
- 콘솔 로그로 파일 처리 흐름 추적

### 3. 사용자 경험 개선
- 파일 선택 즉시 미리보기 표시
- 선택된 파일 정보(이름, 크기) 표시
- 파일 제거 기능

## 다음 단계

개발 모드의 디버깅 정보를 통해 실제 문제를 확인한 후:

1. 문제가 해결되었다면 프로덕션 빌드 전 디버깅 로그 제거/최소화
2. 추가적인 파일 검증이 필요하다면 백엔드 측에서도 검증 추가
3. 사용자 친화적인 에러 메시지로 alert를 toast 알림으로 교체 고려

## 관련 파일

- [components/upload/image-dropzone.tsx](../components/upload/image-dropzone.tsx)
- [components/upload/upload-form.tsx](../components/upload/upload-form.tsx)
- [app/upload-test/page.tsx](../app/upload-test/page.tsx)
- [lib/validation.ts](../lib/validation.ts)
- [types/upload.ts](../types/upload.ts)
