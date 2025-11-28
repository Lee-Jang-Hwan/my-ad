"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";

// Cost constants (in KRW)
// Exchange rate: 1 USD = 1,400 KRW
const USD_TO_KRW = 1400;

// OpenAI API: $0.3/second × 12 seconds = $3.6 per video
const OPENAI_COST_PER_VIDEO = 0.3 * 12 * USD_TO_KRW; // 5,040원

// Google API: 100원 for image refinement
const GOOGLE_IMAGE_REFINE_COST = 100;

// Google API: 100원 for 3 prompts generation
const GOOGLE_PROMPT_COST = 100;

// Infrastructure (AWS + Supabase): 100원 per call
const INFRA_COST_PER_CALL = 100;

// Total direct cost per video
const DIRECT_COST_PER_VIDEO =
  OPENAI_COST_PER_VIDEO + GOOGLE_IMAGE_REFINE_COST + GOOGLE_PROMPT_COST + INFRA_COST_PER_CALL;

// Failed/Quality sunk cost: 25% of video generation cost
const SUNK_COST_RATE = 0.25;

// Payment fee: 4.5%
const PAYMENT_FEE_RATE = 0.045;

export interface MonthlyData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  videoCount: number;
  paymentCount: number;
}

export interface CostBreakdown {
  openaiCost: number;
  googleImageCost: number;
  googlePromptCost: number;
  infraCost: number;
  sunkCost: number;
  paymentFee: number;
  totalCost: number;
}

export interface AnalyticsData {
  // Summary
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;

  // Counts
  totalPayments: number;
  completedPayments: number;
  totalVideosGenerated: number;
  completedVideos: number;
  failedVideos: number;

  // Cost breakdown
  costBreakdown: CostBreakdown;

  // Monthly data for charts
  monthlyData: MonthlyData[];

  // Break-even analysis
  breakEvenPoint: {
    videosNeeded: number;
    revenueNeeded: number;
    currentProgress: number; // percentage toward break-even
  };

  // Per video metrics
  avgRevenuePerVideo: number;
  avgCostPerVideo: number;
  avgProfitPerVideo: number;
}

export interface GetAnalyticsResult {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
}

/**
 * Get analytics data (admin only)
 */
export async function getAnalytics(): Promise<GetAnalyticsResult> {
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

    // Fetch completed payments
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, amount, status, created_at")
      .order("created_at", { ascending: true });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return {
        success: false,
        error: "결제 데이터 조회에 실패했습니다.",
      };
    }

    // Fetch video generation data
    const { data: videos, error: videosError } = await supabase
      .from("ad_videos")
      .select("id, status, created_at")
      .order("created_at", { ascending: true });

    if (videosError) {
      console.error("Error fetching videos:", videosError);
      return {
        success: false,
        error: "영상 데이터 조회에 실패했습니다.",
      };
    }

    // Calculate metrics
    const completedPayments = payments?.filter((p) => p.status === "done") || [];
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalVideos = videos?.length || 0;
    const completedVideos = videos?.filter((v) => v.status === "completed").length || 0;
    const failedVideos = videos?.filter((v) => v.status === "failed").length || 0;

    // Calculate costs
    const openaiCost = completedVideos * OPENAI_COST_PER_VIDEO;
    const googleImageCost = completedVideos * GOOGLE_IMAGE_REFINE_COST;
    const googlePromptCost = completedVideos * GOOGLE_PROMPT_COST;
    const infraCost = totalVideos * INFRA_COST_PER_CALL; // All attempts count
    const sunkCost = completedVideos * DIRECT_COST_PER_VIDEO * SUNK_COST_RATE;
    const paymentFee = totalRevenue * PAYMENT_FEE_RATE;

    const totalCost = openaiCost + googleImageCost + googlePromptCost + infraCost + sunkCost + paymentFee;
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate monthly data
    const monthlyMap = new Map<string, MonthlyData>();

    // Process payments by month
    completedPayments.forEach((payment) => {
      const date = new Date(payment.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyMap.get(monthKey) || {
        month: monthKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        videoCount: 0,
        paymentCount: 0,
      };

      existing.revenue += payment.amount;
      existing.paymentCount += 1;
      monthlyMap.set(monthKey, existing);
    });

    // Process videos by month
    videos?.forEach((video) => {
      const date = new Date(video.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyMap.get(monthKey) || {
        month: monthKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        videoCount: 0,
        paymentCount: 0,
      };

      // Add video cost
      if (video.status === "completed") {
        const videoCost = DIRECT_COST_PER_VIDEO + (DIRECT_COST_PER_VIDEO * SUNK_COST_RATE);
        existing.cost += videoCost;
      } else {
        existing.cost += INFRA_COST_PER_CALL;
      }

      existing.videoCount += 1;
      monthlyMap.set(monthKey, existing);
    });

    // Add payment fees to monthly costs
    monthlyMap.forEach((data, key) => {
      data.cost += data.revenue * PAYMENT_FEE_RATE;
      data.profit = data.revenue - data.cost;
      monthlyMap.set(key, data);
    });

    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Break-even analysis
    // Fixed costs assumption: infrastructure setup, etc.
    const fixedCosts = 100000; // 10만원 가정 (초기 설정 비용)
    const avgRevenuePerVideo = completedVideos > 0 ? totalRevenue / completedVideos : 0;
    const avgCostPerVideo = completedVideos > 0 ? totalCost / completedVideos : DIRECT_COST_PER_VIDEO;
    const avgProfitPerVideo = avgRevenuePerVideo - avgCostPerVideo;

    let videosNeeded = 0;
    let revenueNeeded = 0;
    let currentProgress = 0;

    if (avgProfitPerVideo > 0) {
      videosNeeded = Math.ceil(fixedCosts / avgProfitPerVideo);
      revenueNeeded = videosNeeded * avgRevenuePerVideo;
      currentProgress = Math.min((totalProfit / fixedCosts) * 100, 100);
    }

    const analyticsData: AnalyticsData = {
      totalRevenue,
      totalCost: Math.round(totalCost),
      totalProfit: Math.round(totalProfit),
      profitMargin: Math.round(profitMargin * 10) / 10,

      totalPayments: payments?.length || 0,
      completedPayments: completedPayments.length,
      totalVideosGenerated: totalVideos,
      completedVideos,
      failedVideos,

      costBreakdown: {
        openaiCost: Math.round(openaiCost),
        googleImageCost: Math.round(googleImageCost),
        googlePromptCost: Math.round(googlePromptCost),
        infraCost: Math.round(infraCost),
        sunkCost: Math.round(sunkCost),
        paymentFee: Math.round(paymentFee),
        totalCost: Math.round(totalCost),
      },

      monthlyData,

      breakEvenPoint: {
        videosNeeded,
        revenueNeeded: Math.round(revenueNeeded),
        currentProgress: Math.round(currentProgress * 10) / 10,
      },

      avgRevenuePerVideo: Math.round(avgRevenuePerVideo),
      avgCostPerVideo: Math.round(avgCostPerVideo),
      avgProfitPerVideo: Math.round(avgProfitPerVideo),
    };

    return {
      success: true,
      data: analyticsData,
    };
  } catch (error) {
    console.error("Get analytics error:", error);
    return {
      success: false,
      error: "분석 데이터 조회 중 오류가 발생했습니다.",
    };
  }
}
