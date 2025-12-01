import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchUserVideos } from "@/actions/fetch-user-videos";
import type { FilterParams } from "@/types/dashboard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { CreditDisplay } from "@/components/credit/credit-display";

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    sortBy?: string;
    page?: string;
  }>;
}

/**
 * Dashboard page (Server Component)
 * Displays user's generated ad videos with filtering and pagination
 */
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  // Check authentication
  const authResult = await auth();
  if (!authResult.userId) {
    redirect("/sign-in");
  }

  // Parse search params
  const params = await searchParams;
  const status = (params.status as FilterParams["status"]) || "all";
  const sortBy = (params.sortBy as FilterParams["sortBy"]) || "newest";
  const page = parseInt(params.page || "1");

  // Validate status
  const validStatuses = ["all", "pending", "processing", "completed", "failed"];
  const validatedStatus = validStatuses.includes(status)
    ? (status as FilterParams["status"])
    : "all";

  // Validate sortBy
  const validSorts = ["newest", "oldest"];
  const validatedSortBy = validSorts.includes(sortBy)
    ? (sortBy as FilterParams["sortBy"])
    : "newest";

  // Validate page
  const validatedPage = Math.max(1, page);

  const filter: FilterParams = {
    status: validatedStatus,
    sortBy: validatedSortBy,
    page: validatedPage,
  };

  // Fetch initial data (SSR)
  const result = await fetchUserVideos(filter);

  // Handle errors
  if (!result.success) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">내 영상</h1>
        <div className="rounded-lg bg-destructive/10 p-8 text-center">
          <p className="text-destructive font-semibold mb-2">
            영상 목록을 불러올 수 없습니다
          </p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  // Handle page out of range
  if (
    result.pagination &&
    validatedPage > result.pagination.totalPages &&
    result.pagination.totalCount > 0
  ) {
    // Redirect to page 1 if page number is invalid
    const redirectParams = new URLSearchParams();
    if (validatedStatus !== "all") redirectParams.set("status", validatedStatus);
    if (validatedSortBy !== "newest") redirectParams.set("sortBy", validatedSortBy);
    const queryString = redirectParams.toString();
    redirect(queryString ? `/dashboard?${queryString}` : "/dashboard");
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">마이 페이지</h1>
          <p className="text-muted-foreground">
            생성한 광고 영상 · 이미지를 확인하고 관리하세요
          </p>
        </div>
        <CreditDisplay className="md:w-80" />
      </div>

      <DashboardContent
        initialVideos={result.videos || []}
        initialPagination={
          result.pagination || {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            limit: 12,
          }
        }
        initialFilter={filter}
      />
    </div>
  );
}
