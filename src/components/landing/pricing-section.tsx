import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { formatIDR } from "@/lib/format";

const FEATURES = [
  "Akses penuh — semua modul & pelajaran",
  "Pelajaran baru ditambahkan rutin",
  "Materi & lampiran bisa diunduh",
  "Live session & rekaman",
  "Akses forum komunitas",
  "Sertifikat kelulusan",
];

export function PricingSection({ price }: { price: number }) {
  return (
    <section id="pricing" className="relative overflow-hidden border-t py-20">
      {/* Soft radial glow behind the card */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-gradient-to-br from-ajar-teal/25 to-ajar-indigo/25 blur-3xl" />
      </div>

      <div className="container">
        <Reveal className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Harga sederhana</h2>
          <p className="mt-2 text-muted-foreground">
            Satu langganan, akses penuh.
          </p>
        </Reveal>

        <Reveal delay={80} className="mx-auto w-full max-w-md">
          {/* Gradient border wrapper */}
          <div className="rounded-2xl bg-gradient-to-r from-ajar-teal to-ajar-indigo p-[1.5px] shadow-xl">
            <div className="relative rounded-2xl bg-card p-8">
              {/* Best value ribbon */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-ajar-teal to-ajar-indigo px-4 py-1 text-xs font-semibold text-white shadow">
                Best Value
              </span>

              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Langganan bulanan
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  {formatIDR(price)}
                </span>
                <span className="text-sm text-muted-foreground">/bulan</span>
              </div>

              <ul className="mt-6 space-y-3">
                {FEATURES.map((f, i) => (
                  <Reveal as="li" key={f} delay={120 + i * 70}>
                    <span className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ajar-teal/15 text-ajar-teal">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {f}
                    </span>
                  </Reveal>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center rounded-md bg-ajar-teal px-6 py-3 font-semibold text-white shadow-lg shadow-ajar-teal/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-ajar-teal/40"
              >
                Subscribe Now
              </Link>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Batalkan kapan saja • Pembayaran aman via Midtrans
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
