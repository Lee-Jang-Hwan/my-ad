export const dynamic = "force-dynamic";

import { getPayments } from "@/actions/admin/get-payments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatCredits } from "@/lib/constants/credits";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기", variant: "outline" },
  ready: { label: "준비", variant: "secondary" },
  in_progress: { label: "진행중", variant: "secondary" },
  done: { label: "완료", variant: "default" },
  canceled: { label: "취소", variant: "destructive" },
  partial_canceled: { label: "부분취소", variant: "destructive" },
  aborted: { label: "중단", variant: "destructive" },
  expired: { label: "만료", variant: "outline" },
};

export default async function AdminPaymentsPage() {
  const result = await getPayments(1, 50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">결제 관리</h1>
        <p className="text-muted-foreground">
          전체 결제 내역을 확인하고 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>
            총 {result.totalCount}건의 결제 내역
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              결제 내역이 없습니다.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>주문번호</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>상품</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>크레딧</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>결제일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.payments.map((payment) => {
                    const statusInfo = STATUS_LABELS[payment.status] || {
                      label: payment.status,
                      variant: "outline" as const,
                    };

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">
                          {payment.order_id}
                        </TableCell>
                        <TableCell>
                          {payment.user?.name || "이름 없음"}
                        </TableCell>
                        <TableCell>
                          {payment.pricing_tier?.display_name || "-"}
                        </TableCell>
                        <TableCell>{formatPrice(payment.amount)}</TableCell>
                        <TableCell>
                          {payment.credits_granted > 0
                            ? `+${formatCredits(payment.credits_granted)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
