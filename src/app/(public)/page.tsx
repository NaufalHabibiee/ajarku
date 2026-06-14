import { getTenant } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";
import { getTenantCourse, courseStats } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { LandingHero } from "@/components/landing/hero";
import { InstructorSection } from "@/components/landing/instructor-section";
import { CurriculumSection } from "@/components/landing/curriculum-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const tenant = await getTenant();

  if (!tenant) {
    return (
      <section className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-4xl font-bold">White-label course platform</h1>
        <p className="max-w-md text-muted-foreground">
          Each instructor gets their own branded course site. Visit a tenant
          subdomain to see it in action.
        </p>
      </section>
    );
  }

  const [course, user, faqs] = await Promise.all([
    getTenantCourse(tenant.id),
    getCurrentUser(),
    prisma.fAQ.findMany({
      where: { tenantId: tenant.id },
      orderBy: { order: "asc" },
    }),
  ]);

  const stats = course
    ? courseStats(course)
    : { moduleCount: 0, lessonCount: 0, freeLessonCount: 0, totalSeconds: 0 };

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const firstFreeLesson = allLessons.find((l) => l.isFree && l.videoId) ??
    allLessons.find((l) => l.isFree);

  // Per-module progress for logged-in students.
  let completedLessonIds: string[] = [];
  if (user && allLessons.length > 0) {
    const progress = await prisma.progress.findMany({
      where: {
        userId: user.id,
        completedAt: { not: null },
        lessonId: { in: allLessons.map((l) => l.id) },
      },
      select: { lessonId: true },
    });
    completedLessonIds = progress.map((p) => p.lessonId);
  }

  const modules =
    course?.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        isFree: l.isFree,
        videoDuration: l.videoDuration,
      })),
    })) ?? [];

  return (
    <>
      <LandingHero
        title={course?.title ?? tenant.name}
        description={
          course?.description ??
          "Belajar dengan kurikulum terstruktur berbasis proyek, sesuai ritmemu."
        }
        thumbnailUrl={course?.thumbnailUrl ?? null}
        previewLessonId={firstFreeLesson?.id ?? null}
        stats={stats}
      />

      <InstructorSection tenantName={tenant.name} />

      <CurriculumSection
        modules={modules}
        completedLessonIds={completedLessonIds}
        isLoggedIn={Boolean(user)}
        moduleCount={stats.moduleCount}
        lessonCount={stats.lessonCount}
      />

      <TestimonialsSection />

      <PricingSection price={tenant.subscriptionPrice} />

      <FaqSection
        items={faqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        }))}
      />
    </>
  );
}
