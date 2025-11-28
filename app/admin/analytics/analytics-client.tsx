"use client";

import { useState } from "react";
import type { AnalyticsData } from "@/actions/admin/get-analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Video,
  CreditCard,
  Target,
  PieChart,
  BarChart3,
} from "lucide-react";
import { formatPrice } from "@/lib/constants/credits";

interface AnalyticsClientProps {
  data: AnalyticsData;
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const isProfitable = data.totalProfit > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              완료된 결제 {data.completedPayments}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 비용</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              API, 인프라, 수수료 포함
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순이익</CardTitle>
            {isProfitable ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfitable ? "text-green-600" : "text-red-600"}`}>
              {formatPrice(data.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              이익률 {data.profitMargin}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">영상 생성</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedVideos}건</div>
            <p className="text-xs text-muted-foreground">
              실패 {data.failedVideos}건 / 전체 {data.totalVideosGenerated}건
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="costs">비용 분석</TabsTrigger>
          <TabsTrigger value="monthly">월별 현황</TabsTrigger>
          <TabsTrigger value="breakeven">손익분기</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Per Video Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  영상당 수익 분석
                </CardTitle>
                <CardDescription>
                  영상 1건당 평균 수익 현황
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">평균 매출</span>
                  <span className="font-medium">{formatPrice(data.avgRevenuePerVideo)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">평균 비용</span>
                  <span className="font-medium">{formatPrice(data.avgCostPerVideo)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">평균 순이익</span>
                    <span className={`font-bold ${data.avgProfitPerVideo >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPrice(data.avgProfitPerVideo)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  영상 상태 현황
                </CardTitle>
                <CardDescription>
                  전체 영상 생성 상태 분포
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">완료</span>
                    </div>
                    <Badge variant="secondary">{data.completedVideos}건</Badge>
                  </div>
                  <Progress
                    value={data.totalVideosGenerated > 0 ? (data.completedVideos / data.totalVideosGenerated) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">실패</span>
                    </div>
                    <Badge variant="destructive">{data.failedVideos}건</Badge>
                  </div>
                  <Progress
                    value={data.totalVideosGenerated > 0 ? (data.failedVideos / data.totalVideosGenerated) * 100 : 0}
                    className="h-2 [&>div]:bg-red-500"
                  />
                </div>
                {data.totalVideosGenerated - data.completedVideos - data.failedVideos > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">진행중/대기</span>
                      </div>
                      <Badge variant="outline">
                        {data.totalVideosGenerated - data.completedVideos - data.failedVideos}건
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>비용 상세 분석</CardTitle>
              <CardDescription>
                각 항목별 비용 내역
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cost Items */}
                <CostItem
                  label="OpenAI API (영상 생성)"
                  amount={data.costBreakdown.openaiCost}
                  total={data.costBreakdown.totalCost}
                  description="$0.3/초 × 12초 = $3.6/영상"
                  color="bg-blue-500"
                />
                <CostItem
                  label="Google API (이미지 정제)"
                  amount={data.costBreakdown.googleImageCost}
                  total={data.costBreakdown.totalCost}
                  description="영상당 100원"
                  color="bg-red-500"
                />
                <CostItem
                  label="Google API (프롬프트 생성)"
                  amount={data.costBreakdown.googlePromptCost}
                  total={data.costBreakdown.totalCost}
                  description="3개 프롬프트 생성 100원"
                  color="bg-yellow-500"
                />
                <CostItem
                  label="인프라 (AWS + Supabase)"
                  amount={data.costBreakdown.infraCost}
                  total={data.costBreakdown.totalCost}
                  description="요청당 100원"
                  color="bg-purple-500"
                />
                <CostItem
                  label="실패/품질 매몰비용"
                  amount={data.costBreakdown.sunkCost}
                  total={data.costBreakdown.totalCost}
                  description="영상 생성 비용의 25%"
                  color="bg-orange-500"
                />
                <CostItem
                  label="결제 수수료 (TossPayments)"
                  amount={data.costBreakdown.paymentFee}
                  total={data.costBreakdown.totalCost}
                  description="결제 금액의 4.5%"
                  color="bg-green-500"
                />

                {/* Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">총 비용</span>
                    <span className="text-xl font-bold">{formatPrice(data.costBreakdown.totalCost)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>월별 현황</CardTitle>
              <CardDescription>
                월별 매출, 비용, 수익 추이
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.monthlyData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  월별 데이터가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Monthly Chart (Simple Bar Representation) */}
                  <div className="space-y-3">
                    {data.monthlyData.map((month) => {
                      const maxValue = Math.max(
                        ...data.monthlyData.map((m) => Math.max(m.revenue, m.cost))
                      );

                      return (
                        <div key={month.month} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{month.month}</span>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>영상 {month.videoCount}건</span>
                              <span>결제 {month.paymentCount}건</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-12">매출</span>
                              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all"
                                  style={{ width: `${maxValue > 0 ? (month.revenue / maxValue) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs w-24 text-right">{formatPrice(month.revenue)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-12">비용</span>
                              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                <div
                                  className="h-full bg-red-500 transition-all"
                                  style={{ width: `${maxValue > 0 ? (month.cost / maxValue) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs w-24 text-right">{formatPrice(Math.round(month.cost))}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-12">수익</span>
                              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${month.profit >= 0 ? "bg-green-500" : "bg-orange-500"}`}
                                  style={{ width: `${maxValue > 0 ? (Math.abs(month.profit) / maxValue) * 100 : 0}%` }}
                                />
                              </div>
                              <span className={`text-xs w-24 text-right ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatPrice(Math.round(month.profit))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Break-even Tab */}
        <TabsContent value="breakeven" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  손익분기점 분석
                </CardTitle>
                <CardDescription>
                  초기 고정 비용 회수를 위한 목표
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">목표 영상 수</span>
                    <span className="font-medium">{data.breakEvenPoint.videosNeeded}건</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">목표 매출</span>
                    <span className="font-medium">{formatPrice(data.breakEvenPoint.revenueNeeded)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">달성률</span>
                    <span className="font-bold">{data.breakEvenPoint.currentProgress}%</span>
                  </div>
                  <Progress value={data.breakEvenPoint.currentProgress} className="h-3" />
                </div>

                {data.breakEvenPoint.currentProgress >= 100 ? (
                  <Badge className="w-full justify-center py-2 bg-green-500">
                    손익분기점 달성!
                  </Badge>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    목표까지 {formatPrice(Math.max(0, data.breakEvenPoint.revenueNeeded - data.totalRevenue))} 추가 매출 필요
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>수익성 지표</CardTitle>
                <CardDescription>
                  비즈니스 건전성 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <MetricItem
                    label="이익률"
                    value={`${data.profitMargin}%`}
                    status={data.profitMargin >= 20 ? "good" : data.profitMargin >= 0 ? "warning" : "bad"}
                  />
                  <MetricItem
                    label="영상 완료율"
                    value={`${data.totalVideosGenerated > 0 ? Math.round((data.completedVideos / data.totalVideosGenerated) * 100) : 0}%`}
                    status={
                      data.totalVideosGenerated > 0 && (data.completedVideos / data.totalVideosGenerated) >= 0.9
                        ? "good"
                        : (data.completedVideos / data.totalVideosGenerated) >= 0.7
                        ? "warning"
                        : "bad"
                    }
                  />
                  <MetricItem
                    label="결제 전환율"
                    value={`${data.totalPayments > 0 ? Math.round((data.completedPayments / data.totalPayments) * 100) : 0}%`}
                    status={
                      data.totalPayments > 0 && (data.completedPayments / data.totalPayments) >= 0.8
                        ? "good"
                        : (data.completedPayments / data.totalPayments) >= 0.5
                        ? "warning"
                        : "bad"
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CostItem({
  label,
  amount,
  total,
  description,
  color,
}: {
  label: string;
  amount: number;
  total: number;
  description: string;
  color: string;
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">{label}</span>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <span className="font-medium">{formatPrice(amount)}</span>
          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
        </div>
      </div>
      <div className="bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "bad";
}) {
  const statusColors = {
    good: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100",
    bad: "text-red-600 bg-red-100",
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge className={statusColors[status]}>{value}</Badge>
    </div>
  );
}
