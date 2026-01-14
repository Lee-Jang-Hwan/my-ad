// 스토리보드 관련 타입 정의

// ============================================
// 상태 및 열거형 타입
// ============================================

export type StoryboardStatus = "draft" | "generating" | "completed" | "failed";

export type StoryboardProgressStage =
  | "init"
  | "ai_draft_generation"
  | "user_editing"
  | "scene_image_generation"
  | "scene_clip_generation"
  | "final_merge"
  | "completed"
  | "failed";

export type AspectRatio = "16:9" | "9:16";

export type SceneDuration = 4 | 8 | 12;

export type CameraAngle =
  | "eye_level"
  | "high_angle"
  | "low_angle"
  | "bird_eye"
  | "dutch_angle"
  | "pov"
  | "close_up"
  | "wide_shot"
  | "medium_shot";

export type CameraMovement =
  | "static"
  | "pan_left"
  | "pan_right"
  | "tilt_up"
  | "tilt_down"
  | "zoom_in"
  | "zoom_out"
  | "dolly_in"
  | "dolly_out"
  | "tracking";

export type TransitionType =
  | "cut"
  | "fade"
  | "dissolve"
  | "wipe_left"
  | "wipe_right"
  | "zoom"
  | "slide"
  | "blur";

export type DialogueType = "narration" | "character" | "caption";

export type SceneGenerationStatus =
  | "pending"
  | "generating_image"
  | "generating_clip"
  | "completed"
  | "failed";

export type BgmCategory =
  | "upbeat"
  | "calm"
  | "dramatic"
  | "corporate"
  | "emotional"
  | "action"
  | "ambient";

export type SfxCategory =
  | "transition"
  | "impact"
  | "ambient"
  | "ui"
  | "nature"
  | "voice";

export type LogStatus = "started" | "completed" | "failed";
export type LogSource = "app" | "n8n" | "supabase";

// ============================================
// 인터페이스 타입
// ============================================

export interface SubtitleStyle {
  position: "top" | "center" | "bottom";
  fontSize: "small" | "medium" | "large";
  fontColor: string;
  bgColor: string;
  fontFamily?: string;
}

export interface BrandGuidelines {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
}

// ============================================
// 데이터베이스 테이블 타입
// ============================================

export interface Storyboard {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  aspect_ratio: AspectRatio;
  target_duration: number;
  default_scene_duration: SceneDuration;
  color_grade: string;
  default_bgm_id: string | null;
  default_voice_style: string;
  brand_guidelines: BrandGuidelines | null;
  product_reference_image_url: string | null;
  status: StoryboardStatus;
  progress_stage: StoryboardProgressStage;
  error_message: string | null;
  total_scenes: number;
  ai_generated: boolean;
  final_video_url: string | null;
  final_thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface StoryboardScene {
  id: string;
  storyboard_id: string;
  scene_order: number;
  scene_name: string | null;
  scene_description: string;
  dialogue: string | null;
  dialogue_type: DialogueType;
  visual_prompt: string | null;
  reference_image_url: string | null;
  camera_angle: CameraAngle;
  camera_movement: CameraMovement;
  duration_seconds: number;
  transition_type: TransitionType;
  transition_duration: number;
  bgm_id: string | null;
  bgm_volume: number;
  sfx_id: string | null;
  subtitle_style: SubtitleStyle;
  generated_image_url: string | null;
  generated_clip_url: string | null;
  generation_status: SceneGenerationStatus;
  generation_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryboardBgm {
  id: string;
  name: string;
  description: string | null;
  category: BgmCategory | null;
  mood: string[] | null;
  audio_url: string;
  duration_seconds: number | null;
  bpm: number | null;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
}

export interface StoryboardSfx {
  id: string;
  name: string;
  category: SfxCategory | null;
  audio_url: string;
  duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
}

export interface StoryboardGenerationLog {
  id: string;
  storyboard_id: string;
  scene_id: string | null;
  stage: string;
  status: LogStatus;
  source: LogSource;
  message: string | null;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// 확장된 타입 (조인 데이터 포함)
// ============================================

export interface StoryboardWithScenes extends Storyboard {
  scenes: StoryboardScene[];
}

export interface StoryboardWithDetails extends Storyboard {
  scenes: StoryboardScene[];
  default_bgm: StoryboardBgm | null;
}

// ============================================
// 폼 및 입력 타입
// ============================================

export interface CreateStoryboardInput {
  title: string;
  description?: string;
  aspect_ratio?: AspectRatio;
  target_duration?: number;
  default_scene_duration?: SceneDuration;
  color_grade?: string;
  product_reference_image_url?: string;
}

export interface UpdateStoryboardInput {
  title?: string;
  description?: string;
  aspect_ratio?: AspectRatio;
  target_duration?: number;
  color_grade?: string;
  default_bgm_id?: string | null;
  default_voice_style?: string;
  brand_guidelines?: BrandGuidelines | null;
}

export interface CreateSceneInput {
  storyboard_id: string;
  scene_order: number;
  scene_name?: string;
  scene_description: string;
  dialogue?: string;
  dialogue_type?: DialogueType;
  visual_prompt?: string;
  camera_angle?: CameraAngle;
  camera_movement?: CameraMovement;
  duration_seconds?: number;
  transition_type?: TransitionType;
  transition_duration?: number;
}

export interface UpdateSceneInput {
  scene_name?: string;
  scene_description?: string;
  dialogue?: string;
  dialogue_type?: DialogueType;
  visual_prompt?: string;
  reference_image_url?: string | null;
  camera_angle?: CameraAngle;
  camera_movement?: CameraMovement;
  duration_seconds?: number;
  transition_type?: TransitionType;
  transition_duration?: number;
  bgm_id?: string | null;
  bgm_volume?: number;
  sfx_id?: string | null;
  subtitle_style?: SubtitleStyle;
}

// ============================================
// API 응답 타입
// ============================================

export interface StoryboardActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerateAIDraftResult {
  success: boolean;
  storyboardId?: string;
  scenesCount?: number;
  error?: string;
}

export interface GenerateSceneImageResult {
  success: boolean;
  sceneId?: string;
  imageUrl?: string;
  error?: string;
}

export interface GenerateSceneClipResult {
  success: boolean;
  sceneId?: string;
  clipUrl?: string;
  accepted?: boolean;  // 비동기 처리 시작됨
  message?: string;    // 사용자에게 보여줄 메시지
  error?: string;
}

export interface FinalMergeResult {
  success: boolean;
  storyboardId?: string;
  videoUrl?: string;
  error?: string;
}

// ============================================
// n8n 웹훅 페이로드 타입
// ============================================

export interface StoryboardDraftWebhookPayload {
  storyboard_id: string;
  user_id: string;
  product_name: string;
  product_description?: string;
  reference_image_url?: string;
  target_duration: number;
  scene_duration: number;
  scene_count: number;
  aspect_ratio: string;
  style_preference?: string;
}

export interface SceneImageWebhookPayload {
  storyboard_id: string;
  scene_id: string;
  user_id: string;
  visual_prompt: string;
  reference_image_url?: string;
  product_reference_image_url?: string;
  aspect_ratio: string;
  style_settings?: {
    color_grade: string;
    lighting?: string;
  };
}

export interface SceneClipWebhookPayload {
  storyboard_id: string;
  scene_id: string;
  user_id: string;
  source_image_url: string;
  visual_prompt?: string;
  product_reference_image_url?: string;
  camera_movement: string;
  duration_seconds: number;
  aspect_ratio: string;
  motion_intensity?: number;
}

export interface FinalMergeWebhookPayload {
  storyboard_id: string;
  user_id: string;
  scenes: Array<{
    scene_id: string;
    scene_order: number;
    clip_url: string;
    duration_seconds: number;
    transition_type: string;
    transition_duration: number;
    dialogue?: string;
    subtitle_style: SubtitleStyle;
  }>;
  global_bgm_url?: string;
  output_settings: {
    resolution: string;
    fps: number;
    format: string;
  };
}

// ============================================
// 컴포넌트 Props 타입
// ============================================

export interface StoryboardCardProps {
  storyboard: Storyboard;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface StoryboardEditorProps {
  storyboard: Storyboard;
  scenes: StoryboardScene[];
  onSave?: () => void;
}

export interface SceneCardProps {
  scene: StoryboardScene;
  isSelected: boolean;
  onSelect: (sceneId: string) => void;
  onUpdate: (sceneId: string, updates: UpdateSceneInput) => void;
  onDelete: (sceneId: string) => void;
  onDuplicate: (sceneId: string) => void;
  onReorder?: (sceneId: string, newOrder: number) => void;
}

export interface TimelineViewProps {
  scenes: StoryboardScene[];
  currentTime: number;
  totalDuration: number;
  selectedSceneId: string | null;
  onTimeChange: (time: number) => void;
  onSceneSelect: (sceneId: string) => void;
  onSceneReorder: (sceneId: string, newOrder: number) => void;
}

export interface PropertyPanelProps {
  selectedScene: StoryboardScene | null;
  bgmLibrary: StoryboardBgm[];
  sfxLibrary: StoryboardSfx[];
  onUpdate: (updates: UpdateSceneInput) => void;
}

export interface GenerationProgressProps {
  storyboard: Storyboard;
  scenes: StoryboardScene[];
  onComplete?: () => void;
  onError?: (error: string) => void;
}

// ============================================
// 유틸리티 타입
// ============================================

export type StoryboardListItem = Pick<
  Storyboard,
  | "id"
  | "title"
  | "description"
  | "status"
  | "progress_stage"
  | "total_scenes"
  | "final_thumbnail_url"
  | "final_video_url"
  | "created_at"
  | "updated_at"
>;

export type SceneListItem = Pick<
  StoryboardScene,
  | "id"
  | "scene_order"
  | "scene_name"
  | "scene_description"
  | "duration_seconds"
  | "generated_image_url"
  | "generation_status"
>;

// ============================================
// 상수 (라벨 매핑)
// ============================================

export const CAMERA_ANGLE_LABELS: Record<CameraAngle, string> = {
  eye_level: "아이레벨 (정면)",
  high_angle: "하이앵글 (위에서)",
  low_angle: "로우앵글 (아래에서)",
  bird_eye: "버드아이 (조감)",
  dutch_angle: "더치앵글 (기울임)",
  pov: "POV (1인칭)",
  close_up: "클로즈업",
  wide_shot: "와이드샷",
  medium_shot: "미디엄샷",
};

export const CAMERA_MOVEMENT_LABELS: Record<CameraMovement, string> = {
  static: "고정",
  pan_left: "팬 좌측",
  pan_right: "팬 우측",
  tilt_up: "틸트 업",
  tilt_down: "틸트 다운",
  zoom_in: "줌 인",
  zoom_out: "줌 아웃",
  dolly_in: "돌리 인",
  dolly_out: "돌리 아웃",
  tracking: "트래킹",
};

export const TRANSITION_TYPE_LABELS: Record<TransitionType, string> = {
  cut: "컷 (즉시 전환)",
  fade: "페이드",
  dissolve: "디졸브",
  wipe_left: "와이프 좌측",
  wipe_right: "와이프 우측",
  zoom: "줌 전환",
  slide: "슬라이드",
  blur: "블러",
};

export const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
  "16:9": "가로형 (16:9)",
  "9:16": "세로형 (9:16)",
};

export const SCENE_DURATION_LABELS: Record<SceneDuration, string> = {
  4: "4초",
  8: "8초",
  12: "12초",
};

export const DIALOGUE_TYPE_LABELS: Record<DialogueType, string> = {
  narration: "나레이션",
  character: "대사",
  caption: "자막",
};

export const STORYBOARD_STATUS_LABELS: Record<StoryboardStatus, string> = {
  draft: "편집 중",
  generating: "생성 중",
  completed: "완료",
  failed: "실패",
};

export const SCENE_GENERATION_STATUS_LABELS: Record<SceneGenerationStatus, string> = {
  pending: "대기 중",
  generating_image: "이미지 생성 중",
  generating_clip: "클립 생성 중",
  completed: "완료",
  failed: "실패",
};
