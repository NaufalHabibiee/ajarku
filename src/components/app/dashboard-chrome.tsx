"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
  CreditCard,
  User as UserIcon,
  Shield,
  LogOut,
  Menu,
  X,
  Search,
  ChevronLeft,
} from "lucide-react";
import { SidebarLogo } from "@/components/app/sidebar-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NotificationBell,
  type BellNotification,
} from "@/components/notifications/notification-bell";
import { signOut } from "@/app/(auth)/actions";
import { avatarColor, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "My Course", icon: BookOpen },
  { href: "/community", label: "Komunitas", icon: Users },
  { href: "/live", label: "Live Sessions", icon: Video },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const TEAL_GRADIENT = "linear-gradient(to bottom, #14B8A6, #0F8B73)";
const STORAGE_KEY = "ajar-sidebar-collapsed";

export function DashboardChrome({
  user,
  notifications,
  unreadCount,
  children,
}: {
  user: { name: string | null; email: string; role: string };
  notifications: BellNotification[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const nav = isAdmin
    ? [...NAV, { href: "/admin", label: "Admin", icon: Shield }]
    : NAV;

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(search ? `/community?q=${encodeURIComponent(search)}` : "/community");
    setOpen(false);
  }

  function renderSidebar(isCollapsed: boolean, variant: "desktop" | "drawer") {
    return (
      <div
        className="flex h-full flex-col gap-2 p-3 text-white"
        style={{ background: TEAL_GRADIENT }}
      >
        {/* Header: logo + toggle/close */}
        <div
          className={cn(
            "mb-2 flex",
            isCollapsed ? "flex-col items-center gap-3 py-2" : "items-center justify-between px-2 py-1"
          )}
        >
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            aria-label="AjarKu"
          >
            <SidebarLogo collapsed={isCollapsed} />
          </Link>
          {variant === "drawer" ? (
            <button
              type="button"
              className="rounded-md p-1 hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md p-1.5 text-white/90 transition-colors hover:bg-white/10"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isCollapsed && "rotate-180"
                )}
              />
            </button>
          )}
        </div>

        <div className="mx-2 mb-1 border-t border-white/20" />

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                title={isCollapsed ? label : undefined}
                className={cn(
                  "group relative flex items-center rounded-lg border-l-[3px] text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
                  active
                    ? "border-white bg-white/15 text-white"
                    : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{label}</span>}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 lg:block">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="mt-2">
          <button
            type="submit"
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
              "group relative flex w-full items-center rounded-lg border-l-[3px] border-transparent text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
              isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 lg:block">
                Logout
              </span>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 ease-in-out lg:block",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {renderSidebar(collapsed, "desktop")}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl">
            {renderSidebar(false, "drawer")}
          </div>
        </div>
      )}

      {/* Content column */}
      <div
        className={cn(
          "transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-muted lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <form onSubmit={onSearch} className="relative hidden flex-1 sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari diskusi…"
                className="h-10 w-full max-w-md rounded-lg border border-input bg-muted/40 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ajar-teal"
              />
            </form>

            <div className="ml-auto flex items-center gap-2">
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                    avatarColor(user.name ?? user.email)
                  )}
                >
                  {initials(user.name, user.email)}
                </span>
                <span className="hidden text-sm font-medium md:inline">
                  {user.name ?? user.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
