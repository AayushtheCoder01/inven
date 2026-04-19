import {
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  PencilLine,
  Plus,
  ScanSearch,
  Search,
  Trash2,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { ProductFormModal } from "../components/ProductFormModal";
import { StockBadge } from "../components/StockBadge";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency } from "../lib/format";
import type { Product, ProductDraft } from "../types";

type SortKey = "name" | "currentQty" | "price" | "category" | "updatedAt";
type SortDir = "asc" | "desc";

export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useInventory();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products],
  );

  /* ── Filter & Sort ── */
  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.supplier.toLowerCase().includes(q),
      );
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Status
    if (statusFilter !== "all") {
      if (statusFilter === "low") result = result.filter((p) => p.currentQty <= p.minStock);
      else if (statusFilter === "active") result = result.filter((p) => p.status === "active");
      else if (statusFilter === "discontinued") result = result.filter((p) => p.status === "discontinued");
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "currentQty": cmp = a.currentQty - b.currentQty; break;
        case "price": cmp = a.price - b.price; break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        case "updatedAt": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [products, deferredSearch, categoryFilter, statusFilter, sortKey, sortDir]);

  /* ── Handlers ── */
  const openAdd = () => { setActiveProduct(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setActiveProduct(p); setModalOpen(true); };

  const handleSave = (draft: ProductDraft) => {
    if (activeProduct) {
      updateProduct(activeProduct.id, draft);
      showToast("success", "Product Updated", `${draft.name} has been updated.`);
    } else {
      addProduct(draft);
      showToast("success", "Product Created", `${draft.name} added to inventory.`);
    }
    setModalOpen(false);
    setActiveProduct(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      showToast("info", "Product Deleted", `${deleteTarget.name} removed from inventory.`);
      setDeleteTarget(null);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your inventory listings. Add, edit, search, and track stock levels."
        badge={`${filtered.length} of ${products.length}`}
        action={
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      {/* ── Filters bar ── */}
      <div className="glass-panel p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="field-label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input className="field pl-10" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, SKU, brand, model, supplier..." />
            </div>
          </div>
          <div className="w-full lg:w-44">
            <label className="field-label">Category</label>
            <select className="field" value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-40">
            <label className="field-label">Status</label>
            <select className="field" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="low">Low Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => setViewMode("table")}
              className={`btn-icon ${viewMode === "table" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}`}>
              <List size={16} />
            </button>
            <button type="button" onClick={() => setViewMode("grid")}
              className={`btn-icon ${viewMode === "grid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}`}>
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table view ── */}
      {viewMode === "table" && filtered.length > 0 && (
        <div className="table-container overflow-x-auto animate-fade-in">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-dark-750/50 text-xs uppercase tracking-wider text-slate-500">
                {([
                  ["name", "Product"],
                  ["category", "Category"],
                  ["price", "Price"],
                  ["currentQty", "Stock"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} className="px-4 py-3">
                    <button type="button" className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                      onClick={() => toggleSort(key)}>
                      {label} <SortIcon col={key} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-white/[0.04] transition-colors hover:bg-dark-750/30">
                  <td className="px-4 py-3.5">
                    <Link to={`/products/${p.id}`} className="group">
                      <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">{p.sku}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="badge bg-dark-700 text-slate-400 border border-white/[0.06]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-200">{p.currentQty}</span>
                    <span className="text-slate-500"> {p.unit}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StockBadge quantity={p.currentQty} minStock={p.minStock} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{p.rackLocation}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/products/${p.id}`} className="btn-icon" title="View details">
                        <ScanSearch size={14} />
                      </Link>
                      <button type="button" className="btn-icon" onClick={() => openEdit(p)} title="Edit">
                        <PencilLine size={14} />
                      </button>
                      <button type="button" className="btn-icon hover:!border-rose-500/20 hover:!bg-rose-500/10 hover:!text-rose-400"
                        onClick={() => setDeleteTarget(p)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="glass-panel-hover group p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {p.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{p.sku}</p>
                </div>
                <StockBadge quantity={p.currentQty} minStock={p.minStock} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-dark-750/50 px-3 py-2">
                  <p className="text-[10px] uppercase text-slate-500">Qty</p>
                  <p className="mt-0.5 font-semibold text-slate-200">{p.currentQty} {p.unit}</p>
                </div>
                <div className="rounded-lg bg-dark-750/50 px-3 py-2">
                  <p className="text-[10px] uppercase text-slate-500">Price</p>
                  <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(p.price)}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{p.brand} • {p.category}</span>
                <span>{p.rackLocation}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filters. You can also add a new product."
          action={
            <button type="button" className="btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Product
            </button>
          }
        />
      )}

      {/* Modals */}
      <ProductFormModal
        open={modalOpen}
        product={activeProduct}
        products={products}
        onClose={() => { setModalOpen(false); setActiveProduct(null); }}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and all stock data will be lost.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
