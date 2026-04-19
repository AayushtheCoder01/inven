/**
 * Thin API client that talks to the FastAPI backend.
 * All functions throw on network/server errors so the context can catch and toast.
 */

import type { Adjustment, AdjustmentDraft, DailyProfit, Product, ProductDraft, ProfitDraft, ShopSettings } from "../types";

// In dev we hit the backend directly to skip needing a proxy restart.
// On Vercel, /api/* is handled by the Python serverless function.
const BASE = import.meta.env.DEV
  ? "http://localhost:8000/api"
  : "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `API error ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

/* ── Products ──────────────────────────────────────────────────────────────── */

export async function apiGetProducts(): Promise<Product[]> {
  const res = await request<{ data: Record<string, unknown>[] }>("/products");
  return res.data.map(normalizeProduct);
}

export async function apiCreateProduct(draft: ProductDraft): Promise<Product> {
  const res = await request<{ data: Record<string, unknown> }>("/products", {
    method: "POST",
    body: JSON.stringify(snakeProduct(draft)),
  });
  return normalizeProduct(res.data);
}

export async function apiUpdateProduct(id: string, draft: ProductDraft): Promise<Product> {
  const res = await request<{ data: Record<string, unknown> }>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(snakeProduct(draft)),
  });
  return normalizeProduct(res.data);
}

export async function apiDeleteProduct(id: string): Promise<void> {
  await request(`/products/${id}`, { method: "DELETE" });
}

/* ── Adjustments ───────────────────────────────────────────────────────────── */

export async function apiGetAdjustments(productId?: string): Promise<Adjustment[]> {
  const qs = productId ? `?product_id=${productId}` : "";
  const res = await request<{ data: Record<string, unknown>[] }>(`/adjustments${qs}`);
  return res.data.map(normalizeAdjustment);
}

export async function apiCreateAdjustment(
  draft: AdjustmentDraft,
): Promise<{ adjustment: Adjustment; newQty: number }> {
  const res = await request<{ data: Record<string, unknown>; new_qty: number }>("/adjustments", {
    method: "POST",
    body: JSON.stringify({
      productId: draft.productId,
      type: draft.type,
      quantity: draft.quantity,
      reason: draft.reason,
    }),
  });
  return { adjustment: normalizeAdjustment(res.data), newQty: res.new_qty };
}

/* ── Profits ───────────────────────────────────────────────────────────────── */

export async function apiGetProfits(): Promise<DailyProfit[]> {
  const res = await request<{ data: Record<string, unknown>[] }>("/profits");
  return res.data.map(normalizeProfit);
}

export async function apiCreateProfit(draft: ProfitDraft): Promise<DailyProfit> {
  const res = await request<{ data: Record<string, unknown> }>("/profits", {
    method: "POST",
    body: JSON.stringify(draft),
  });
  return normalizeProfit(res.data);
}

export async function apiDeleteProfit(id: string): Promise<void> {
  await request(`/profits/${id}`, { method: "DELETE" });
}

/* ── Settings ──────────────────────────────────────────────────────────────── */

export async function apiGetSettings(): Promise<ShopSettings> {
  const raw = await request<Record<string, unknown>>("/settings");
  return {
    shopName: String(raw.shopName ?? raw.shop_name ?? "My Shop"),
    ownerName: String(raw.ownerName ?? raw.owner_name ?? ""),
    phone: String(raw.phone ?? ""),
    address: String(raw.address ?? ""),
  };
}

export async function apiSaveSettings(s: ShopSettings): Promise<void> {
  await request("/settings", { method: "PUT", body: JSON.stringify(s) });
}

/* ── Normalizers (snake_case DB → camelCase TS) ─────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(r: any): Product {
  return {
    id: r.id ?? "",
    name: r.name ?? "",
    sku: r.sku ?? "",
    category: r.category ?? "General",
    brand: r.brand ?? "Generic",
    model: r.model ?? "",
    supplier: r.supplier ?? "Local Supplier",
    rackLocation: r.rack_location ?? r.rackLocation ?? "Main Shelf",
    unit: r.unit ?? "pcs",
    price: Number(r.price ?? 0),
    cost: Number(r.cost ?? 0),
    minStock: Number(r.min_stock ?? r.minStock ?? 1),
    currentQty: Number(r.current_qty ?? r.currentQty ?? 0),
    notes: r.notes ?? "",
    status: r.status ?? "active",
    createdAt: r.created_at ?? r.createdAt ?? "",
    updatedAt: r.updated_at ?? r.updatedAt ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAdjustment(r: any): Adjustment {
  return {
    id: r.id ?? "",
    productId: r.product_id ?? r.productId ?? "",
    productName: r.product_name ?? r.productName ?? "",
    sku: r.sku ?? "",
    type: r.type ?? "add",
    quantity: Number(r.quantity ?? 0),
    previousQty: Number(r.previous_qty ?? r.previousQty ?? 0),
    newQty: Number(r.new_qty ?? r.newQty ?? 0),
    unitPrice: Number(r.unit_price ?? r.unitPrice ?? 0),
    unitCost: Number(r.unit_cost ?? r.unitCost ?? 0),
    reason: r.reason ?? "",
    createdAt: r.created_at ?? r.createdAt ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProfit(r: any): DailyProfit {
  return {
    id: r.id ?? "",
    date: r.date ?? "",
    amount: Number(r.amount ?? 0),
    notes: r.notes ?? "",
    createdAt: r.created_at ?? r.createdAt ?? "",
  };
}

/** Convert camelCase ProductDraft to snake_case for the API */
function snakeProduct(d: ProductDraft) {
  return {
    name: d.name,
    sku: d.sku,
    category: d.category,
    brand: d.brand,
    model: d.model,
    supplier: d.supplier,
    rack_location: d.rackLocation,
    unit: d.unit,
    price: d.price,
    cost: d.cost,
    min_stock: d.minStock,
    current_qty: d.currentQty,
    notes: d.notes,
    status: d.status,
  };
}
