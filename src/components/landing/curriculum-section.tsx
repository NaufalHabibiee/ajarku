import { Reveal } from "@/components/landing/reveal";
import {
  CurriculumAccordion,
  type CurriculumModule,
} from "@/components/landing/curriculum-accordion";

export function CurriculumSection({
  modules,
  completedLessonIds,
  isLoggedIn,
  moduleCount,
  lessonCount,
}: {
  modules: CurriculumModule[];
  completedLessonIds: string[];
  isLoggedIn: boolean;
  moduleCount: number;
  lessonCount: number;
}) {
  return (
    <section id="curriculum" className="border-t bg-muted/30 py-20">
      <div className="container">
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Course curriculum</h2>
          <p className="mt-2 text-muted-foreground">
            {moduleCount} modul · {lessonCount} pelajaran
          </p>
        </Reveal>
        <Reveal delay={100} className="mx-auto max-w-3xl">
          {modules.length > 0 ? (
            <CurriculumAccordion
              modules={modules}
              completedLessonIds={completedLessonIds}
              isLoggedIn={isLoggedIn}
            />
          ) : (
            <p className="text-center text-muted-foreground">
              Kurikulum sedang disiapkan. Nantikan ya!
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
