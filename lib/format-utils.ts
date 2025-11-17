/**
 * Format file size from bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "15.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format duration from seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "03:45")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format date to Korean locale
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "2025년 1월 6일")
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate download filename from product name and date
 * @param productName - Product name
 * @param createdAt - Creation date string
 * @returns Sanitized filename (e.g., "상품명_20250106.mp4")
 */
export function generateDownloadFilename(
  productName: string,
  createdAt: string
): string {
  // Sanitize product name: keep only Korean, English, numbers
  const sanitized = productName
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50); // Limit to 50 chars

  // Format date as YYYYMMDD
  const date = new Date(createdAt);
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");

  return `${sanitized}_${dateStr}.mp4`;
}
