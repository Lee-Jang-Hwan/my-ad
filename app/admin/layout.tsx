import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";
import Link from "next/link";
import { LayoutDashboard, CreditCard, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  {
    href: "/admin",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/payments",
    label: "결제 관리",
    icon: CreditCard,
  },
  {
    href: "/admin/users",
    label: "사용자 관리",
    icon: Users,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check admin permission
  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("clerk_id", userId)
    .single();

  if (!user || user.role !== USER_ROLES.ADMIN) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-semibold">관리자</h1>
        </div>

        <nav className="space-y-1 p-4">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              메인으로 돌아가기
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}
