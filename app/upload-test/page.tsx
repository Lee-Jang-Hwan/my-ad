"use client";

import { useState } from "react";
import { ImageDropzone } from "@/components/upload/image-dropzone";
import { Card } from "@/components/ui/card";
import type { ImageFile } from "@/types/upload";

export default function UploadTestPage() {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleImageSelected = (image: ImageFile) => {
    addLog(`이미지 선택됨: ${image.file.name} (${image.file.size} bytes)`);
    setSelectedImage(image);
  };

  const handleImageRemoved = () => {
    addLog("이미지 제거됨");
    setSelectedImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">파일 업로드 테스트</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">이미지 업로드</h2>
          <ImageDropzone
            selectedImage={selectedImage}
            onImageSelected={handleImageSelected}
            onImageRemoved={handleImageRemoved}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">상태 정보</h2>
          <div className="space-y-2">
            <p>
              <strong>선택된 이미지:</strong>{" "}
              {selectedImage ? selectedImage.file.name : "없음"}
            </p>
            {selectedImage && (
              <>
                <p>
                  <strong>파일 크기:</strong> {selectedImage.file.size} bytes
                </p>
                <p>
                  <strong>파일 타입:</strong> {selectedImage.file.type}
                </p>
                <p>
                  <strong>미리보기 URL:</strong> {selectedImage.preview}
                </p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">로그</h2>
          <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">로그가 없습니다...</p>
            ) : (
              logs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
