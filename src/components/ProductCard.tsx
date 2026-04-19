import { ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency } from "../lib/format";
import { StockBadge } from "./StockBadge";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const { adjustStock, showToast } = useInventory();
  const [qty, setQty] = useState(1);

  const handleAdjust = (type: "add" | "subtract") => {
    const result = adjustStock({
      productId: product.id,
      type,
      quantity: qty,
      reason: type === "subtract" ? "Sold" : "Stock added",
    });

    if (result.ok) {
      showToast(
        "success",
        type === "subtract" ? `Sold ${qty} × ${product.name}` : `Added ${qty} × ${product.name}`,
      );
    } else {
      showToast("error", "Failed", result.message);
    }
  };

  return (
    <div className="glass-panel group relative overflow-hidden p-5 transition-all duration-300 hover:border-white/[0.12]">
      {/* Top: name + badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Link
            to={`/inventory/${product.id}`}
            className="font-display text-base font-bold text-slate-200 hover:text-emerald-400 transition-colors leading-tight block"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            {product.brand} • {product.category}
          </p>
        </div>
        <StockBadge quantity={product.currentQty} minStock={product.minStock} />
      </div>

      {/* Stock display */}
      <div className="mb-4 rounded-xl bg-dark-750/60 px-4 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-display text-3xl font-bold text-slate-100">
              {product.currentQty}
            </span>
            <span className="ml-1.5 text-sm text-slate-500">{product.unit}</span>
          </div>
          <span className="text-sm text-slate-500">{formatCurrency(product.price)}</span>
        </div>
      </div>

      {/* +/− controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAdjust("subtract")}
          disabled={product.currentQty < qty}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={18} />
        </button>

        <input
          type="number"
          min="1"
          max={999}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="h-10 flex-1 rounded-xl border border-white/[0.06] bg-dark-700/50 text-center text-sm font-semibold text-slate-200 outline-none focus:border-emerald-500/40"
        />

        <button
          onClick={() => handleAdjust("add")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* View detail link */}
      <Link
        to={`/inventory/${product.id}`}
        className="mt-3 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-slate-500 transition-colors hover:text-emerald-400"
      >
        View details <ChevronRight size={12} />
      </Link>
    </div>
  );
}
