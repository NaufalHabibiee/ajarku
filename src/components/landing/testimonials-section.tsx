"use client";

import { useRef, useState } from "react";
import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Andi Pratama",
    text: "Strukturnya luar biasa. Dari nol sampai bisa merilis aplikasi pertama dalam hitungan minggu.",
  },
  {
    name: "Sari Wijaya",
    text: "Investasi terbaik tahun ini. Live session-nya saja sudah sangat berharga.",
  },
  {
    name: "Budi Santoso",
    text: "Jelas, praktis, dan instrukturnya benar-benar menjawab pertanyaan di forum.",
  },
  {
    name: "Maya Lestari",
    text: "Materinya mudah diikuti dan komunitasnya sangat suportif. Sangat direkomendasikan!",
  },
];

const PASTELS = [
  "bg-rose-200 text-rose-700",
  "bg-sky-200 text-sky-700",
  "bg-amber-200 text-amber-700",
  "bg-violet-200 text-violet-700",
  "bg-emerald-200 text-emerald-700",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PASTELS[Math.abs(h) % PASTELS.length];
}

export function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.85));
    setActive(Math.min(TESTIMONIALS.length - 1, Math.max(0, idx)));
  }

  function scrollTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section className="bg-gradient-to-b from-ajar-teal/[0.04] to-ajar-indigo/[0.04] py-20">
      <div className="container">
        <Reveal className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Apa kata siswa</h2>
        </Reveal>

        {/* Mobile: swipeable carousel / Desktop: grid */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4"
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="relative min-w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg md:min-w-0"
            >
              <Quote className="absolute -right-2 -top-2 h-20 w-20 text-muted/30" />
              <div className="relative">
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-current drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                    />
                  ))}
                </div>
                <p className="text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                      avatarColor(t.name)
                    )}
                  >
                    {t.name.charAt(0)}
                  </span>
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators (mobile only) */}
        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Testimoni ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                active === i ? "w-6 bg-ajar-teal" : "w-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
