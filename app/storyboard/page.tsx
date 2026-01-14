import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchUserStoryboards } from "@/actions/storyboard";
import { StoryboardListContent } from "@/components/storyboard/storyboard-list-content";
import { CreditDisplay } from "@/components/credit/credit-display";
import type { StoryboardStatus } from "@/types/storyboard";

interface StoryboardPageProps {
  searchParams: Promise<{
    status?: string;
    sortBy?: string;
    page?: string;
  }>;
}

/**
 * Storyboard list page (Server Component)
 * Displays user's storyboards with filtering and pagination
 */
export default async function StoryboardPage({
  searchParams,
}: StoryboardPageProps) {
  // Check authentication
  const authResult = await auth();
  if (!authResult.userId) {
    redirect("/sign-in");
  }

  // Parse search params
  const params = await searchParams;
  const status = params.status as StoryboardStatus | undefined;
  const sortBy = (params.sortBy as "created_at" | "updated_at") || "created_at";
  const page = parseInt(params.page || "1");

  // Validate status
  const validStatuses: StoryboardStatus[] = ["draft", "generating", "completed", "failed"];
  const validatedStatus = status && validStatuses.includes(status) ? status : undefined;

  // Validate sortBy
  const validSorts = ["created_at", "updated_at"];
  const validatedSortBy = validSorts.includes(sortBy)
    ? (sortBy as "created_at" | "updated_at")
    : "created_at";

  // Validate page
  const validatedPage = Math.max(1, page);
  const limit = 12;
  const offset = (validatedPage - 1) * limit;

  // Fetch initial data (SSR)
  const result = await fetchUserStoryboards({
    status: validatedStatus,
    limit,
    offset,
    orderBy: validatedSortBy,
    orderDirection: "desc",
  });

  // Handle errors
  if (!result.success) {
    return (
      <div className="w-full min-w-fit py-8 px-6 lg:px-12">
        <h1 className="text-3xl font-bold mb-8">스토리보드</h1>
        <div className="rounded-lg bg-destructive/10 p-8 text-center">
          <p className="text-destructive font-semibold mb-2">
            스토리보드 목록을 불러올 수 없습니다
          </p>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((result.data?.total || 0) / limit);

  // Handle page out of range
  if (validatedPage > totalPages && (result.data?.total || 0) > 0) {
    const redirectParams = new URLSearchParams();
    if (validatedStatus) redirectParams.set("status", validatedStatus);
    if (validatedSortBy !== "created_at") redirectParams.set("sortBy", validatedSortBy);
    const queryString = redirectParams.toString();
    redirect(queryString ? `/storyboard?${queryString}` : "/storyboard");
  }

  return (
    <div className="w-full min-w-fit py-8 px-6 lg:px-12">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">스토리보드</h1>
          <p className="text-muted-foreground">
            AI 영상 제작을 위한 스토리보드를 관리하세요
          </p>
        </div>
        <CreditDisplay className="md:w-80" />
      </div>

      <StoryboardListContent
        initialStoryboards={result.data?.storyboards || []}
        initialPagination={{
          currentPage: validatedPage,
          totalPages,
          totalCount: result.data?.total || 0,
          limit,
        }}
        initialFilter={{
          status: validatedStatus,
          sortBy: validatedSortBy,
        }}
      />
    </div>
  );
}
