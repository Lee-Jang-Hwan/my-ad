"use client";

import { useEffect, useState } from "react";
import { getCreditHistory } from "@/actions/credit/check-balance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatCredits } from "@/lib/constants/credits";
import type { CreditTransaction } from "@/types/payment";

const TRANSACTION_TYPE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  purchase: { label: "구매", variant: "default" },
  usage: { label: "사용", variant: "destructive" },
  admin_grant: { label: "관리자 부여", variant: "secondary" },
  refund: { label: "환불", variant: "outline" },
  expiry: { label: "만료", variant: "destructive" },
};

export function CreditHistory() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const result = await getCreditHistory(20);
        if (result.success) {
          setTransactions(result.transactions);
        } else {
          setError(result.error || "거래 내역 조회에 실패했습니다.");
        }
      } catch (err) {
        setError("거래 내역 조회 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        거래 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>일시</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>내용</TableHead>
            <TableHead className="text-right">변동</TableHead>
            <TableHead className="text-right">잔액</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const typeInfo = TRANSACTION_TYPE_LABELS[transaction.type] || {
              label: transaction.type,
              variant: "outline" as const,
            };

            return (
              <TableRow key={transaction.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {transaction.description || "-"}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCredits(transaction.amount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCredits(transaction.balance_after)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
