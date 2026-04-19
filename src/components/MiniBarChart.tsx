type BarItem = {
  label: string;
  value: number;
  color?: string;
};

type MiniBarChartProps = {
  items: BarItem[];
  height?: number;
  barColor?: string;
};

export function MiniBarChart({ items, height = 140, barColor = "#10b981" }: MiniBarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {items.map((item, idx) => {
        const barHeight = (item.value / max) * (height - 28);
        const color = item.color ?? barColor;

        return (
          <div key={item.label} className="group flex flex-1 flex-col items-center gap-1">
            {/* Tooltip */}
            <div className="mb-1 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-md bg-dark-600 px-2 py-1 text-[10px] font-semibold text-slate-300 shadow-lg">
                {item.value}
              </span>
            </div>
            {/* Bar */}
            <div
              className="w-full min-w-[18px] max-w-[36px] rounded-t-lg transition-all duration-300 group-hover:opacity-90"
              style={{
                height: barHeight,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}30`,
                animationDelay: `${idx * 80}ms`,
                animation: "bar-grow 0.6s ease-out both",
                transformOrigin: "bottom",
              }}
            />
            {/* Label */}
            <span className="w-full truncate text-center text-[10px] text-slate-500">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
