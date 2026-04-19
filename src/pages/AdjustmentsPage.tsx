import { ArrowDown, ArrowUp, ArrowUpRight, ArrowDownRight, Save, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency, formatDateTime, formatRelativeTime } from "../lib/format";
import type { AdjustmentType } from "../types";

const quickReasons = [
  "Fresh supplier stock received",
  "Counter sale",
  "Sold to customer",
  "Damaged item removed",
  "Repair workshop use",
  "Returned item restocked",
  "Festival season correction",
  "Inventory audit fix",
];

export function AdjustmentsPage() {
  const { adjustStock, adjustments, products, showToast } = useInventory();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [type, setType] = useState<AdjustmentType>("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!barcodeInput.trim()) return;
    const match = products.find(
      (p) => p.sku.toLowerCase() === barcodeInput.trim().toLowerCase(),
    );
    if (match) {
      setSelectedProductId(match.id);
      showToast("info", "SKU Matched", `${match.sku} → ${match.name}`);
    }
  }, [barcodeInput, products]);

  useEffect(() => {
    if (!products.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(products[0]?.id ?? "");
    }
  }, [products, selectedProductId]);

  const selected = products.find((p) => p.id === selectedProductId);
  const projected = selected
    ? type === "add"
      ? selected.currentQty + quantity
      : selected.currentQty - quantity
    : 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = adjustStock({ productId: selectedProductId, type, quantity, reason });

    if (result.ok) {
      showToast("success", "Stock Updated", result.message);
      setQuantity(1);
      setReason("");
      setBarcodeInput("");
    } else {
      showToast("error", "Update Failed", result.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Control"
        description="Add or reduce stock quantities with a full audit trail. Every change creates a log entry."
        badge={`${adjustments.length} records`}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* ── Form ── */}
        <div className="glass-panel p-6 animate-fade-in">
          <h2 className="font-display text-lg font-bold text-slate-200 mb-5">
            New Stock Adjustment
          </h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Barcode */}
            <div>
              <label className="field-label">Quick SKU Lookup</label>
              <div className="relative">
                <ScanLine className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input className="field pl-10 font-mono" value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or type exact SKU code" />
              </div>
            </div>

            {/* Product select */}
            <div>
              <label className="field-label">Product</label>
              <select className="field" value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — {p.currentQty} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Type toggle */}
            <div>
              <label className="field-label">Action</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setType("add")}
                  className={`btn-secondary py-3 ${
                    type === "add"
                      ? "!border-emerald-500/30 !bg-emerald-500/10 !text-emerald-400"
                      : ""
                  }`}>
                  <ArrowUp size={16} /> Add Stock
                </button>
                <button type="button" onClick={() => setType("subtract")}
                  className={`btn-secondary py-3 ${
                    type === "subtract"
                      ? "!border-rose-500/30 !bg-rose-500/10 !text-rose-400"
                      : ""
                  }`}>
                  <ArrowDown size={16} /> Sell / Reduce
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="field-label">Quantity</label>
              <input className="field" type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>

            {/* Quick reasons */}
            <div>
              <label className="field-label">Quick Reason</label>
              <div className="flex flex-wrap gap-2">
                {quickReasons
                  .filter((r) => {
                    if (type === "add") return r.includes("stock") || r.includes("Return") || r.includes("audit");
                    return !r.includes("received") && !r.includes("restock");
                  })
                  .slice(0, 5)
                  .map((r) => (
                  <button key={r} type="button"
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      reason === r
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/[0.06] bg-dark-750/40 text-slate-400 hover:border-white/[0.12] hover:text-slate-300"
                    }`}
                    onClick={() => setReason(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom reason */}
            <div>
              <label className="field-label">Reason Note</label>
              <textarea className="field-textarea min-h-[80px]" value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why the stock level is changing..." />
            </div>

            <button type="submit" className="btn-primary w-full sm:w-auto">
              <Save size={16} /> Save Adjustment
            </button>
          </form>
        </div>

        {/* ── Preview + History ── */}
        <div className="space-y-4">
          {/* Live preview */}
          <div className="glass-panel p-6 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-slate-200 mb-4">
              Impact Preview
            </h2>
            {selected ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-dark-750/50 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Product</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200 truncate">{selected.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">{selected.sku}</p>
                  </div>
                  <div className="rounded-xl bg-dark-750/50 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Current</p>
                    <p className="mt-1 font-display text-2xl font-bold text-slate-200">
                      {selected.currentQty}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 ${
                    projected < 0
                      ? "bg-rose-500/10 border border-rose-500/15"
                      : projected <= selected.minStock
                        ? "bg-amber-500/10 border border-amber-500/15"
                        : "bg-emerald-500/10 border border-emerald-500/15"
                  }`}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">After</p>
                    <p className={`mt-1 font-display text-2xl font-bold ${
                      projected < 0 ? "text-rose-400"
                        : projected <= selected.minStock ? "text-amber-400"
                        : "text-emerald-400"
                    }`}>
                      {projected}
                    </p>
                  </div>
                </div>

                {type === "subtract" && (
                  <div className="mt-4 rounded-xl bg-dark-750/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Sale Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Revenue</p>
                        <p className="font-semibold text-blue-400">{formatCurrency(quantity * selected.price)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Profit</p>
                        <p className="font-semibold text-emerald-400">
                          {formatCurrency(quantity * (selected.price - selected.cost))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-3 text-xs text-slate-500">
                  <span>Supplier: <span className="text-slate-400">{selected.supplier}</span></span>
                  <span>Rack: <span className="text-slate-400">{selected.rackLocation}</span></span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a product to preview.</p>
            )}
          </div>

          {/* History */}
          <div className="glass-panel p-6 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-slate-200 mb-4">
              Recent Changes
            </h2>
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {adjustments.slice(0, 10).map((a) => (
                <Link
                  key={a.id}
                  to={`/products/${a.productId}`}
                  className="flex items-center gap-3 rounded-xl bg-dark-750/30 px-4 py-3 transition-colors hover:bg-dark-750/60"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    a.type === "add"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {a.type === "add" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-300">{a.productName}</p>
                    <p className="truncate text-[11px] text-slate-500">{a.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold ${
                      a.type === "add" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {a.type === "add" ? "+" : "-"}{a.quantity}
                    </span>
                    <p className="text-[10px] text-slate-600">{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </Link>
              ))}
              {adjustments.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No adjustments recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
