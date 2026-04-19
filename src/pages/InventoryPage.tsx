import { Filter, Plus, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { ProductFormModal } from "../components/ProductFormModal";
import { useInventory } from "../context/InventoryContext";
import type { ProductDraft } from "../types";

export function InventoryPage() {
  const { products, addProduct, showToast } = useInventory();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats)].sort();
  }, [products]);

  const statuses = ["All", "In Stock", "Low Stock", "Out of Stock"];

  const filtered = useMemo(() => {
    let result = products;

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (status === "Low Stock") {
      result = result.filter((p) => p.currentQty > 0 && p.currentQty <= p.minStock);
    } else if (status === "Out of Stock") {
      result = result.filter((p) => p.currentQty === 0);
    } else if (status === "In Stock") {
      result = result.filter((p) => p.currentQty > p.minStock);
    }

    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, deferredSearch, category, status]);

  const handleAdd = (draft: ProductDraft) => {
    addProduct(draft);
    showToast("success", "Product added", `${draft.name} is now in inventory.`);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} products • Use +/− to adjust stock
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Basic Filters & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.04] bg-dark-800/40 p-2 sm:flex-row sm:items-center animate-fade-in">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            className="h-11 w-full bg-transparent pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-500"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="h-px w-full bg-white/[0.04] sm:h-8 sm:w-px" />
        <div className="flex items-center gap-2 px-2 sm:px-0">
          <Filter size={14} className="ml-2 hidden text-slate-500 sm:block" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-xl bg-transparent px-3 text-sm font-medium text-slate-300 outline-none hover:bg-white/[0.04] focus:bg-dark-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-xl bg-transparent px-3 text-sm font-medium text-slate-300 outline-none hover:bg-white/[0.04] focus:bg-dark-700"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter pills visualization (optional but nice) */}
      {(category !== "All" || status !== "All") && (
        <div className="flex items-center gap-2 animate-fade-in-fast -mt-2">
          <span className="text-xs text-slate-500">Active filters:</span>
          {category !== "All" && (
            <span className="badge border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              {category}
            </span>
          )}
          {status !== "All" && (
            <span className={`badge border ${
              status === "Low Stock" ? "border-amber-500/20 bg-amber-500/10 text-amber-400" :
              status === "Out of Stock" ? "border-rose-500/20 bg-rose-500/10 text-rose-400" :
              "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            }`}>
              {status}
            </span>
          )}
          <button
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors ml-1"
            onClick={() => { setCategory("All"); setStatus("All"); }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products found"
          description={search || category !== "All" || status !== "All" 
            ? "Try adjusting your search or filters." 
            : "Add your first product to get started."}
          action={
            (!search && category === "All" && status === "All") ? (
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Add Product
              </button>
            ) : (
              <button className="btn-secondary" onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }}>
                Clear Filters
              </button>
            )
          }
        />
      )}

      <ProductFormModal
        open={modalOpen}
        products={products}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}
