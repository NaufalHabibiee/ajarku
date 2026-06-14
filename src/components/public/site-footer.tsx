import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tenant } from "@prisma/client";
import { AjarKuLogo } from "@/components/ajarku-logo";
import { NewsletterForm } from "@/components/public/newsletter-form";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ajar-indigo hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "LinkedIn",
    href: "#",
    path: "M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z",
  },
  {
    label: "Twitter",
    href: "#",
    path: "M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-7-6.1 7H1.7l8-9.2L1 2h7l4.8 6.4zm-2.4 18h1.9L7.6 4H5.6z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.8.25 2.2.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.43.37 1 .42 2.2.06 1.27.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.2-.25 1.77-.42 2.2-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.17-1 .37-2.2.42-1.27.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.2-.05-1.77-.25-2.2-.42a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.17-.43-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.2.25-1.77.42-2.2.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-1.14.05-1.76.24-2.17.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.41-.35 1.03-.4 2.17C2.4 8.5 2.4 8.85 2.4 12s0 3.5.06 4.74c.05 1.14.24 1.76.4 2.17.22.55.47.94.88 1.35.41.41.8.66 1.35.88.41.16 1.03.35 2.17.4 1.24.07 1.59.07 4.74.07s3.5 0 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.41.35-1.03.4-2.17.07-1.24.07-1.59.07-4.74s0-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 00-.88-1.35 3.6 3.6 0 00-1.35-.88c-.41-.16-1.03-.35-2.17-.4C15.5 4 15.15 4 12 4zm0 3.06A4.94 4.94 0 1012 17a4.94 4.94 0 000-9.88zm0 8.14A3.2 3.2 0 1112 8.6a3.2 3.2 0 010 6.4zm6.3-8.34a1.15 1.15 0 11-2.3 0 1.15 1.15 0 012.3 0z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23 7.5s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.8 4 12 4 12 4h-.1s-4.7 0-7.9.2c-.4 0-1.4.1-2.2 1-.7.7-.9 2.3-.9 2.3S.8 9.4.8 11.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.1 7.6.2 7.6.2s4.8 0 8-.2c.4 0 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.7 15.1V8.9l6.2 3.1z",
  },
];

export function SiteFooter({ tenant }: { tenant: Tenant }) {
  const usesAjarKu = !tenant.logoUrl;

  return (
    <footer className="border-t bg-muted/40 dark:bg-muted/20">
      <div className="container py-12">
        {/* Brand + socials */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {usesAjarKu ? (
            <AjarKuLogo tone="adaptive" size="md" />
          ) : (
            <span className="text-xl font-bold">{tenant.name}</span>
          )}
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all hover:border-ajar-teal hover:text-ajar-teal hover:shadow-[0_0_12px_rgba(20,184,166,0.35)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <hr className="my-8 border-border" />

        {/* Columns */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ajar-teal">Tentang AjarKu</h3>
            <p className="text-sm text-muted-foreground">
              Platform kursus online yang memberdayakan instruktur untuk membuat
              dan membagikan kursus berkualitas tinggi dengan siswa di seluruh
              dunia.
            </p>
            <Link
              href="/#curriculum"
              className="inline-flex items-center gap-1 text-sm font-medium text-ajar-indigo hover:underline"
            >
              Pelajari lebih lanjut <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ajar-teal">Produk</h3>
            <ul className="space-y-2">
              <FooterLink href="/#curriculum">Fitur Kursus</FooterLink>
              <FooterLink href="/#pricing">Harga</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/community">Komunitas</FooterLink>
              <FooterLink href="/live">Live Sessions</FooterLink>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ajar-teal">Dukungan</h3>
            <ul className="space-y-2">
              <FooterLink href="/#faq">FAQ</FooterLink>
              <FooterLink href="#">Hubungi Kami</FooterLink>
              <FooterLink href="#">Kebijakan Privasi</FooterLink>
              <FooterLink href="#">Syarat &amp; Ketentuan</FooterLink>
              <FooterLink href="#">Pusat Bantuan</FooterLink>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ajar-teal">Tetap Update</h3>
            <p className="text-sm text-muted-foreground">
              Dapatkan tips belajar dan update kursus terbaru.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t bg-ajar-teal/[0.06] dark:bg-ajar-teal/[0.04]">
        <div className="container py-5 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {usesAjarKu ? "AjarKu" : tenant.name}. Semua
          hak dilindungi. | Dibuat dengan{" "}
          <span className="text-rose-500">❤️</span> untuk pendidik dan pelajar
        </div>
      </div>
    </footer>
  );
}
