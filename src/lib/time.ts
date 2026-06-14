// Time helpers. All "day" logic is computed in WIB (Asia/Jakarta, UTC+7, no DST).

const TZ = "Asia/Jakarta";

/** "YYYY-MM-DD" for the given date in WIB. */
export function wibDayKey(date: Date | number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Weekday index in WIB, 0 = Monday … 6 = Sunday. */
export function wibWeekdayIndex(date: Date | number): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[wd] ?? 0;
}

/** The 7 WIB day keys (Mon…Sun) of the week containing `date`. */
export function wibWeekDayKeys(date: Date | number = new Date()): string[] {
  const base = typeof date === "number" ? date : date.getTime();
  const idx = wibWeekdayIndex(base);
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    keys.push(wibDayKey(base + (i - idx) * 86_400_000));
  }
  return keys;
}

/** Indonesian short weekday labels for the bar chart. */
export const WEEKDAY_LABELS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Indonesian short month labels. */
export const MONTH_LABELS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/** { year, month (0-11) } for a date in WIB. */
export function wibYearMonth(date: Date | number): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  })
    .format(date)
    .split("-");
  return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
}

/** "Senin, 16 Juni 2026 • 19:00 WIB" */
export function formatWIBDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} • ${timePart} WIB`;
}

/** Relative time in Indonesian: "Baru saja", "3 jam lalu", "2 hari lalu". */
export function relativeTimeID(date: Date): string {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "Baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} bulan lalu`;
  return `${Math.floor(mo / 12)} tahun lalu`;
}

/** Google Calendar "add event" link. Defaults to a 1-hour event. */
export function googleCalendarLink(opts: {
  title: string;
  start: Date;
  end?: Date;
  details?: string;
  location?: string;
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = opts.end ?? new Date(opts.start.getTime() + 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(end)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
