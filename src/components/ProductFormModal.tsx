import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { Product, ProductDraft } from "../types";

type Props = {
  open: boolean;
  product?: Product | null;
  products: Product[];
  onClose: () => void;
  onSubmit: (draft: ProductDraft) => void;
};

const categories = ["Speakers", "Microphones", "Amplifiers", "Mixers", "Cables", "Accessories", "Lighting", "Other"];

const empty: ProductDraft = {
  name: "", sku: "", category: "Speakers", brand: "", model: "",
  supplier: "", rackLocation: "", unit: "pcs",
  price: 0, cost: 0, minStock: 1, currentQty: 0,
  notes: "", status: "active",
};

export function ProductFormModal({ open, product, products, onClose, onSubmit }: Props) {
  const [d, setD] = useState<ProductDraft>(empty);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setD(product ? {
        name: product.name, sku: product.sku, category: product.category,
        brand: product.brand, model: product.model, supplier: product.supplier,
        rackLocation: product.rackLocation, unit: product.unit,
        price: product.price, cost: product.cost, minStock: product.minStock,
        currentQty: product.currentQty, notes: product.notes, status: product.status,
      } : empty);
      setErr("");
    }
  }, [open, product]);

  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.name.trim() || !d.sku.trim()) { setErr("Name and SKU are required."); return; }
    const dup = products.some((p) => p.id !== product?.id && p.sku.toLowerCase() === d.sku.trim().toLowerCase());
    if (dup) { setErr("SKU already exists."); return; }
    onSubmit({ ...d, name: d.name.trim(), sku: d.sku.trim().toUpperCase() });
  };

  return (
    <Modal open={open} title={product ? "Edit Product" : "Add Product"} description="" onClose={onClose}>
      <form className="space-y-4" onSubmit={save}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label">Name</label>
            <input className="field" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Product name" />
          </div>
          <div>
            <label className="field-label">SKU</label>
            <input className="field font-mono" value={d.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SS-SPK-01" />
          </div>
          <div>
            <label className="field-label">Category</label>
            <select className="field" value={d.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Brand</label>
            <input className="field" value={d.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Brand" />
          </div>
          <div>
            <label className="field-label">Selling Price (₹)</label>
            <input className="field" type="number" min="0" value={d.price} onChange={(e) => set("price", +e.target.value)} />
          </div>
          <div>
            <label className="field-label">Cost (₹)</label>
            <input className="field" type="number" min="0" value={d.cost} onChange={(e) => set("cost", +e.target.value)} />
          </div>
          <div>
            <label className="field-label">Current Qty</label>
            <input className="field" type="number" min="0" value={d.currentQty} onChange={(e) => set("currentQty", +e.target.value)} />
          </div>
          <div>
            <label className="field-label">Min Stock</label>
            <input className="field" type="number" min="0" value={d.minStock} onChange={(e) => set("minStock", +e.target.value)} />
          </div>
          <div>
            <label className="field-label">Supplier</label>
            <input className="field" value={d.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="Supplier name" />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input className="field" value={d.rackLocation} onChange={(e) => set("rackLocation", e.target.value)} placeholder="Rack A1" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Notes</label>
            <textarea className="field-textarea" rows={2} value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes..." />
          </div>
        </div>

        {err && <p className="text-sm text-rose-400">{err}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">{product ? "Save" : "Add Product"}</button>
        </div>
      </form>
    </Modal>
  );
}
