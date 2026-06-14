// Prisma-free constants shared by server queries and the client toolbar.

export type ThreadFilter =
  | "all"
  | "mine"
  | "replied"
  | "answered"
  | "unanswered";
export type ThreadSort =
  | "recent"
  | "most_replies"
  | "trending"
  | "trending_week";

export const FILTERS: { key: ThreadFilter; label: string }[] = [
  { key: "all", label: "Semua Diskusi" },
  { key: "mine", label: "Pertanyaan Saya" },
  { key: "replied", label: "Balasan Saya" },
  { key: "answered", label: "Answered" },
  { key: "unanswered", label: "Unanswered" },
];

export const SORTS: { key: ThreadSort; label: string }[] = [
  { key: "recent", label: "Terbaru" },
  { key: "most_replies", label: "Paling Banyak Dibalas" },
  { key: "trending", label: "Trending" },
  { key: "trending_week", label: "Trending Minggu Ini" },
];
