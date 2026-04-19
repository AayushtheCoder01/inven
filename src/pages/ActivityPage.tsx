import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency, formatRelativeTime } from "../lib/format";

export function ActivityPage() {
  const { adjustments } = useInventory();

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-slate-100">Activity</h1>
        <p className="mt-1 text-sm text-slate-500">All stock changes across your inventory</p>
      </div>

      {adjustments.length > 0 ? (
        <div className="glass-panel divide-y divide-white/[0.04] animate-fade-in">
          {adjustments.map((a) => (
            <Link
              key={a.id}
              to={`/inventory/${a.productId}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-dark-750/30"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                a.type === "add" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}>
                {a.type === "add" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200">{a.productName}</p>
                <p className="text-xs text-slate-500">{a.reason}</p>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${a.type === "add" ? "text-emerald-400" : "text-rose-400"}`}>
                  {a.type === "add" ? "+" : "−"}{a.quantity}
                </p>
                {a.type === "subtract" && (
                  <p className="text-[11px] text-slate-500">{formatCurrency(a.quantity * a.unitPrice)}</p>
                )}
              </div>

              <span className="hidden sm:block shrink-0 text-xs text-slate-600 w-20 text-right">
                {formatRelativeTime(a.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activity yet"
          description="Stock changes will appear here when you use the +/− buttons on your products."
        />
      )}
    </div>
  );
}
