// Storyboard CRUD
export { createStoryboard } from "./create-storyboard";
export { fetchStoryboard, fetchStoryboardWithScenes, fetchStoryboardScenes } from "./fetch-storyboard";
export { fetchUserStoryboards, fetchUserStoryboardsCount } from "./fetch-user-storyboards";
export { updateStoryboard, updateStoryboardStatus } from "./update-storyboard";
export { deleteStoryboard } from "./delete-storyboard";

// Scene CRUD
export { createScene, createMultipleScenes } from "./create-scene";
export { updateScene, updateSceneGenerationStatus } from "./update-scene";
export { deleteScene, deleteMultipleScenes } from "./delete-scene";
export { reorderScenes, moveScene } from "./reorder-scenes";
export { duplicateScene } from "./duplicate-scene";

// n8n Generation Actions
export { generateAIDraft } from "./generate-ai-draft";
export { generateSceneImage, generateAllSceneImages } from "./generate-scene-image";
export { generateSceneClip, generateAllSceneClips } from "./generate-scene-clip";
export { triggerFinalMerge } from "./trigger-final-merge";

// Media Management
export { clearSceneMedia, clearSceneImage, clearSceneClip, clearSceneAllMedia } from "./clear-scene-media";

// Image Upload
export { uploadReferenceImage, deleteReferenceImage } from "./upload-reference-image";
