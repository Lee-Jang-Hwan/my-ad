"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ErrorMessageProps } from "@/types/generation";
import { RetryButton } from "./retry-button";

/**
 * Error message component for failed video generation
 * Displays error with retry option
 */
export function ErrorMessage({ message, adVideoId }: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>영상 생성 실패</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{message}</p>
        <RetryButton adVideoId={adVideoId} />
      </AlertDescription>
    </Alert>
  );
}
