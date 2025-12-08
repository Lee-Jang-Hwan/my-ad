"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";
import { STAGE_LABELS } from "@/lib/log-generation";

// =====================================================
// Types
// =====================================================

export interface GenerationLog {
  id: string;
  user_id: string;
  content_id: string;
  content_type: "video" | "image";
  stage: string;
  status: "started" | "completed" | "failed";
  source: "app" | "n8n" | "supabase";
  message: string | null;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: {
    name: string | null;
    clerk_id: string;
  };
}

export interface GetLogsParams {
  page?: number;
  limit?: number;
  contentType?: "video" | "image" | "all";
  status?: "started" | "completed" | "failed" | "all";
  userId?: string;
  contentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetLogsResult {
  success: boolean;
  logs: GenerationLog[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

export interface TimelineLog {
  id: string;
  stage: string;
  stageLabel: string;
  status: "started" | "completed" | "failed";
  source: "app" | "n8n" | "supabase";
  message: string | null;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface GetTimelineResult {
  success: boolean;
  timeline: TimelineLog[];
  contentType?: "video" | "image";
  error?: string;
}

export interface LogStats {
  totalLogs: number;
  videoLogs: number;
  imageLogs: number;
  failedLogs: number;
  todayLogs: number;
}

export interface GetLogStatsResult {
  success: boolean;
  stats?: LogStats;
  error?: string;
}

// =====================================================
// Main Functions
// =====================================================

/**
 * 생성 로그 목록 조회 (관리자 전용)
 */
export async function getGenerationLogs(
  params: GetLogsParams = {}
): Promise<GetLogsResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        logs: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", clerkId)
      .single();

    if (adminError || !adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        logs: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: "관리자 권한이 필요합니다.",
      };
    }

    const {
      page = 1,
      limit = 50,
      contentType = "all",
      status = "all",
      userId: filterUserId,
      contentId,
      startDate,
      endDate,
    } = params;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("generation_logs")
      .select(
        `
        *,
        user:users!generation_logs_user_id_fkey(name, clerk_id)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (contentType !== "all") {
      query = query.eq("content_type", contentType);
    }
    if (status !== "all") {
      query = query.eq("status", status);
    }
    if (filterUserId) {
      query = query.eq("user_id", filterUserId);
    }
    if (contentId) {
      query = query.eq("content_id", contentId);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Get generation logs error:", error);
      return {
        success: false,
        logs: [],
        total: 0,
        page,
        totalPages: 0,
        error: "로그 조회에 실패했습니다.",
      };
    }

    return {
      success: true,
      logs: (data as GenerationLog[]) || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Get generation logs error:", error);
    return {
      success: false,
      logs: [],
      total: 0,
      page: 1,
      totalPages: 0,
      error: "로그 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 특정 콘텐츠의 전체 타임라인 조회 (관리자 전용)
 */
export async function getContentTimeline(
  contentId: string
): Promise<GetTimelineResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        timeline: [],
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", clerkId)
      .single();

    if (adminError || !adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        timeline: [],
        error: "관리자 권한이 필요합니다.",
      };
    }

    const { data, error } = await supabase
      .from("generation_logs")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get content timeline error:", error);
      return {
        success: false,
        timeline: [],
        error: "타임라인 조회에 실패했습니다.",
      };
    }

    const timeline: TimelineLog[] = (data || []).map((log) => ({
      id: log.id,
      stage: log.stage,
      stageLabel: STAGE_LABELS[log.stage] || log.stage,
      status: log.status,
      source: log.source,
      message: log.message,
      error_code: log.error_code,
      error_message: log.error_message,
      metadata: log.metadata,
      created_at: log.created_at,
    }));

    const contentType = data?.[0]?.content_type as "video" | "image" | undefined;

    return {
      success: true,
      timeline,
      contentType,
    };
  } catch (error) {
    console.error("Get content timeline error:", error);
    return {
      success: false,
      timeline: [],
      error: "타임라인 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 로그 통계 조회 (관리자 전용)
 */
export async function getLogStats(): Promise<GetLogStatsResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", clerkId)
      .single();

    if (adminError || !adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        error: "관리자 권한이 필요합니다.",
      };
    }

    // Get all logs for statistics
    const { data: logs, error } = await supabase
      .from("generation_logs")
      .select("content_type, status, created_at");

    if (error) {
      console.error("Get log stats error:", error);
      return {
        success: false,
        error: "통계 조회에 실패했습니다.",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats: LogStats = {
      totalLogs: logs?.length || 0,
      videoLogs: logs?.filter((l) => l.content_type === "video").length || 0,
      imageLogs: logs?.filter((l) => l.content_type === "image").length || 0,
      failedLogs: logs?.filter((l) => l.status === "failed").length || 0,
      todayLogs:
        logs?.filter((l) => new Date(l.created_at) >= today).length || 0,
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Get log stats error:", error);
    return {
      success: false,
      error: "통계 조회 중 오류가 발생했습니다.",
    };
  }
}
