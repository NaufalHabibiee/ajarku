import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { ThreadForm } from "@/components/community/thread-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "New thread" };

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: { lessonId?: string };
}) {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/community">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to community
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">Start a discussion</h1>
      <ThreadForm lessonId={searchParams.lessonId} />
    </div>
  );
}
