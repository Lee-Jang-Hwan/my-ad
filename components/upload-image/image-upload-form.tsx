"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, ArrowLeft, ArrowRight, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageDropzone } from "@/components/upload/image-dropzone";
import { ImagePreview } from "@/components/upload/image-preview";
import { ProductForm } from "@/components/upload/product-form";
import { ImageAdCopySelection } from "./image-ad-copy-selection";
import { CreditDisplay } from "@/components/credit/credit-display";
import { uploadImage } from "@/actions/upload-image";
import { saveProductInfo } from "@/actions/save-product-info";
import { generateImageAdCopies } from "@/actions/image/generate-image-ad-copies";
import { uploadFormSchema, type UploadFormValues } from "@/lib/validation";
import type { ImageFile } from "@/types/upload";
import { IMAGE_GENERATION_COST } from "@/lib/constants/credits";

/**
 * 업로드 워크플로우 단계
 */
type UploadStep = "image" | "product" | "ad-copy" | "generating";

/**
 * 4단계 이미지 업로드 폼 컴포넌트
 * Step 1: 이미지 업로드
 * Step 2: 상품명 입력
 * Step 3: 광고문구 선택
 * Step 4: 이미지 생성 진행
 */
export function ImageUploadForm() {
  const [currentStep, setCurrentStep] = useState<UploadStep>("image");
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 업로드 결과 저장
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [productInfoId, setProductInfoId] = useState<string | null>(null);
  const [adImageId, setAdImageId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      productName: "",
    },
  });

  // Step 1: 이미지 업로드 후 다음 단계로
  const handleImageNext = async () => {
    if (!selectedImage) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage.file);

      const uploadResult = await uploadImage(formData);

      if (!uploadResult.success || !uploadResult.imageId) {
        setError(uploadResult.error || "이미지 업로드에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      setUploadedImageId(uploadResult.imageId);
      setImagePreviewUrl(selectedImage.preview);
      setCurrentStep("product");
    } catch (err) {
      console.error("Upload error:", err);
      setError("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: 상품 정보 저장 후 광고문구 생성 및 다음 단계로
  const handleProductSubmit = async (values: UploadFormValues) => {
    if (!uploadedImageId) {
      setError("이미지를 먼저 업로드해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 상품 정보 저장
      const productResult = await saveProductInfo(
        values.productName,
        uploadedImageId
      );

      if (!productResult.success || !productResult.productInfoId) {
        setError(productResult.error || "상품 정보 저장에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      setProductInfoId(productResult.productInfoId);

      // 광고문구 생성 (이미지용)
      const adCopyResult = await generateImageAdCopies(
        uploadedImageId,
        productResult.productInfoId
      );

      if (!adCopyResult.success || !adCopyResult.adImageId) {
        setError(adCopyResult.error || "광고문구 생성에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      setAdImageId(adCopyResult.adImageId);
      setCurrentStep("ad-copy");
    } catch (err) {
      console.error("Product submit error:", err);
      setError("상품 정보 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 광고문구 선택 완료 콜백
  const handleAdCopyComplete = () => {
    setCurrentStep("generating");
    // select-image-ad-copy.ts에서 이미 리다이렉트 처리
  };

  // 광고문구 선택 취소 (이전 단계로)
  const handleAdCopyCancel = () => {
    setCurrentStep("product");
  };

  // 이전 단계로 돌아가기
  const handleBack = () => {
    if (currentStep === "product") {
      setCurrentStep("image");
    } else if (currentStep === "ad-copy") {
      setCurrentStep("product");
    }
    setError(null);
  };

  // 이미지 선택 핸들러
  const handleImageSelected = (image: ImageFile) => {
    setSelectedImage(image);
    setError(null);
  };

  const handleImageRemoved = () => {
    setSelectedImage(null);
  };

  // 현재 단계별 컨텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case "image":
        return (
          <>
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

            {/* Image Preview */}
            {selectedImage && <ImagePreview image={selectedImage} />}

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                size="lg"
                disabled={!selectedImage || isSubmitting}
                onClick={handleImageNext}
                className="min-w-[150px] gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        );

      case "product":
        return (
          <>
            {/* Image Preview (small) */}
            {selectedImage && (
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden border border-border">
                    <img
                      src={selectedImage.preview}
                      alt="상품 이미지"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">업로드된 이미지</p>
                    <p className="font-medium">{selectedImage.file.name}</p>
                  </div>
                </div>
              </Card>
            )}

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

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={!form.formState.isValid || isSubmitting}
                onClick={form.handleSubmit(handleProductSubmit)}
                className="min-w-[180px] gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    광고문구 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    광고문구 생성
                  </>
                )}
              </Button>
            </div>
          </>
        );

      case "ad-copy":
        return (
          <Card className="p-6">
            {adImageId && (
              <ImageAdCopySelection
                adImageId={adImageId}
                productName={form.getValues("productName")}
                imagePreviewUrl={imagePreviewUrl || undefined}
                onComplete={handleAdCopyComplete}
                onCancel={handleAdCopyCancel}
              />
            )}
          </Card>
        );

      case "generating":
        return (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium">이미지 생성을 시작합니다...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  생성 페이지로 이동합니다.
                </p>
              </div>
            </div>
          </Card>
        );
    }
  };

  // 단계 표시기
  const StepIndicator = () => {
    const steps = [
      { key: "image", label: "이미지 업로드", number: 1 },
      { key: "product", label: "상품 정보", number: 2 },
      { key: "ad-copy", label: "광고문구 선택", number: 3 },
      { key: "generating", label: "이미지 생성", number: 4 },
    ];

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-xs mt-1 hidden sm:block ${
                  index <= currentIndex
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                  index < currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <ImagePlus className="w-8 h-8" />
            광고이미지 만들기
          </h1>
          <p className="text-lg text-muted-foreground">
            이미지 생성에 {IMAGE_GENERATION_COST} 크레딧이 차감 됩니다.
          </p>
        </div>
        <CreditDisplay className="md:w-80" />
      </div>

      {/* Step Indicator */}
      <StepIndicator />

      <div className="space-y-6">
        {renderStepContent()}

        {/* Error Message */}
        {error && (
          <Card className="p-4 border-destructive bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-blue-700 dark:text-blue-300">
              디버그 정보 (개발 모드)
            </summary>
            <div className="mt-2 space-y-1 text-xs font-mono">
              <p>
                <strong>현재 단계:</strong> {currentStep}
              </p>
              <p>
                <strong>선택된 이미지:</strong>{" "}
                {selectedImage ? selectedImage.file.name : "없음"}
              </p>
              <p>
                <strong>업로드된 이미지 ID:</strong> {uploadedImageId || "없음"}
              </p>
              <p>
                <strong>상품 정보 ID:</strong> {productInfoId || "없음"}
              </p>
              <p>
                <strong>광고 이미지 ID:</strong> {adImageId || "없음"}
              </p>
              <p>
                <strong>폼 유효성:</strong>{" "}
                {form.formState.isValid ? "유효" : "무효"}
              </p>
            </div>
          </details>
        </Card>
      )}
    </div>
  );
}
