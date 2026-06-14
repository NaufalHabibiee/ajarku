import Link from "next/link";
import { ArrowRight, BookOpen, Clock, PlayCircle, Sparkles } from "lucide-react";
import { formatDuration } from "@/lib/format";

type Props = {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  previewLessonId: string | null;
  stats: { lessonCount: number; totalSeconds: number; freeLessonCount: number };
};

export function LandingHero({
  title,
  description,
  thumbnailUrl,
  previewLessonId,
  stats,
}: Props) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Animated mesh background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 animate-blob rounded-full bg-ajar-teal/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 animate-blob rounded-full bg-ajar-indigo/20 blur-3xl [animation-delay:3s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-ajar-teal/10 blur-3xl [animation-delay:6s]" />
      </div>

      <div className="container grid gap-10 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <div className="flex flex-col justify-center gap-6">
          <span
            className="inline-flex w-fit animate-fade-up items-center gap-1.5 rounded-full border border-ajar-teal/30 bg-ajar-teal/10 px-3 py-1 text-sm font-medium text-ajar-teal"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Kursus Online
          </span>
          <h1
            className="animate-fade-up text-balance text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            {title}
          </h1>
          <p
            className="animate-fade-up text-balance text-lg text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            {description}
          </p>
          <div
            className="flex animate-fade-up flex-wrap gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center rounded-md bg-ajar-teal px-6 py-3 font-medium text-white shadow-lg shadow-ajar-teal/30 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-ajar-teal/40"
            >
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#curriculum"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background/60 px-6 py-3 font-medium backdrop-blur transition-colors hover:border-ajar-indigo hover:bg-ajar-indigo hover:text-white"
            >
              View Curriculum
            </Link>
          </div>
        </div>

        {/* Video / preview */}
        <div
          className="flex animate-fade-up items-center justify-center"
          style={{ animationDelay: "200ms" }}
        >
          <PreviewCard
            thumbnailUrl={thumbnailUrl}
            previewLessonId={previewLessonId}
            title={title}
          />
        </div>
      </div>

      {/* Floating stats bar */}
      <div className="container relative">
        <div className="absolute inset-x-0 -bottom-12 mx-auto grid max-w-2xl grid-cols-3 gap-3 px-4 sm:gap-4">
          <StatPill
            icon={<BookOpen className="h-4 w-4" />}
            value={`${stats.lessonCount}`}
            label="Lessons"
          />
          <StatPill
            icon={<Clock className="h-4 w-4" />}
            value={formatDuration(stats.totalSeconds)}
            label="Content"
          />
          <StatPill
            icon={<PlayCircle className="h-4 w-4" />}
            value={`${stats.freeLessonCount}`}
            label="Free Lessons"
          />
        </div>
      </div>
      <div className="h-12" />
    </section>
  );
}

function PreviewCard({
  thumbnailUrl,
  previewLessonId,
  title,
}: {
  thumbnailUrl: string | null;
  previewLessonId: string | null;
  title: string;
}) {
  const inner = (
    <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-ajar-teal/15 via-background to-ajar-indigo/15 shadow-xl">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : null}
      <span className="absolute left-3 top-3 rounded-full bg-ajar-indigo px-2.5 py-1 text-xs font-semibold text-white shadow">
        Preview
      </span>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-ajar-teal/40" />
          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-ajar-teal text-white shadow-lg transition-transform group-hover:scale-110">
            <PlayCircle className="h-8 w-8" />
          </span>
        </span>
      </div>
    </div>
  );

  return previewLessonId ? (
    <Link href={`/preview/${previewLessonId}`} className="w-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-background/90 px-2 py-3 text-center shadow-md backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ajar-teal/10 text-ajar-teal">
        {icon}
      </span>
      <span className="text-sm font-bold leading-none sm:text-base">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
