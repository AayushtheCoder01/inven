import { ArrowDownRight, ArrowLeft, ArrowUpRight, Boxes, ChevronRight, Edit3, IndianRupee, Minus, Package, Plus, ShoppingCart, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { ProductFormModal } from "../components/ProductFormModal";
import { StockBadge } from "../components/StockBadge";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency, formatRelativeTime } from "../lib/format";
import type { ProductDraft } from "../types";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, getProductById, getProductAdjustments, getProductSalesStats, updateProduct, deleteProduct, adjustStock, showToast } = useInventory();

  const product = getProductById(productId ?? "");
  const adjustments = getProductAdjustments(productId ?? "");
  const stats = getProductSalesStats(productId ?? "");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been deleted."
        action={<Link to="/inventory" className="btn-primary"><ArrowLeft size={16} /> Back</Link>}
      />
    );
  }

  const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;

  const handleAdjust = (type: "add" | "subtract") => {
    const result = adjustStock({ productId: product.id, type, quantity: qty, reason: type === "subtract" ? "Sold" : "Stock added" });
    if (result.ok) showToast("success", type === "subtract" ? `Sold ${qty}` : `Added ${qty}`);
    else showToast("error", "Failed", result.message);
  };

  const handleEdit = (draft: ProductDraft) => {
    updateProduct(product.id, draft);
    showToast("success", "Updated", `${draft.name} saved.`);
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    showToast("info", "Deleted", `${product.name} removed.`);
    navigate("/inventory");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in">
        <Link to="/inventory" className="hover:text-slate-300 transition-colors">Inventory</Link>
        <ChevronRight size={14} />
        <span className="text-slate-300">{product.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-slate-100">{product.name}</h1>
            <StockBadge quantity={product.currentQty} minStock={product.minStock} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {product.sku} • {product.brand} • {product.category}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="btn-secondary text-sm" onClick={() => setEditOpen(true)}>
            <Edit3 size={14} /> Edit
          </button>
          <button className="btn-danger text-sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Quick stats + Controls */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Boxes size={14} /> Current Stock</div>
          <p className="font-display text-2xl font-bold text-slate-100">{product.currentQty} <span className="text-sm text-slate-500">{product.unit}</span></p>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><ShoppingCart size={14} /> Total Sold</div>
          <p className="font-display text-2xl font-bold text-slate-100">{stats.totalSold} <span className="text-sm text-slate-500">units</span></p>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><IndianRupee size={14} /> Revenue</div>
          <p className="font-display text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><TrendingUp size={14} /> Margin</div>
          <p className="font-display text-2xl font-bold text-slate-100">{margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Adjust stock inline */}
      <div className="glass-panel p-5 animate-fade-in">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Quick Adjust</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => handleAdjust("subtract")} disabled={product.currentQty < qty}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95 disabled:opacity-30">
            <Minus size={18} />
          </button>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="h-11 w-20 rounded-xl border border-white/[0.06] bg-dark-700/50 text-center text-sm font-semibold text-slate-200 outline-none focus:border-emerald-500/40" />
          <button onClick={() => handleAdjust("add")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95">
            <Plus size={18} />
          </button>
          <span className="text-xs text-slate-500 ml-2">
            Sell (−) or restock (+)
          </span>
        </div>
      </div>

      {/* Product info + Change log side by side */}
      <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
        {/* Info */}
        <div className="glass-panel p-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Details</h2>
          <div className="space-y-3 text-sm">
            {[
              ["Price", formatCurrency(product.price)],
              ["Cost", formatCurrency(product.cost)],
              ["Profit/unit", formatCurrency(product.price - product.cost)],
              ["Min stock", `${product.minStock} ${product.unit}`],
              ["Supplier", product.supplier],
              ["Location", product.rackLocation],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-white/[0.03]">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-medium">{value}</span>
              </div>
            ))}
            {product.notes && (
              <p className="pt-2 text-xs leading-relaxed text-slate-500 italic">"{product.notes}"</p>
            )}
          </div>
        </div>

        {/* Change log */}
        <div className="glass-panel p-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Change Log
            <span className="ml-2 badge bg-dark-700 text-slate-500 border border-white/[0.06]">{adjustments.length}</span>
          </h2>

          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {adjustments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-dark-750/40 transition-colors">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  a.type === "add" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {a.type === "add" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${a.type === "add" ? "text-emerald-400" : "text-rose-400"}`}>
                      {a.type === "add" ? "+" : "−"}{a.quantity}
                    </span>
                    <span className="text-xs text-slate-500">{a.previousQty} → {a.newQty}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{a.reason}</p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600">{formatRelativeTime(a.createdAt)}</span>
              </div>
            ))}
            {adjustments.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-600">No changes yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal open={editOpen} product={product} products={products}
        onClose={() => setEditOpen(false)} onSubmit={handleEdit} />
      <ConfirmDialog open={deleteOpen} title="Delete product"
        message={`Remove "${product.name}" from inventory? This can't be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </div>
  );
}
