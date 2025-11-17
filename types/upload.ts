// Upload page type definitions

export interface ImageFile {
  file: File;
  preview: string;
}

export interface UploadFormData {
  productName: string;
  image: ImageFile | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UploadImageResult {
  success: boolean;
  imageId?: string;
  storagePath?: string;
  error?: string;
}

export interface SaveProductInfoResult {
  success: boolean;
  productInfoId?: string;
  error?: string;
}

export interface TriggerN8nResult {
  success: boolean;
  adVideoId?: string;
  executionId?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  adVideoId?: string;
  error?: string;
}
