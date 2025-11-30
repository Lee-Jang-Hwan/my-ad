/**
 * 이미지 생성 관련 타입 정의
 */

/**
 * 데이터베이스 ad_images 테이블 레코드
 */
export interface AdImage {
  id: string;
  user_id: string;
  product_image_id: string | null;
  product_info_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress_stage: ImageGenerationStage;
  selected_ad_copy: string | null;
  error_message: string | null;
  is_public: boolean;
  created_at: string;
  completed_at: string | null;
}

/**
 * 데이터베이스 ad_image_copies 테이블 레코드
 */
export interface AdImageCopy {
  id: string;
  ad_image_id: string;
  copy_index: number;
  copy_text: string;
  is_selected: boolean;
  created_at: string;
}

/**
 * 이미지 생성 진행 단계
 */
export type ImageGenerationStage =
  | "init"
  | "ad_copy_generation"
  | "ad_copy_selection"
  | "image_generation"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * n8n adcopy webhook 응답의 개별 광고문구
 */
export interface ImageAdCopyItem {
  id: number;
  text: string;
}

/**
 * n8n sapp-studio-adcopy webhook 응답 (이미지용)
 */
export interface ImageAdCopyWebhookResponse {
  success: boolean;
  message: string;
  ad_video_id: string; // n8n에서는 ad_video_id로 반환
  product_name: string;
  ad_copies: ImageAdCopyItem[];
  generated_at: string;
}

/**
 * generateImageAdCopies 액션 결과
 */
export interface GenerateImageAdCopiesResult {
  success: boolean;
  adImageId?: string;
  adCopies?: AdImageCopy[];
  error?: string;
}

/**
 * selectImageAdCopy 액션 결과
 */
export interface SelectImageAdCopyResult {
  success: boolean;
  error?: string;
  insufficientCredits?: boolean;
}

/**
 * fetchImageAdCopies 액션 결과
 */
export interface FetchImageAdCopiesResult {
  success: boolean;
  adCopies?: AdImageCopy[];
  error?: string;
}

/**
 * 이미지 광고문구 선택 컴포넌트 Props
 */
export interface ImageAdCopySelectionProps {
  adImageId: string;
  productName: string;
  imagePreviewUrl?: string;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * 이미지 광고문구 카드 컴포넌트 Props
 */
export interface ImageAdCopyCardProps {
  copy: AdImageCopy;
  isSelected: boolean;
  onSelect: (copyId: string) => void;
  disabled?: boolean;
}

/**
 * 광고문구 생성 상태
 */
export type ImageAdCopyGenerationStatus =
  | "idle"
  | "generating"
  | "generated"
  | "selecting"
  | "error";

/**
 * 이미지 상세 정보 (product_info와 조인)
 */
export interface ImageWithProductName extends AdImage {
  product_name?: string;
}

/**
 * 실시간 이미지 구독 상태
 */
export interface RealtimeImageState {
  image: AdImage | null;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  isFailed: boolean;
  currentStage: ImageGenerationStage;
  progressPercent: number;
}

/**
 * 이미지 생성 진행 정보
 */
export interface ImageGenerationProgress {
  currentStageIndex: number;
  totalStages: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
  elapsedTime: number;
}

/**
 * 이미지 생성 진행 컴포넌트 Props
 */
export interface ImageGenerationProgressProps {
  initialImage: AdImage;
}

/**
 * 이미지 단계 표시 컴포넌트 Props
 */
export interface ImageStepIndicatorProps {
  currentStage: ImageGenerationStage;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
}
