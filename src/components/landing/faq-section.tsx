import { Reveal } from "@/components/landing/reveal";
import { FaqAccordion, type FaqItem } from "@/components/landing/faq-accordion";

export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="faq" className="border-t bg-muted/30 py-20">
      <div className="container">
        <Reveal className="mb-10 text-center">
          <h2 className="text-3xl font-bold">
            Pertanyaan yang Sering Ditanyakan
          </h2>
        </Reveal>
        <Reveal delay={80} className="mx-auto max-w-2xl">
          <FaqAccordion items={items} />
        </Reveal>
      </div>
    </section>
  );
}
