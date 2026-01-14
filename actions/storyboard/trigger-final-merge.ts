"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { STORYBOARD_FINAL_MERGE_COST } from "@/lib/constants/credits";
import type {
  FinalMergeResult,
  FinalMergeWebhookPayload,
} from "@/types/storyboard";

const N8N_FINAL_MERGE_WEBHOOK_URL =
  process.env.N8N_STORYBOARD_MERGE_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/storyboard-merge";

interface TriggerFinalMergeInput {
  storyboardId: string;
  globalBgmUrl?: string;
  outputSettings?: {
    resolution: string;
    fps: number;
    format: string;
  };
}

/**
 * 최종 영상 병합 (FFmpeg via n8n webhook)
 * - 모든 씬 클립을 트랜지션과 함께 병합
 * - BGM 믹싱
 * - Supabase Storage에 업로드
 * - storyboards.final_video_url 업데이트
 */
export async function triggerFinalMerge(
  input: TriggerFinalMergeInput
): Promise<FinalMergeResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Verify storyboard ownership
    const { data: storyboard, error: fetchError } = await supabase
      .from("storyboards")
      .select("id, user_id, default_bgm_id")
      .eq("id", input.storyboardId)
      .single();

    if (fetchError || !storyboard) {
      console.error("Storyboard fetch error:", fetchError);
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (storyboard.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // Get all scenes with clips
    const { data: scenes, error: scenesError } = await supabase
      .from("storyboard_scenes")
      .select(`
        id,
        scene_order,
        generated_clip_url,
        duration_seconds,
        transition_type,
        transition_duration,
        dialogue,
        subtitle_style
      `)
      .eq("storyboard_id", input.storyboardId)
      .not("generated_clip_url", "is", null)
      .order("scene_order", { ascending: true });

    if (scenesError || !scenes || scenes.length === 0) {
      return { success: false, error: "병합할 클립이 없습니다." };
    }

    // Verify all scenes have clips
    const scenesWithoutClips = scenes.filter((s) => !s.generated_clip_url);
    if (scenesWithoutClips.length > 0) {
      return { success: false, error: "모든 씬의 클립을 먼저 생성해주세요." };
    }

    // Check credits
    const { data: userData } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    if ((userData?.credit_balance || 0) < STORYBOARD_FINAL_MERGE_COST) {
      return { success: false, error: "크레딧이 부족합니다." };
    }

    // Update storyboard status
    await supabase
      .from("storyboards")
      .update({
        status: "generating",
        progress_stage: "final_merge",
      })
      .eq("id", input.storyboardId);

    // Determine BGM URL (BGM 테이블이 없으므로 input에서만 받음)
    const globalBgmUrl = input.globalBgmUrl;

    // Prepare webhook payload
    const payload: FinalMergeWebhookPayload = {
      storyboard_id: input.storyboardId,
      user_id: clerkId,
      scenes: scenes.map((scene) => ({
        scene_id: scene.id,
        scene_order: scene.scene_order,
        clip_url: scene.generated_clip_url!,
        duration_seconds: scene.duration_seconds,
        transition_type: scene.transition_type,
        transition_duration: scene.transition_duration,
        dialogue: scene.dialogue || undefined,
        subtitle_style: scene.subtitle_style,
      })),
      global_bgm_url: globalBgmUrl,
      output_settings: input.outputSettings || {
        resolution: "1080p",
        fps: 30,
        format: "mp4",
      },
    };

    // Call n8n webhook
    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      // Long timeout for video merge (10 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const response = await fetch(N8N_FINAL_MERGE_WEBHOOK_URL, {
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

      if (!responseData.success || !responseData.final_video_url) {
        throw new Error("최종 병합 응답이 올바르지 않습니다.");
      }

      // Deduct credits
      await supabase.rpc("deduct_credits", {
        p_clerk_id: clerkId,
        p_amount: STORYBOARD_FINAL_MERGE_COST,
        p_description: "스토리보드 최종 영상 병합",
        p_reference_type: "storyboard",
        p_reference_id: input.storyboardId,
      });

      // Log credit transaction
      await supabase.from("credit_transactions").insert({
        user_id: clerkId,
        transaction_type: "usage",
        amount: -STORYBOARD_FINAL_MERGE_COST,
        description: "스토리보드 최종 영상 병합",
        reference_type: "storyboard",
        reference_id: input.storyboardId,
      });

      // Log success
      await supabase.from("storyboard_generation_logs").insert({
        storyboard_id: input.storyboardId,
        stage: "final_merge",
        status: "completed",
        source: "n8n",
        metadata: { scenesCount: scenes.length },
      });

      revalidatePath(`/storyboard/${input.storyboardId}`);
      revalidatePath("/storyboard");

      return {
        success: true,
        storyboardId: input.storyboardId,
        videoUrl: responseData.final_video_url,
      };
    } catch (fetchError) {
      console.error("final-merge webhook error:", fetchError);

      // Update storyboard status to failed
      await supabase
        .from("storyboards")
        .update({
          status: "failed",
          progress_stage: "failed",
          error_message: "최종 영상 병합에 실패했습니다.",
        })
        .eq("id", input.storyboardId);

      // Log failure
      await supabase.from("storyboard_generation_logs").insert({
        storyboard_id: input.storyboardId,
        stage: "final_merge",
        status: "failed",
        source: "n8n",
        error_code: "MERGE_FAILED",
        error_message:
          fetchError instanceof Error
            ? fetchError.message
            : "최종 병합 실패",
      });

      return {
        success: false,
        error: "최종 영상 병합에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Trigger final merge error:", error);
    return { success: false, error: "최종 영상 병합 중 오류가 발생했습니다." };
  }
}
