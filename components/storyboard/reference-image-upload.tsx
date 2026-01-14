"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadReferenceImage, deleteReferenceImage } from "@/actions/storyboard/upload-reference-image";
import {
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  formatFileSize,
  validateImageFile,
} from "@/lib/validation";

interface ReferenceImageUploadProps {
  value?: string;
  storagePath?: string;
  onChange: (imageUrl: string | undefined, storagePath: string | undefined) => void;
  disabled?: boolean;
}

export function ReferenceImageUpload({
  value,
  storagePath,
  onChange,
  disabled = false,
}: ReferenceImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);

      // 클라이언트 측 유효성 검사
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "유효하지 않은 파일입니다.");
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const result = await uploadReferenceImage(formData);

        if (!result.success) {
          setError(result.error || "업로드에 실패했습니다.");
          return;
        }

        onChange(result.imageUrl, result.storagePath);
      } catch (err) {
        console.error("Upload error:", err);
        setError("업로드 중 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    if (!storagePath) {
      onChange(undefined, undefined);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteReferenceImage(storagePath);

      if (!result.success) {
        // 삭제 실패해도 UI에서는 제거 (서버 파일은 나중에 정리)
        console.warn("Failed to delete from storage:", result.error);
      }

      onChange(undefined, undefined);
    } catch (err) {
      console.error("Delete error:", err);
      // 에러가 나도 UI에서는 제거
      onChange(undefined, undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        // 이미지가 업로드된 상태
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src={value}
              alt="참조 이미지"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          {/* 삭제 버튼 */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={isDeleting || disabled}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>

          {/* 이미지 교체 버튼 */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleButtonClick}
            disabled={isUploading || isDeleting || disabled}
          >
            이미지 교체
          </Button>
        </div>
      ) : (
        // 업로드 영역
        <div
          className={`
            relative flex flex-col items-center justify-center
            w-full aspect-video
            border-2 border-dashed rounded-lg
            transition-colors cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
            ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={disabled || isUploading ? undefined : handleButtonClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">업로드 중...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
              {isDragging ? (
                <>
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">여기에 놓으세요</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8" />
                  <div>
                    <span className="text-sm font-medium">클릭하거나 드래그하여 업로드</span>
                    <p className="text-xs mt-1">
                      JPEG, PNG, WebP ({formatFileSize(MAX_FILE_SIZE)} 이하)
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-start gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
