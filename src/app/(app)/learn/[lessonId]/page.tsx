import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Lock,
  Paperclip,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { canAccessLesson, getLessonForUser } from "@/lib/access";
import { LessonPlayer } from "@/components/video/lesson-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Attachment = { name: string; url: string; size?: number };

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const user = await requireUser();
  const tenant = await requireTenant();

  const lesson = await getLessonForUser(params.lessonId, tenant.id, user.id);
  if (!lesson) notFound();

  const access = canAccessLesson(user, lesson);

  // Build the flattened ordered lesson list for prev/next navigation.
  const course = await prisma.course.findUnique({
    where: { id: lesson.module.courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
      },
    },
  });
  const ordered = course?.modules.flatMap((m) => m.lessons) ?? [];
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const progress = lesson.progress[0];
  const attachments = (lesson.attachments as Attachment[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/learn">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to course
        </Link>
      </Button>

      {access ? (
        <LessonPlayer
          lessonId={lesson.id}
          libraryId={tenant.bunnyLibraryId}
          videoId={lesson.videoId}
          title={lesson.title}
          initialWatchedSeconds={progress?.watchedSeconds ?? 0}
          initiallyCompleted={Boolean(progress?.completedAt)}
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border bg-muted/40 text-center">
          <Lock className="h-10 w-10 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">This lesson is locked</h2>
            <p className="text-sm text-muted-foreground">
              Subscribe to unlock the full course.
            </p>
          </div>
          <Button asChild variant="brand">
            <Link href="/subscribe">Subscribe now</Link>
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {lesson.isFree && <Badge variant="outline">Free</Badge>}
        </div>
        {lesson.description && (
          <p className="text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {access && attachments.length > 0 && (
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
            <Paperclip className="h-4 w-4" /> Attachments
          </div>
          <ul className="divide-y">
            {attachments.map((a) => (
              <li key={a.url}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{a.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        {prev ? (
          <Button asChild variant="outline">
            <Link href={`/learn/${prev.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="outline">
            <Link href={`/learn/${next.id}`}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
