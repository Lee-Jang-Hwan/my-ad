"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidateUserVideos } from "@/lib/cache";
import { VIDEO_GENERATION_COST, USER_ROLES } from "@/lib/constants/credits";
import type { TriggerN8nResult } from "@/types/upload";

export async function triggerN8nWorkflow(
  imageId: string,
  productInfoId: string,
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

    // Create Supabase clients
    const supabase = createClerkSupabaseClient();
    const serviceSupabase = createServiceRoleClient();

    // Check user's credit balance and role
    const { data: user, error: userError } = await serviceSupabase
      .from("users")
      .select("credit_balance, role")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      console.error("User lookup error:", userError);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    const isAdmin = user.role === USER_ROLES.ADMIN;

    // Check if user has enough credits (admins bypass this check)
    if (!isAdmin && user.credit_balance < VIDEO_GENERATION_COST) {
      return {
        success: false,
        error: "크레딧이 부족합니다.",
        insufficientCredits: true,
      };
    }

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
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`,
      ).toString("base64");
      const response = await fetch(workflowData.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
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

      // Deduct credits for non-admin users
      if (!isAdmin) {
        const newBalance = user.credit_balance - VIDEO_GENERATION_COST;

        // Update user's credit balance
        const { error: creditUpdateError } = await serviceSupabase
          .from("users")
          .update({ credit_balance: newBalance })
          .eq("clerk_id", clerkId);

        if (creditUpdateError) {
          console.error("Credit balance update error:", creditUpdateError);
          // Log the error but don't fail the workflow - video generation has started
        }

        // Create credit transaction record
        const { error: transactionError } = await serviceSupabase
          .from("credit_transactions")
          .insert({
            user_id: clerkId,
            type: "usage",
            amount: -VIDEO_GENERATION_COST,
            balance_after: newBalance,
            ad_video_id: videoData.id,
            description: "영상 생성",
          });

        if (transactionError) {
          console.error("Credit transaction insert error:", transactionError);
          // Non-critical error - credits were deducted, just logging failed
        }

        console.log(`Credits deducted: ${VIDEO_GENERATION_COST}, new balance: ${newBalance}`);
      }

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
