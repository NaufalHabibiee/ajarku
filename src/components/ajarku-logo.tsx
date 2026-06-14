import { cn } from "@/lib/utils";

type Tone = "dark" | "adaptive";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { svg: number; word: string; tag: string }> = {
  sm: { svg: 30, word: "text-lg", tag: "text-[8px]" },
  md: { svg: 44, word: "text-3xl", tag: "text-[10px]" },
  lg: { svg: 56, word: "text-4xl", tag: "text-xs" },
};

/**
 * AjarKu brand logo: pen-nib mark (teal nib + indigo ink dot) + "AjarKu"
 * serif wordmark with an optional uppercase tagline.
 *
 * - tone "dark": white "Ajar" (use on dark backgrounds, e.g. hero banner)
 * - tone "adaptive": "Ajar" follows the theme foreground (navbar/footer)
 */
export function AjarKuLogo({
  className,
  tone = "dark",
  size = "md",
  showTagline = true,
  iconOnly = false,
}: {
  className?: string;
  tone?: Tone;
  size?: Size;
  showTagline?: boolean;
  iconOnly?: boolean;
}) {
  const s = SIZES[size];
  const svgH = s.svg;
  const svgW = Math.round((svgH * 44) / 58);

  // On a teal sidebar the nib's own teal blends in — use white when iconOnly
  // on a colored background.
  const nibFill = iconOnly && tone === "dark" ? "#FFFFFF" : "#14B8A6";
  const splitStroke = iconOnly && tone === "dark" ? "#0F8B73" : "#0F172A";
  const ventFill = iconOnly && tone === "dark" ? "#0F8B73" : "#0F172A";

  const svg = (
    <svg
      width={svgW}
      height={svgH}
      viewBox="0 0 44 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M22 3 L37 37 L7 37 Z" fill={nibFill} />
      <line
        x1="22"
        y1="9"
        x2="22"
        y2="35"
        stroke={splitStroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="22" cy="28" r="2.6" fill={ventFill} />
      <circle cx="22" cy="49" r="6.5" fill="#6366F1" />
      <circle cx="19.4" cy="46.4" r="1.7" fill="#FFFFFF" fillOpacity="0.7" />
    </svg>
  );

  if (iconOnly) return svg;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {svg}
      <div className="flex flex-col leading-none">
        <span
          className={cn(s.word, "tracking-tight")}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <span
            className={tone === "dark" ? "text-white" : "text-foreground"}
            style={{ fontWeight: 300 }}
          >
            Ajar
          </span>
          <span style={{ color: "#14B8A6", fontWeight: 700 }}>Ku</span>
        </span>
        {showTagline && (
          <span
            className={cn(s.tag, "mt-1 font-medium")}
            style={{ letterSpacing: "0.22em", color: "#475569" }}
          >
            PLATFORM KURSUS ONLINE
          </span>
        )}
      </div>
    </div>
  );
}
