"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidateUserVideos } from "@/lib/cache";
import type { TriggerN8nResult } from "@/types/upload";

export async function triggerN8nWorkflow(
  imageId: string,
  productInfoId: string
): Promise<TriggerN8nResult> {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient();

    // Create ad_videos record with status "pending" and progress_stage "init"
    const { data: videoData, error: videoError } = await supabase
      .from("ad_videos")
      .insert({
        user_id: clerkId,
        product_image_id: imageId,
        product_info_id: productInfoId,
        status: "pending",
        progress_stage: "init",
      })
      .select("id")
      .single();

    if (videoError || !videoData) {
      console.error("Database insert error:", videoError);
      return {
        success: false,
        error: "영상 생성 요청 생성에 실패했습니다.",
      };
    }

    // Get active n8n workflow webhook URL
    const { data: workflowData, error: workflowError } = await supabase
      .from("n8n_workflows")
      .select("webhook_url")
      .eq("is_active", true)
      .single();

    if (workflowError || !workflowData) {
      console.error("Workflow lookup error:", workflowError);
      console.error("Workflow data:", workflowData);

      // Update ad_videos status to failed
      await supabase
        .from("ad_videos")
        .update({
          status: "failed",
          error_message: "활성화된 n8n 워크플로우를 찾을 수 없습니다.",
        })
        .eq("id", videoData.id);

      return {
        success: false,
        error: "활성화된 n8n 워크플로우를 찾을 수 없습니다.",
      };
    }

    // Trigger n8n webhook
    console.log("Triggering n8n webhook:", workflowData.webhook_url);
    console.log("Webhook payload:", {
      ad_video_id: videoData.id,
      product_image_id: imageId,
      product_info_id: productInfoId,
    });

    try {
      const response = await fetch(workflowData.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ad_video_id: videoData.id,
          product_image_id: imageId,
          product_info_id: productInfoId,
        }),
      });

      console.log("n8n webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("n8n webhook error response:", errorText);
        throw new Error(`n8n webhook failed with status ${response.status}`);
      }

      // n8n 응답 파싱 (JSON이 아닐 수도 있음)
      let responseData: any = {};
      let executionId: string | null = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
          executionId = responseData.executionId || null;
          console.log("n8n webhook response data:", responseData);
        } else {
          const textResponse = await response.text();
          console.log("n8n webhook text response:", textResponse);
        }
      } catch (parseError) {
        console.warn("Failed to parse n8n response:", parseError);
        // JSON 파싱 실패해도 계속 진행 (워크플로우는 성공한 것으로 간주)
      }

      // Note: n8n_execution_id field doesn't exist in schema yet
      // Can be added in future migration if needed for tracking

      // Revalidate user's video cache since a new video was created
      revalidateUserVideos(clerkId);

      return {
        success: true,
        adVideoId: videoData.id,
        executionId,
      };
    } catch (fetchError) {
      console.error("n8n webhook error:", fetchError);

      // Update ad_videos status to failed
      await supabase
        .from("ad_videos")
        .update({
          status: "failed",
          error_message: "n8n 워크플로우 실행에 실패했습니다.",
        })
        .eq("id", videoData.id);

      return {
        success: false,
        error: "n8n 워크플로우 실행에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("Trigger n8n error:", error);
    return {
      success: false,
      error: "워크플로우 실행 중 오류가 발생했습니다.",
    };
  }
}
