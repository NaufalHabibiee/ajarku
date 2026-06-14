import { PlayCircle } from "lucide-react";

/**
 * Embeds a Bunny Stream video via its iframe player. Renders a placeholder when
 * the video or library is not yet configured.
 *
 * Bunny embed URL shape:
 *   https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
 */
export function BunnyPlayer({
  libraryId,
  videoId,
  title,
  autoplay = false,
}: {
  libraryId: string | null | undefined;
  videoId: string | null | undefined;
  title?: string;
  autoplay?: boolean;
}) {
  if (!libraryId || !videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <PlayCircle className="h-12 w-12" />
          <span className="text-sm">Video not available yet</span>
        </div>
      </div>
    );
  }

  const src =
    `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}` +
    `?autoplay=${autoplay ? "true" : "false"}&responsive=true`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black">
      <iframe
        src={src}
        title={title ?? "Lesson video"}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
