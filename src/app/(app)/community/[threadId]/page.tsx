import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowBigUp, Pin, Trash2, BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  upvoteReply,
  togglePinThread,
  deleteThread,
} from "@/lib/actions/forum";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReplyForm } from "@/components/community/reply-form";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: { threadId: string };
}) {
  const user = await requireUser();
  const isAdmin = user.role === "admin" || user.role === "superadmin";

  const thread = await prisma.forumThread.findUnique({
    where: { id: params.threadId },
    include: {
      user: { select: { name: true, email: true } },
      lesson: { select: { id: true, title: true } },
      replies: {
        orderBy: [{ isInstructorReply: "desc" }, { createdAt: "asc" }],
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!thread || thread.tenantId !== user.tenantId) notFound();

  // Count a view (skip the author's own visits).
  if (thread.userId !== user.id) {
    await prisma.forumThread.update({
      where: { id: thread.id },
      data: { views: { increment: 1 } },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Home
        </Link>{" "}
        <span className="mx-1">›</span>{" "}
        <Link href="/community" className="hover:text-foreground">
          Komunitas
        </Link>{" "}
        <span className="mx-1">›</span>{" "}
        <span className="text-foreground">{thread.title}</span>
      </nav>
      <Button asChild variant="ghost" size="sm">
        <Link href="/community">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke komunitas
        </Link>
      </Button>

      {/* Thread */}
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                {thread.isPinned && <Pin className="h-4 w-4 text-brand" />}
                <h1 className="text-xl font-bold">{thread.title}</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {thread.user.name ?? thread.user.email} ·{" "}
                {thread.createdAt.toLocaleString()} · {thread.views} views
              </p>
            </div>
            {isAdmin && (
              <div className="flex shrink-0 gap-1">
                <form action={togglePinThread}>
                  <input type="hidden" name="id" value={thread.id} />
                  <Button variant="ghost" size="icon" type="submit" title="Pin">
                    <Pin className="h-4 w-4" />
                  </Button>
                </form>
                <form action={deleteThread}>
                  <input type="hidden" name="id" value={thread.id} />
                  <Button variant="ghost" size="icon" type="submit" title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </form>
              </div>
            )}
          </div>

          {thread.lesson && (
            <Link
              href={`/learn/${thread.lesson.id}`}
              className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {thread.lesson.title}
            </Link>
          )}

          <p className="whitespace-pre-wrap text-sm">{thread.body}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {thread.replies.length} repl{thread.replies.length === 1 ? "y" : "ies"}
        </h2>
        {thread.replies.map((r) => (
          <Card
            key={r.id}
            className={r.isInstructorReply ? "border-brand/40 bg-brand/5" : ""}
          >
            <CardContent className="flex gap-3 p-4">
              <form action={upvoteReply} className="flex flex-col items-center">
                <input type="hidden" name="id" value={r.id} />
                <Button variant="ghost" size="icon" type="submit" className="h-8 w-8">
                  <ArrowBigUp className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium">{r.upvotes}</span>
              </form>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {r.user.name ?? r.user.email}
                  </span>
                  {r.isInstructorReply && (
                    <Badge variant="brand" className="text-[10px]">
                      Instructor
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {r.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{r.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply form */}
      <Card>
        <CardContent className="p-4">
          <ReplyForm threadId={thread.id} />
        </CardContent>
      </Card>
    </div>
  );
}
