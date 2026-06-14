import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminContext, getOrCreateCourse } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit lesson" };

type Attachment = { name: string; url: string };

export default async function EditLessonPage({
  params,
}: {
  params: { id: string };
}) {
  const { tenant } = await requireAdminContext();
  const course = await getOrCreateCourse(tenant.id);

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { module: { include: { course: true } } },
  });
  if (!lesson || lesson.module.course.tenantId !== tenant.id) notFound();

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/curriculum">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to curriculum
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Edit lesson</h1>

      <LessonForm
        modules={modules}
        lesson={{
          id: lesson.id,
          moduleId: lesson.moduleId,
          title: lesson.title,
          description: lesson.description,
          videoId: lesson.videoId,
          videoDuration: lesson.videoDuration,
          isFree: lesson.isFree,
          attachments: (lesson.attachments as Attachment[]) ?? [],
        }}
      />
    </div>
  );
}
