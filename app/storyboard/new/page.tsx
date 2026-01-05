import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { StoryboardCreateForm } from "@/components/storyboard/storyboard-create-form";

/**
 * Storyboard creation page
 * Allows users to create a new storyboard with AI-generated draft
 */
export default async function NewStoryboardPage() {
  // Check authentication
  const authResult = await auth();
  if (!authResult.userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">새 스토리보드 만들기</h1>
        <p className="text-muted-foreground">
          상품 정보를 입력하면 AI가 스토리보드 초안을 생성합니다.
        </p>
      </div>

      <StoryboardCreateForm />
    </div>
  );
}
