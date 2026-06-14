"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAVE_INTERVAL_MS = 30_000;
const COMPLETE_THRESHOLD = 0.9;

type Props = {
  lessonId: string;
  libraryId: string | null | undefined;
  videoId: string | null | undefined;
  title: string;
  /** Seconds already watched, used to resume playback. */
  initialWatchedSeconds: number;
  initiallyCompleted: boolean;
};

export function LessonPlayer({
  lessonId,
  libraryId,
  videoId,
  title,
  initialWatchedSeconds,
  initiallyCompleted,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const watchedRef = useRef(initialWatchedSeconds);
  const durationRef = useRef(0);
  const completedRef = useRef(initiallyCompleted);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const router = useRouter();

  const save = useCallback(
    async (markComplete = false) => {
      const watchedSeconds = Math.round(watchedRef.current);
      if (watchedSeconds <= 0 && !markComplete) return;
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            watchedSeconds,
            completed: markComplete || completedRef.current,
          }),
          keepalive: true,
        });
        if (res.ok) {
          const data = (await res.json()) as { completed?: boolean };
          if (data.completed && !completedRef.current) {
            completedRef.current = true;
            setCompleted(true);
            router.refresh();
          }
        }
      } catch {
        // best-effort; will retry on next tick
      }
    },
    [lessonId, router]
  );

  // Player.js wiring for the Bunny Stream iframe.
  useEffect(() => {
    if (!libraryId || !videoId || !iframeRef.current) return;
    let player: import("player.js").Player | null = null;
    let cancelled = false;

    import("player.js").then(({ Player }) => {
      if (cancelled || !iframeRef.current) return;
      player = new Player(iframeRef.current);
      player.on("ready", () => {
        if (initialWatchedSeconds > 5 && !completedRef.current) {
          player?.setCurrentTime(initialWatchedSeconds);
        }
      });
      player.on("timeupdate", (value) => {
        const v = value as { seconds?: number; duration?: number };
        if (typeof v?.seconds === "number") watchedRef.current = v.seconds;
        if (typeof v?.duration === "number") durationRef.current = v.duration;
        if (
          !completedRef.current &&
          durationRef.current > 0 &&
          watchedRef.current / durationRef.current >= COMPLETE_THRESHOLD
        ) {
          void save(true);
        }
      });
    });

    return () => {
      cancelled = true;
      player?.off("timeupdate");
      player?.off("ready");
    };
  }, [libraryId, videoId, initialWatchedSeconds, save]);

  // Periodic save + save on unload.
  useEffect(() => {
    const interval = setInterval(() => void save(), SAVE_INTERVAL_MS);
    const onHidden = () => {
      if (document.visibilityState === "hidden") void save();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onHidden);
      void save();
    };
  }, [save]);

  const hasVideo = Boolean(libraryId && videoId);
  const src = hasVideo
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?responsive=true`
    : "";

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black">
        {hasVideo ? (
          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <PlayCircle className="h-12 w-12" />
            <span className="text-sm">Video not available yet</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {completed ? (
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Progress saves automatically as you watch.
          </span>
        )}
        {!completed && (
          <Button variant="outline" size="sm" onClick={() => save(true)}>
            Mark as complete
          </Button>
        )}
      </div>
    </div>
  );
}
