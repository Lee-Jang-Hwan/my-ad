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
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      onImageSelected({ file, preview });
    },
    [onImageSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
