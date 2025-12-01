"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { validateImageFile, formatFileSize } from "@/lib/validation";
import type { ImageFile } from "@/types/upload";

interface ImageDropzoneProps {
  onImageSelected: (image: ImageFile) => void;
  onImageRemoved: () => void;
  selectedImage: ImageFile | null;
  disabled?: boolean;
}

export function ImageDropzone({
  onImageSelected,
  onImageRemoved,
  selectedImage,
  disabled = false,
}: ImageDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      console.log("onDrop called");
      console.log("Accepted files:", acceptedFiles);
      console.log("Rejected files:", rejectedFiles);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        console.error("File rejected:", rejection);

        if (rejection.errors && rejection.errors.length > 0) {
          const error = rejection.errors[0];
          if (error.code === "file-too-large") {
            alert("파일 크기는 최대 10MB까지 업로드 가능합니다.");
          } else if (error.code === "file-invalid-type") {
            alert("지원하지 않는 파일 형식입니다. (JPEG, PNG, WEBP만 가능)");
          } else {
            alert(`파일 업로드 오류: ${error.message}`);
          }
        }
        return;
      }

      if (acceptedFiles.length === 0) {
        console.warn("No files accepted");
        return;
      }

      const file = acceptedFiles[0];
      console.log("Processing file:", file.name, file.size, file.type);

      const validation = validateImageFile(file);

      if (!validation.valid) {
        console.error("Validation failed:", validation.error);
        alert(validation.error);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      console.log("Preview URL created:", preview);
      console.log("Calling onImageSelected");
      onImageSelected({ file, preview });
    },
    [onImageSelected]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: false,
      disabled,
    });

  // Log file rejections for debugging
  if (fileRejections.length > 0) {
    console.log("File rejections:", fileRejections);
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
      onImageRemoved();
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold mb-1">
                {isDragActive
                  ? "이미지를 여기에 놓으세요"
                  : "이미지를 드래그하거나 클릭하세요"}
              </p>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG, WEBP 형식 지원 (최대 10MB)
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="relative border-2 p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedImage.file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedImage.file.size)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
