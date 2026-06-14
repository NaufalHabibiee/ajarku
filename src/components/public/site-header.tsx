import Link from "next/link";
import Image from "next/image";
import type { Tenant } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AjarKuLogo } from "@/components/ajarku-logo";

export async function SiteHeader({ tenant }: { tenant: Tenant }) {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {tenant.logoUrl ? (
            <>
              <Image
                src={tenant.logoUrl}
                alt={tenant.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded object-contain"
              />
              <span className="font-bold">{tenant.name}</span>
            </>
          ) : (
            <AjarKuLogo tone="adaptive" size="sm" showTagline={false} />
          )}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/#curriculum"
            className="text-muted-foreground transition-colors hover:text-ajar-teal"
          >
            Curriculum
          </Link>
          <Link
            href="/#pricing"
            className="text-muted-foreground transition-colors hover:text-ajar-teal"
          >
            Pricing
          </Link>
          {user && (
            <Link
              href="/learn"
              className="text-muted-foreground transition-colors hover:text-ajar-teal"
            >
              My Course
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <LogoutButton variant="outline" size="sm" />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-ajar-indigo text-white shadow-sm transition-all hover:bg-ajar-indigo/90 hover:shadow-md"
              >
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
