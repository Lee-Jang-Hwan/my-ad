export const dynamic = "force-dynamic";

import { getUsers } from "@/actions/admin/get-users";
import { AdminUsersClient } from "./admin-users-client";

export default async function AdminUsersPage() {
  const result = await getUsers(1, 50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground">
          사용자 목록을 확인하고 크레딧을 관리합니다.
        </p>
      </div>

      <AdminUsersClient
        initialUsers={result.users}
        totalCount={result.totalCount}
      />
    </div>
  );
}
