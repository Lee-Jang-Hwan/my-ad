export const dynamic = "force-dynamic";

import { getPaymentStats } from "@/actions/admin/get-payments";
import { getUserStats } from "@/actions/admin/get-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, formatCredits } from "@/lib/constants/credits";
import { CreditCard, Users, Coins, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const [paymentStatsResult, userStatsResult] = await Promise.all([
    getPaymentStats(),
    getUserStats(),
  ]);

  const paymentStats = paymentStatsResult.stats;
  const userStats = userStatsResult.stats;

  const stats = [
    {
      title: "총 매출",
      value: paymentStats ? formatPrice(paymentStats.totalRevenue) : "0",
      description: `완료된 결제 ${paymentStats?.completedPayments || 0}건`,
      icon: TrendingUp,
    },
    {
      title: "총 결제 수",
      value: paymentStats?.totalPayments?.toString() || "0",
      description: "전체 결제 내역",
      icon: CreditCard,
    },
    {
      title: "총 사용자",
      value: userStats?.totalUsers?.toString() || "0",
      description: `관리자 ${userStats?.adminUsers || 0}명`,
      icon: Users,
    },
    {
      title: "총 발급 크레딧",
      value: paymentStats
        ? formatCredits(paymentStats.totalCreditsGranted)
        : "0",
      description: `현재 보유 ${formatCredits(userStats?.totalCredits || 0)}`,
      icon: Coins,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          결제 및 사용자 통계를 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>빠른 링크</CardTitle>
            <CardDescription>자주 사용하는 관리 기능</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/payments"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">결제 관리</p>
                  <p className="text-sm text-muted-foreground">
                    결제 내역 조회 및 관리
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="block rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">사용자 관리</p>
                  <p className="text-sm text-muted-foreground">
                    사용자 조회 및 크레딧 부여
                  </p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
            <CardDescription>서비스 상태 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">결제 시스템</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                  정상
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">영상 생성</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                  정상
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">데이터베이스</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                  정상
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
