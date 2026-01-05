"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { SCENE_CLIP_GENERATION_COST } from "@/lib/constants/credits";
import type {
  GenerateSceneClipResult,
  SceneClipWebhookPayload,
} from "@/types/storyboard";

const N8N_SCENE_CLIP_WEBHOOK_URL =
  process.env.N8N_STORYBOARD_SCENE_CLIP_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/storyboard-scene-clip";

interface GenerateSceneClipInput {
  storyboardId: string;
  sceneId: string;
}

/**
 * 씬 클립 생성 (Runway via n8n webhook)
 * - 이미지를 비디오로 변환
 * - Supabase Storage에 업로드
 * - storyboard_scenes.generated_clip_url 업데이트
 */
export async function generateSceneClip(
  input: GenerateSceneClipInput
): Promise<GenerateSceneClipResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Get scene details
    const { data: scene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select(`
        id,
        storyboard_id,
        generated_image_url,
        camera_movement,
        duration_seconds,
        storyboards!inner(user_id, aspect_ratio)
      `)
      .eq("id", input.sceneId)
      .single();

    if (sceneError || !scene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = scene.storyboards as unknown as {
      user_id: string;
      aspect_ratio: string;
    };

    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    if (!scene.generated_image_url) {
      return { success: false, error: "먼저 이미지를 생성해주세요." };
    }

    // Check credits
    const { data: userData } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    if ((userData?.credit_balance || 0) < SCENE_CLIP_GENERATION_COST) {
      return { success: false, error: "크레딧이 부족합니다." };
    }

    // Update scene status
    await supabase
      .from("storyboard_scenes")
      .update({ generation_status: "generating_clip" })
      .eq("id", input.sceneId);

    // Prepare webhook payload
    const payload: SceneClipWebhookPayload = {
      storyboard_id: input.storyboardId,
      scene_id: input.sceneId,
      user_id: clerkId,
      source_image_url: scene.generated_image_url,
      camera_movement: scene.camera_movement,
      duration_seconds: scene.duration_seconds,
      aspect_ratio: storyboardData.aspect_ratio,
    };

    // Call n8n webhook
    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      // Longer timeout for video generation (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const response = await fetch(N8N_SCENE_CLIP_WEBHOOK_URL, {
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

      if (!responseData.success || !responseData.clip_url) {
        throw new Error("클립 생성 응답이 올바르지 않습니다.");
      }

      // Deduct credits
      await supabase.rpc("deduct_credits", {
        p_clerk_id: clerkId,
        p_amount: SCENE_CLIP_GENERATION_COST,
        p_description: "씬 클립 생성",
        p_reference_type: "storyboard_scene",
        p_reference_id: input.sceneId,
      });

      // Log credit transaction
      await supabase.from("credit_transactions").insert({
        user_id: clerkId,
        transaction_type: "usage",
        amount: -SCENE_CLIP_GENERATION_COST,
        description: "씬 클립 생성",
        reference_type: "storyboard_scene",
        reference_id: input.sceneId,
      });

      revalidatePath(`/storyboard/${input.storyboardId}`);

      return {
        success: true,
        sceneId: input.sceneId,
        clipUrl: responseData.clip_url,
      };
    } catch (fetchError) {
      console.error("scene-clip webhook error:", fetchError);

      // Update scene status to failed
      await supabase
        .from("storyboard_scenes")
        .update({
          generation_status: "failed",
          generation_error: "클립 생성에 실패했습니다.",
        })
        .eq("id", input.sceneId);

      return {
        success: false,
        error: "클립 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Generate scene clip error:", error);
    return { success: false, error: "클립 생성 중 오류가 발생했습니다." };
  }
}

/**
 * 모든 씬의 클립 일괄 생성
 */
export async function generateAllSceneClips(
  storyboardId: string
): Promise<{ success: boolean; results?: Array<GenerateSceneClipResult>; error?: string }> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Get all scenes with images but no clips
    const { data: scenes, error } = await supabase
      .from("storyboard_scenes")
      .select("id, generated_image_url")
      .eq("storyboard_id", storyboardId)
      .not("generated_image_url", "is", null)
      .is("generated_clip_url", null)
      .order("scene_order", { ascending: true });

    if (error || !scenes) {
      return { success: false, error: "씬 목록을 불러올 수 없습니다." };
    }

    // Check credits
    const { data: userData } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    const requiredCredits = scenes.length * SCENE_CLIP_GENERATION_COST;
    if ((userData?.credit_balance || 0) < requiredCredits) {
      return { success: false, error: `크레딧이 부족합니다. (필요: ${requiredCredits})` };
    }

    // Generate clips for each scene
    const results: GenerateSceneClipResult[] = [];
    for (const scene of scenes) {
      const result = await generateSceneClip({
        storyboardId,
        sceneId: scene.id,
      });
      results.push(result);

      // Delay between requests (video generation takes longer)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { success: true, results };
  } catch (error) {
    console.error("Generate all scene clips error:", error);
    return { success: false, error: "클립 일괄 생성 중 오류가 발생했습니다." };
  }
}
