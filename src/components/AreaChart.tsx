import { useMemo, useState } from "react";

type DataPoint = {
  label: string;
  value: number;
};

type AreaChartProps = {
  data: DataPoint[];
  height?: number;
  color?: string;
  formatTooltip?: (val: number) => string;
};

export function AreaChart({
  data,
  height = 240,
  color = "#10b981", // emerald-500
  formatTooltip = (val) => val.toString(),
}: AreaChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { pathDef, areaDef, points, maxY, minY } = useMemo(() => {
    if (!data || data.length === 0) return { pathDef: "", areaDef: "", points: [], maxY: 0, minY: 0 };

    const paddingY = 20;
    const paddingX = 10;
    
    // Y-axis scaling
    const values = data.map((d) => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    
    // Add 10% headroom
    const buffer = (maxVal - minVal) * 0.1 || maxVal * 0.1;
    const maxY = maxVal + buffer;
    const minY = minVal;
    
    const rangeY = maxY - minY;

    // ViewBox dimensions (using relative units 0-1000 for x)
    const viewWidth = 1000;
    const viewHeight = height;

    const xStep = (viewWidth - paddingX * 2) / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
      const x = paddingX + i * xStep;
      // y is inverted (0 is top)
      const y = viewHeight - paddingY - ((d.value - minY) / rangeY) * (viewHeight - paddingY * 2);
      return { x, y, value: d.value, label: d.label };
    });

    // Create a smooth curve
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        // Control points for cubic bezier
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p1.x - (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }

    // Area needs to close down to the bottom
    const area = `${path} L ${points[points.length - 1].x},${viewHeight} L ${points[0].x},${viewHeight} Z`;

    return { pathDef: path, areaDef: area, points, maxY, minY };
  }, [data, height]);

  if (!data || data.length === 0) return null;

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 1000 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
          
          <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor={color} stopOpacity={0.5} />
             <stop offset="50%" stopColor={color} stopOpacity={1} />
             <stop offset="100%" stopColor={color} stopOpacity={0.5} />
          </linearGradient>

          {/* Animation mask for line drawing */}
          <clipPath id="chart-reveal-mask">
            <rect x="0" y="0" width="1000" height={height}>
              <animate attributeName="width" from="0" to="1000" dur="1s" calcMode="spline" keyTimes="0; 1" keySplines="0.25 1 0.5 1" fill="freeze" />
            </rect>
          </clipPath>
        </defs>

        <g clipPath="url(#chart-reveal-mask)">
          {/* Fill Area */}
          <path
            d={areaDef}
            fill="url(#area-gradient)"
            className="transition-all duration-300"
          />

          {/* Line */}
          <path
            d={pathDef}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all duration-300"
          />
        </g>

        {/* Hover interaction layer */}
        {points.map((p, i) => {
          const hovered = hoverIdx === i;
          return (
            <g key={i}>
              {/* Invisible wide capture area for mouse */}
              <rect
                x={p.x - (i === 0 ? 0 : (p.x - points[i-1].x) / 2)}
                y="0"
                width={
                  i === 0 
                  ? (points[1]?.x - p.x) / 2 
                  : i === points.length - 1
                    ? (p.x - points[i-1].x) / 2
                    : (points[i+1].x - points[i-1].x) / 2
                }
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                className="cursor-crosshair"
              />
              
              {/* Vertical dotted line on hover */}
              {hovered && (
                <line
                  x1={p.x}
                  y1={10}
                  x2={p.x}
                  y2={height - 20}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="animate-fade-in-fast"
                />
              )}

              {/* Data points */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered ? 6 : 0}
                fill={color}
                stroke="#0f1629" // dark-850 match
                strokeWidth="3"
                className="transition-all duration-200 pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                opacity={hovered ? 1 : 0}
              />
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => {
           // Skip some labels if too many points to avoid crowding
           const showLabel = points.length < 10 || i % (Math.ceil(points.length / 7)) === 0 || i === points.length - 1;
           if (!showLabel) return null;
           
           return (
            <text
              key={`lb-${i}`}
              x={p.x}
              y={height - 2}
              fill="rgba(148, 163, 184, 0.6)"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              className="pointer-events-none select-none transition-colors"
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoverIdx !== null && points[hoverIdx] && (
        <div
          className="pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-dark-800/90 px-3 py-2 shadow-float backdrop-blur-md animate-fade-in-fast z-10 min-w-max"
          style={{ left: `${(points[hoverIdx].x / 1000) * 100}%` }}
        >
          <div className="flex items-center gap-2 mb-1">
             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
             <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{points[hoverIdx].label}</span>
          </div>
          <span className="font-display font-bold text-slate-100 text-sm">
            {formatTooltip(points[hoverIdx].value)}
          </span>
        </div>
      )}
    </div>
  );
}
