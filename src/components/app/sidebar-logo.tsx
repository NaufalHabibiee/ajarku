import { cn } from "@/lib/utils";

/**
 * Horizontal AjarKu logo for the (teal) sidebar: a 40×40 pen-nib icon (white
 * triangle + gold ink dot) on the left, "AjarKu" wordmark on the right (white
 * "Ajar" + gold "Ku"). The wordmark fades/collapses away when the sidebar is
 * collapsed; the icon stays visible.
 */
export function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: collapsed ? "0px" : "12px" }}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Pen nib — white triangle */}
        <path d="M20 5 L33 26 L7 26 Z" fill="#FFFFFF" />
        {/* Center split line + vent hole (darker teal for definition) */}
        <line
          x1="20"
          y1="9"
          x2="20"
          y2="24"
          stroke="#0F8B73"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="1.8" fill="#0F8B73" />
        {/* Ink dot — gold */}
        <circle cx="20" cy="33" r="5" fill="#FBBF24" />
        <circle cx="18" cy="31" r="1.3" fill="#FFFFFF" fillOpacity="0.75" />
      </svg>

      <span
        className={cn(
          "overflow-hidden whitespace-nowrap font-bold transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
        style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "16px" }}
      >
        <span style={{ color: "#FFFFFF" }}>Ajar</span>
        <span style={{ color: "#FBBF24" }}>Ku</span>
      </span>
    </div>
  );
}
