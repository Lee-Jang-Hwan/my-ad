/**
 * 광고문구 관련 타입 정의
 */

/**
 * 데이터베이스 ad_copies 테이블 레코드
 */
export interface AdCopy {
  id: string;
  ad_video_id: string;
  copy_index: number;
  copy_text: string;
  is_selected: boolean;
  created_at: string;
}

/**
 * n8n adcopy webhook 응답의 개별 광고문구
 */
export interface AdCopyItem {
  id: number;
  text: string;
}

/**
 * n8n sapp-studio-adcopy webhook 응답
 */
export interface AdCopyWebhookResponse {
  success: boolean;
  message: string;
  ad_video_id: string;
  product_name: string;
  ad_copies: AdCopyItem[];
  generated_at: string;
}

/**
 * generateAdCopies 액션 결과
 */
export interface GenerateAdCopiesResult {
  success: boolean;
  adVideoId?: string;
  adCopies?: AdCopy[];
  error?: string;
}

/**
 * selectAdCopy 액션 결과
 */
export interface SelectAdCopyResult {
  success: boolean;
  error?: string;
  insufficientCredits?: boolean;
}

/**
 * fetchAdCopies 액션 결과
 */
export interface FetchAdCopiesResult {
  success: boolean;
  adCopies?: AdCopy[];
  error?: string;
}

/**
 * 광고문구 선택 컴포넌트 Props
 */
export interface AdCopySelectionProps {
  adVideoId: string;
  productName: string;
  imagePreviewUrl?: string;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * 광고문구 카드 컴포넌트 Props
 */
export interface AdCopyCardProps {
  copy: AdCopy;
  isSelected: boolean;
  onSelect: (copyId: string) => void;
  disabled?: boolean;
}

/**
 * 광고문구 생성 상태
 */
export type AdCopyGenerationStatus =
  | 'idle'
  | 'generating'
  | 'generated'
  | 'selecting'
  | 'error';
