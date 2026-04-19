type StockBadgeProps = {
  quantity: number;
  minStock: number;
  showDot?: boolean;
};

export function StockBadge({ quantity, minStock, showDot = true }: StockBadgeProps) {
  const isOutOfStock = quantity === 0;
  const isCritical = quantity > 0 && quantity <= Math.max(Math.floor(minStock * 0.5), 1);
  const isLow = !isCritical && quantity <= minStock;

  let className: string;
  let label: string;

  if (isOutOfStock) {
    className = "bg-rose-500/15 text-rose-400 border border-rose-500/20";
    label = "Out of Stock";
  } else if (isCritical) {
    className = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    label = "Critical";
  } else if (isLow) {
    className = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    label = "Low Stock";
  } else {
    className = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    label = "In Stock";
  }

  return (
    <span className={`badge ${className}`}>
      {showDot && (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            isOutOfStock || isCritical
              ? "bg-rose-400 animate-pulse-dot"
              : isLow
                ? "bg-amber-400"
                : "bg-emerald-400"
          }`}
        />
      )}
      {label}
    </span>
  );
}
