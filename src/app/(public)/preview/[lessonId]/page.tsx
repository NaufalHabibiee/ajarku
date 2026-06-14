import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { BunnyPlayer } from "@/components/video/bunny-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { module: { include: { course: true } } },
  });

  // Must exist, belong to this tenant, and be a free preview lesson.
  if (
    !lesson ||
    lesson.module.course.tenantId !== tenant.id ||
    !lesson.isFree
  ) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/#curriculum">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to curriculum
        </Link>
      </Button>

      <div className="mb-4 flex items-center gap-2">
        <Badge variant="brand">Free preview</Badge>
        <span className="text-sm text-muted-foreground">
          {lesson.module.course.title}
        </span>
      </div>

      <BunnyPlayer
        libraryId={tenant.bunnyLibraryId}
        videoId={lesson.videoId}
        title={lesson.title}
      />

      <h1 className="mt-6 text-2xl font-bold">{lesson.title}</h1>
      {lesson.description && (
        <p className="mt-2 text-muted-foreground">{lesson.description}</p>
      )}

      <div className="mt-8 rounded-xl border bg-muted/40 p-6 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Want the full course?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscribe to unlock every lesson, downloads, live sessions and more.
        </p>
        <Button asChild variant="brand" className="mt-4">
          <Link href="/subscribe">Subscribe now</Link>
        </Button>
      </div>
    </div>
  );
}
