type DonutChartProps = {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
};

export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 18,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let cumulativeOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {total > 0 &&
          segments.map((seg) => {
            const pct = seg.value / total;
            const dashLength = pct * circumference;
            const dashGap = circumference - dashLength;
            const offset = cumulativeOffset;
            cumulativeOffset += dashLength;

            return (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${dashGap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{ filter: `drop-shadow(0 0 4px ${seg.color}40)` }}
              />
            );
          })}
      </svg>
      {/* Center label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="font-display text-2xl font-bold text-slate-200">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="mt-0.5 text-xs text-slate-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

type DonutLegendProps = {
  items: { label: string; value: number; color: string }[];
};

export function DonutLegend({ items }: DonutLegendProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}50` }}
          />
          <span className="text-slate-400">{item.label}</span>
          <span className="ml-auto font-semibold text-slate-300">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
