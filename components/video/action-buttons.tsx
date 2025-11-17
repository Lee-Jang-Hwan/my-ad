import { DownloadButton } from "./download-button";
import { CopyLinkButton } from "./copy-link-button";

interface ActionButtonsProps {
  videoId: string;
}

/**
 * Container for video action buttons
 * Groups download and copy link buttons
 */
export function ActionButtons({ videoId }: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <DownloadButton videoId={videoId} />
      <CopyLinkButton videoId={videoId} />
    </div>
  );
}
