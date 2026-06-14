import { Users, Star, GraduationCap, Code2, Palette, Rocket } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const STATS = [
  { icon: Users, value: "500+", label: "Students" },
  { icon: Star, value: "4.9★", label: "Rating" },
  { icon: GraduationCap, value: "3 Years", label: "Teaching" },
];

const FLOATING = [
  { icon: Code2, className: "-left-2 top-4 bg-ajar-teal/10 text-ajar-teal" },
  { icon: Palette, className: "right-0 top-10 bg-ajar-indigo/10 text-ajar-indigo" },
  { icon: Rocket, className: "bottom-2 left-6 bg-amber-500/10 text-amber-500" },
];

export function InstructorSection({ tenantName }: { tenantName: string }) {
  return (
    <section className="container py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Avatar with decorative ring + floating badges */}
        <Reveal className="flex justify-center">
          <div className="relative h-56 w-56">
            <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border-2 border-dashed border-ajar-teal/40 motion-reduce:animate-none" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-ajar-teal to-ajar-indigo p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                <span className="text-5xl font-bold text-ajar-teal">
                  {tenantName.charAt(0)}
                </span>
              </div>
            </div>
            {FLOATING.map(({ icon: Icon, className }, i) => (
              <span
                key={i}
                className={`absolute flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-md ${className}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            ))}
          </div>
        </Reveal>

        {/* Bio + stats */}
        <Reveal delay={120} className="space-y-6">
          <div className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-ajar-teal">
              Instruktur
            </span>
            <h2 className="text-3xl font-bold">Belajar dari ahlinya</h2>
            <p className="text-muted-foreground">
              Belajar langsung dari tim di balik {tenantName}. Pengalaman
              bertahun-tahun di dunia nyata diringkas menjadi jalur belajar yang
              jelas dan praktis — lengkap dengan dukungan langsung di sepanjang
              perjalananmu.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-xl border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-ajar-teal/40 hover:shadow-md"
              >
                <Icon className="mx-auto mb-1.5 h-5 w-5 text-ajar-teal" />
                <p className="text-lg font-bold leading-none">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
