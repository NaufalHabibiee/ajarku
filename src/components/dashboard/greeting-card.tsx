import { Flame, Clock, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getWeeklyStats } from "@/lib/dashboard";

function wibHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
    10
  );
}

function wibDateLabel(): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export async function GreetingCard() {
  const user = await requireUser();
  const weekly = await getWeeklyStats(user.id);

  const hour = wibHour();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
        ? "Selamat siang"
        : hour < 19
          ? "Selamat sore"
          : "Selamat malam";
  const emoji = hour < 11 ? "🌅" : hour < 19 ? "☀️" : "🌙";
  const name = user.name?.split(" ")[0] ?? "Pelajar";

  const pills = [
    { icon: Flame, label: `${user.currentStreak} hari streak`, tint: "text-orange-500" },
    { icon: Clock, label: `${weekly.minutesThisWeek} menit minggu ini`, tint: "text-ajar-teal" },
    {
      icon: CheckCircle2,
      label: `${weekly.lessonsThisWeek} pelajaran minggu ini`,
      tint: "text-ajar-indigo",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-ajar-indigo/10 via-card to-ajar-teal/10 p-6 dark:from-ajar-indigo/15 dark:to-ajar-teal/15">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ajar-teal/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{wibDateLabel()}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {greeting}, {name}! {emoji}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {pills.map(({ icon: Icon, label, tint }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur"
            >
              <Icon className={`h-3.5 w-3.5 ${tint}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GreetingCardSkeleton() {
  return <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />;
}
