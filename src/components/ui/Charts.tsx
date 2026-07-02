"use client";

type SeriesPoint = { label: string; value: number; value2?: number };

function buildPoints(values: number[], width: number, height: number, padding = 16) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  return values.map((v, i) => {
    const x = padding + i * step;
    const y = height - padding - (v / max) * (height - padding * 2);
    return [x, y] as const;
  });
}

function linePath(points: ReadonlyArray<readonly [number, number]>) {
  if (!points.length) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
}

function areaPath(points: ReadonlyArray<readonly [number, number]>, width: number, height: number, padding = 16) {
  if (!points.length) return "";
  return `${linePath(points)} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
}

export function AreaTrendChart({ data, color = "#8b5cf6", secondaryColor = "#38bdf8", height = 220 }: { data: SeriesPoint[]; color?: string; secondaryColor?: string; height?: number; }) {
  const width = 720;
  const points = buildPoints(data.map((d) => d.value), width, height);
  const points2 = buildPoints(data.map((d) => d.value2 ?? 0), width, height);
  const hasSecond = data.some((d) => typeof d.value2 === "number");
  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-white/[0.02] p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
        <defs>
          <linearGradient id="areaPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.38" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="areaSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1="16" x2={width - 16} y1={height - 16 - (height - 32) * r} y2={height - 16 - (height - 32) * r} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 8" />
        ))}
        {hasSecond ? <path d={areaPath(points2, width, height)} fill="url(#areaSecondary)" /> : null}
        <path d={areaPath(points, width, height)} fill="url(#areaPrimary)" />
        {hasSecond ? <path d={linePath(points2)} fill="none" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" /> : null}
        <path d={linePath(points)} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        {points.map(([x, y], i) => (
          <g key={data[i].label}>
            <circle cx={x} cy={y} r="4" fill={color} />
            <text x={x} y={height - 2} textAnchor="middle" fontSize="11" fill="var(--text-3)">{data[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function GroupedBarChart({ data, firstLabel = "Series A", secondLabel = "Series B", firstColor = "#34d399", secondColor = "#fb7185", height = 220 }: { data: SeriesPoint[]; firstLabel?: string; secondLabel?: string; firstColor?: string; secondColor?: string; height?: number; }) {
  const max = Math.max(...data.flatMap((d) => [d.value, d.value2 ?? 0]), 1);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-[var(--text-3)]">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: firstColor }} />{firstLabel}</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: secondColor }} />{secondLabel}</span>
      </div>
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1 rounded-[18px] bg-white/[0.02] p-2">
              <div className="w-1/2 rounded-t-[14px]" style={{ height: `${(d.value / max) * 100}%`, background: `linear-gradient(180deg, ${firstColor}, ${firstColor}bb)` }} />
              <div className="w-1/2 rounded-t-[14px]" style={{ height: `${((d.value2 ?? 0) / max) * 100}%`, background: `linear-gradient(180deg, ${secondColor}, ${secondColor}bb)` }} />
            </div>
            <span className="text-[11px] text-[var(--text-3)]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RingLegendChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  const safeTotal = Math.max(total, 1);
  let offset = 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
      <div className="flex justify-center">
        <svg viewBox="0 0 140 140" className="h-40 w-40">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
          {data.map((item) => {
            const length = (item.value / safeTotal) * circumference;
            const dash = `${length} ${circumference - length}`;
            const node = (
              <circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += length;
            return node;
          })}
          <text x="70" y="66" textAnchor="middle" fontSize="14" fill="var(--text-3)">Total</text>
          <text x="70" y="86" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--text)">{Math.round(total)}</text>
        </svg>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span className="truncate text-[var(--text-2)]">{item.label}</span></div>
              <div className="text-right"><div className="font-semibold">{item.value.toLocaleString()}</div><div className="text-xs text-[var(--text-3)]">{Math.round((item.value / safeTotal) * 100)}%</div></div>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06]"><div className="h-2 rounded-full" style={{ width: `${(item.value / safeTotal) * 100}%`, background: item.color }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
