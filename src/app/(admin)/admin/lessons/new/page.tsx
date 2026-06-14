import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminContext, getOrCreateCourse } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "New lesson" };

export default async function NewLessonPage() {
  const { tenant } = await requireAdminContext();
  const course = await getOrCreateCourse(tenant.id);
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
      <h1 className="text-2xl font-bold">New lesson</h1>

      {modules.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Create a module first on the{" "}
          <Link href="/admin/curriculum" className="font-medium text-brand">
            Curriculum
          </Link>{" "}
          page.
        </div>
      ) : (
        <LessonForm modules={modules} />
      )}
    </div>
  );
}
