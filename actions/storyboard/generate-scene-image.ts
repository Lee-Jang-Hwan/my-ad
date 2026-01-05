"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { SCENE_IMAGE_GENERATION_COST } from "@/lib/constants/credits";
import type {
  GenerateSceneImageResult,
  SceneImageWebhookPayload,
} from "@/types/storyboard";

const N8N_SCENE_IMAGE_WEBHOOK_URL =
  process.env.N8N_STORYBOARD_SCENE_IMAGE_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/storyboard-scene-image";

interface GenerateSceneImageInput {
  storyboardId: string;
  sceneId: string;
  visualPrompt: string;
  referenceImageUrl?: string;
}

/**
 * 씬 이미지 생성 (DALL-E via n8n webhook)
 * - visual_prompt로 이미지 생성
 * - Supabase Storage에 업로드
 * - storyboard_scenes.generated_image_url 업데이트
 */
export async function generateSceneImage(
  input: GenerateSceneImageInput
): Promise<GenerateSceneImageResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Verify scene ownership
    const { data: scene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select("id, storyboard_id, storyboards!inner(user_id, aspect_ratio, color_grade)")
      .eq("id", input.sceneId)
      .single();

    if (sceneError || !scene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = scene.storyboards as unknown as {
      user_id: string;
      aspect_ratio: string;
      color_grade: string;
    };

    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // Check credits
    const { data: userData } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    if ((userData?.credit_balance || 0) < SCENE_IMAGE_GENERATION_COST) {
      return { success: false, error: "크레딧이 부족합니다." };
    }

    // Update scene status
    await supabase
      .from("storyboard_scenes")
      .update({ generation_status: "generating_image" })
      .eq("id", input.sceneId);

    // Prepare webhook payload
    const payload: SceneImageWebhookPayload = {
      storyboard_id: input.storyboardId,
      scene_id: input.sceneId,
      user_id: clerkId,
      visual_prompt: input.visualPrompt,
      reference_image_url: input.referenceImageUrl,
      aspect_ratio: storyboardData.aspect_ratio,
      style_settings: {
        color_grade: storyboardData.color_grade,
      },
    };

    // Call n8n webhook
    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2분 타임아웃

      const response = await fetch(N8N_SCENE_IMAGE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      const responseData = await response.json();

      if (!responseData.success || !responseData.image_url) {
        throw new Error("이미지 생성 응답이 올바르지 않습니다.");
      }

      // Deduct credits
      await supabase.rpc("deduct_credits", {
        p_clerk_id: clerkId,
        p_amount: SCENE_IMAGE_GENERATION_COST,
        p_description: "씬 이미지 생성",
        p_reference_type: "storyboard_scene",
        p_reference_id: input.sceneId,
      });

      // Log credit transaction
      await supabase.from("credit_transactions").insert({
        user_id: clerkId,
        transaction_type: "usage",
        amount: -SCENE_IMAGE_GENERATION_COST,
        description: "씬 이미지 생성",
        reference_type: "storyboard_scene",
        reference_id: input.sceneId,
      });

      revalidatePath(`/storyboard/${input.storyboardId}`);

      return {
        success: true,
        sceneId: input.sceneId,
        imageUrl: responseData.image_url,
      };
    } catch (fetchError) {
      console.error("scene-image webhook error:", fetchError);

      // Update scene status to failed
      await supabase
        .from("storyboard_scenes")
        .update({
          generation_status: "failed",
          generation_error: "이미지 생성에 실패했습니다.",
        })
        .eq("id", input.sceneId);

      return {
        success: false,
        error: "이미지 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Generate scene image error:", error);
    return { success: false, error: "이미지 생성 중 오류가 발생했습니다." };
  }
}

/**
 * 모든 씬의 이미지 일괄 생성
 */
export async function generateAllSceneImages(
  storyboardId: string
): Promise<{ success: boolean; results?: Array<GenerateSceneImageResult>; error?: string }> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Get all pending scenes
    const { data: scenes, error } = await supabase
      .from("storyboard_scenes")
      .select("id, visual_prompt, reference_image_url")
      .eq("storyboard_id", storyboardId)
      .is("generated_image_url", null)
      .order("scene_order", { ascending: true });

    if (error || !scenes) {
      return { success: false, error: "씬 목록을 불러올 수 없습니다." };
    }

    // Check if enough credits
    const { data: userData } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    const requiredCredits = scenes.length * SCENE_IMAGE_GENERATION_COST;
    if ((userData?.credit_balance || 0) < requiredCredits) {
      return { success: false, error: `크레딧이 부족합니다. (필요: ${requiredCredits})` };
    }

    // Generate images for each scene
    const results: GenerateSceneImageResult[] = [];
    for (const scene of scenes) {
      if (!scene.visual_prompt) continue;

      const result = await generateSceneImage({
        storyboardId,
        sceneId: scene.id,
        visualPrompt: scene.visual_prompt,
        referenceImageUrl: scene.reference_image_url || undefined,
      });
      results.push(result);

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return { success: true, results };
  } catch (error) {
    console.error("Generate all scene images error:", error);
    return { success: false, error: "이미지 일괄 생성 중 오류가 발생했습니다." };
  }
}
