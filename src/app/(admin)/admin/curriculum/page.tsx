import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  Lock,
  PlayCircle,
} from "lucide-react";
import { requireAdminContext, getOrCreateCourse } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  createModule,
  renameModule,
  deleteModule,
  moveModule,
  createLessonQuick,
  deleteLesson,
  moveLesson,
  togglePublish,
} from "@/lib/actions/curriculum";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Curriculum" };

export default async function CurriculumPage() {
  const { tenant } = await requireAdminContext();
  const course = await getOrCreateCourse(tenant.id);

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Curriculum</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course.isPublished ? "success" : "secondary"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
          <form action={togglePublish}>
            <SubmitButton variant="outline" size="sm">
              {course.isPublished ? "Unpublish" : "Publish"}
            </SubmitButton>
          </form>
        </div>
      </div>

      <Button asChild variant="brand">
        <Link href="/admin/lessons/new">
          <Plus className="mr-2 h-4 w-4" /> New lesson
        </Link>
      </Button>

      {/* Modules */}
      <div className="space-y-4">
        {modules.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No modules yet. Add your first module below.
          </div>
        )}

        {modules.map((module, mi) => (
          <Card key={module.id}>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <form
                action={renameModule}
                className="flex flex-1 items-center gap-2"
              >
                <input type="hidden" name="id" value={module.id} />
                <span className="text-xs font-medium text-muted-foreground">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <Input
                  name="title"
                  defaultValue={module.title}
                  className="h-8 flex-1 font-medium"
                />
                <SubmitButton variant="ghost" size="sm">
                  Save
                </SubmitButton>
              </form>
              <div className="flex items-center gap-1">
                <form action={moveModule}>
                  <input type="hidden" name="id" value={module.id} />
                  <input type="hidden" name="dir" value="up" />
                  <Button variant="ghost" size="icon" type="submit" disabled={mi === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </form>
                <form action={moveModule}>
                  <input type="hidden" name="id" value={module.id} />
                  <input type="hidden" name="dir" value="down" />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={mi === modules.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </form>
                <form action={deleteModule}>
                  <input type="hidden" name="id" value={module.id} />
                  <Button variant="ghost" size="icon" type="submit">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {module.lessons.length === 0 && (
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
              )}
              <ul className="divide-y rounded-md border">
                {module.lessons.map((lesson, li) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    {lesson.isFree ? (
                      <PlayCircle className="h-4 w-4 text-brand" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">{lesson.title}</span>
                    {!lesson.videoId && (
                      <Badge variant="outline" className="text-[10px]">
                        No video
                      </Badge>
                    )}
                    {lesson.isFree && (
                      <Badge variant="brand" className="text-[10px]">
                        Free
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(lesson.videoDuration)}
                    </span>
                    <form action={moveLesson}>
                      <input type="hidden" name="id" value={lesson.id} />
                      <input type="hidden" name="dir" value="up" />
                      <Button variant="ghost" size="icon" type="submit" disabled={li === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </form>
                    <form action={moveLesson}>
                      <input type="hidden" name="id" value={lesson.id} />
                      <input type="hidden" name="dir" value="down" />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="submit"
                        disabled={li === module.lessons.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </form>
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/lessons/${lesson.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={deleteLesson}>
                      <input type="hidden" name="id" value={lesson.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>

              {/* Quick add lesson */}
              <form action={createLessonQuick} className="flex gap-2 pt-2">
                <input type="hidden" name="moduleId" value={module.id} />
                <Input
                  name="title"
                  placeholder="Quick add a lesson title…"
                  className="h-8"
                />
                <SubmitButton variant="outline" size="sm">
                  Add
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add module */}
      <Card>
        <CardContent className="p-4">
          <form action={createModule} className="flex gap-2">
            <Input name="title" placeholder="New module title…" />
            <SubmitButton variant="brand">
              <Plus className="mr-2 h-4 w-4" /> Add module
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
