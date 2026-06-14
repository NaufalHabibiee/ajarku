"use client";

import { useState } from "react";

type Bar = { label: string; minutes: number };

export function LearningStatChart({
  weekly,
  monthly,
}: {
  weekly: Bar[];
  monthly: Bar[];
}) {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const data = view === "weekly" ? weekly : monthly;

  const maxMin = Math.max(1, ...data.map((d) => d.minutes));
  const maxHours = Math.max(1, Math.ceil(maxMin / 60));
  const scaleMax = maxHours * 60;

  const colW = view === "weekly" ? 46 : 30;
  const barW = view === "weekly" ? 12 : 10;
  const width = data.length * colW;
  const chartH = 150;
  const baseY = chartH + 8;
  const totalH = baseY + 22;

  const yTicks = [0, 0.5, 1].map((f) => Math.round(maxHours * f));

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <select
          value={view}
          onChange={(e) => setView(e.target.value as "weekly" | "monthly")}
          className="rounded-full border bg-background px-3 py-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ajar-teal"
          aria-label="Periode statistik"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="flex gap-2">
        {/* Y axis */}
        <div
          className="flex flex-col justify-between pb-6 text-[10px] text-muted-foreground"
          style={{ height: totalH }}
        >
          {[...yTicks].reverse().map((h, i) => (
            <span key={i}>{h}h</span>
          ))}
        </div>

        {/* Chart */}
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <svg
            viewBox={`0 0 ${width} ${totalH}`}
            className="h-48 w-full min-w-[420px]"
            preserveAspectRatio="none"
            role="img"
            aria-label="Statistik belajar"
          >
            <defs>
              <linearGradient id="statBar" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            {/* baseline */}
            <line x1="0" y1={baseY} x2={width} y2={baseY} className="stroke-border" strokeWidth="1" />
            {data.map((d, i) => {
              const h = Math.round((d.minutes / scaleMax) * chartH);
              const x = i * colW + (colW - barW) / 2;
              const y = baseY - Math.max(h, 2);
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(h, 2)}
                    rx={barW / 2}
                    fill={d.minutes > 0 ? "url(#statBar)" : "currentColor"}
                    className={d.minutes > 0 ? "" : "text-muted"}
                  />
                  <text
                    x={x + barW / 2}
                    y={baseY + 16}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10 }}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
