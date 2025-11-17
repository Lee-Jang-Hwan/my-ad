"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageDropzone } from "./image-dropzone";
import { ImagePreview } from "./image-preview";
import { ProductForm } from "./product-form";
import { uploadImage } from "@/actions/upload-image";
import { saveProductInfo } from "@/actions/save-product-info";
import { triggerN8nWorkflow } from "@/actions/trigger-n8n";
import { uploadFormSchema, type UploadFormValues } from "@/lib/validation";
import type { ImageFile } from "@/types/upload";

export function UploadForm() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      productName: "",
    },
  });

  const onSubmit = async (values: UploadFormValues) => {
    if (!selectedImage) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload image to storage
      const formData = new FormData();
      formData.append("image", selectedImage.file);

      const uploadResult = await uploadImage(formData);

      if (!uploadResult.success || !uploadResult.imageId) {
        setError(uploadResult.error || "이미지 업로드에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Save product info
      const productResult = await saveProductInfo(
        values.productName,
        uploadResult.imageId
      );

      if (!productResult.success || !productResult.productInfoId) {
        setError(productResult.error || "상품 정보 저장에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      // Step 3: Trigger n8n workflow
      const n8nResult = await triggerN8nWorkflow(
        uploadResult.imageId,
        productResult.productInfoId
      );

      if (!n8nResult.success || !n8nResult.adVideoId) {
        setError(n8nResult.error || "워크플로우 실행에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      // Success! Redirect to generation page
      router.push(`/generation/${n8nResult.adVideoId}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError("업로드 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  const handleImageSelected = (image: ImageFile) => {
    setSelectedImage(image);
    setError(null);
  };

  const handleImageRemoved = () => {
    setSelectedImage(null);
  };

  const isFormValid = selectedImage !== null && form.formState.isValid;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          홍보영상 만들기
        </h1>
        <p className="text-lg text-muted-foreground">
          이미지와 상품명을 입력하면 AI가 자동으로 홍보영상을 생성합니다
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">1. 이미지 업로드</h2>
              <p className="text-sm text-muted-foreground mb-4">
                상품 이미지를 업로드해주세요
              </p>
            </div>
            <ImageDropzone
              selectedImage={selectedImage}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              disabled={isSubmitting}
            />
          </div>
        </Card>

        {/* Image Preview (only shown when image is selected) */}
        {selectedImage && <ImagePreview image={selectedImage} />}

        {/* Product Info Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">2. 상품 정보</h2>
              <p className="text-sm text-muted-foreground mb-4">
                상품명을 입력해주세요
              </p>
            </div>
            <ProductForm form={form} />
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 border-destructive bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={!isFormValid || isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-4 h-4" />
                <span>영상 생성 시작</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
