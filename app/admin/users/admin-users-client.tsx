"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Coins, Crown } from "lucide-react";
import { formatCredits } from "@/lib/constants/credits";
import { GrantCreditDialog } from "@/components/admin/grant-credit-dialog";
import type { UserData } from "@/actions/admin/get-users";

interface AdminUsersClientProps {
  initialUsers: UserData[];
  totalCount: number;
}

export function AdminUsersClient({
  initialUsers,
  totalCount,
}: AdminUsersClientProps) {
  const router = useRouter();
  const [users] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);

  const handleGrantCredit = (user: UserData) => {
    setSelectedUser(user);
    setGrantDialogOpen(true);
  };

  const handleGrantSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>총 {totalCount}명의 사용자</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              사용자가 없습니다.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>크레딧</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "이름 없음"}
                      </TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" />
                            관리자
                          </Badge>
                        ) : (
                          <Badge variant="secondary">일반</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          {formatCredits(user.credit_balance)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrantCredit(user)}
                        >
                          <Coins className="mr-2 h-4 w-4" />
                          크레딧 부여
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <GrantCreditDialog
          open={grantDialogOpen}
          onOpenChange={setGrantDialogOpen}
          userId={selectedUser.clerk_id}
          userName={selectedUser.name || "이름 없음"}
          currentBalance={selectedUser.credit_balance}
          onSuccess={handleGrantSuccess}
        />
      )}
    </>
  );
}
