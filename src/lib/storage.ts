import { defaultSettings, seedAdjustments, seedProducts } from "../data/seed";
import type { Adjustment, DailyProfit, Product, ShopSettings } from "../types";

const PRODUCTS_KEY = "sp_products";
const ADJUSTMENTS_KEY = "sp_adjustments";
const SETTINGS_KEY = "sp_settings";
const PROFITS_KEY = "sp_profits";

const isBrowser = typeof window !== "undefined";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeProduct(p: Partial<Product>): Product {
  return {
    id: p.id ?? `prd-${crypto.randomUUID()}`,
    name: p.name ?? "",
    sku: p.sku ?? "",
    category: p.category ?? "General",
    brand: p.brand ?? "Generic",
    model: p.model ?? "",
    supplier: p.supplier ?? "Local Supplier",
    rackLocation: p.rackLocation ?? "Main Shelf",
    unit: p.unit ?? "pcs",
    price: Number(p.price ?? 0),
    cost: Number(p.cost ?? 0),
    minStock: Number(p.minStock ?? 1),
    currentQty: Number(p.currentQty ?? 0),
    notes: p.notes ?? "",
    status: p.status ?? "active",
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeAdjustment(a: Partial<Adjustment>): Adjustment {
  return {
    id: a.id ?? `adj-${crypto.randomUUID()}`,
    productId: a.productId ?? "",
    productName: a.productName ?? "",
    sku: a.sku ?? "",
    type: a.type ?? "add",
    quantity: Number(a.quantity ?? 0),
    previousQty: Number(a.previousQty ?? 0),
    newQty: Number(a.newQty ?? 0),
    unitPrice: Number(a.unitPrice ?? 0),
    unitCost: Number(a.unitCost ?? 0),
    reason: a.reason ?? "",
    createdAt: a.createdAt ?? new Date().toISOString(),
  };
}

function normalizeProfit(p: Partial<DailyProfit>): DailyProfit {
  return {
    id: p.id ?? `prf-${crypto.randomUUID()}`,
    date: p.date ?? new Date().toISOString().slice(0, 10),
    amount: Number(p.amount ?? 0),
    notes: p.notes ?? "",
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
}

/* ── Initialize ── */

export function loadProducts(): Product[] {
  if (!isBrowser) return seedProducts;
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seedProducts));
    return seedProducts;
  }
  return safeParse<Partial<Product>[]>(raw, seedProducts).map(normalizeProduct);
}

export function loadAdjustments(): Adjustment[] {
  if (!isBrowser) return seedAdjustments;
  const raw = localStorage.getItem(ADJUSTMENTS_KEY);
  if (!raw) {
    localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(seedAdjustments));
    return seedAdjustments;
  }
  return safeParse<Partial<Adjustment>[]>(raw, seedAdjustments).map(normalizeAdjustment);
}

export function loadSettings(): ShopSettings {
  if (!isBrowser) return defaultSettings;
  const raw = localStorage.getItem(SETTINGS_KEY);
  return safeParse(raw, defaultSettings);
}

export function loadProfits(): DailyProfit[] {
  if (!isBrowser) return [];
  const raw = localStorage.getItem(PROFITS_KEY);
  return safeParse<Partial<DailyProfit>[]>(raw, []).map(normalizeProfit);
}

/* ── Persist ── */

export function saveProducts(products: Product[]) {
  if (isBrowser) localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function saveAdjustments(adjustments: Adjustment[]) {
  if (isBrowser) localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(adjustments));
}

export function saveSettings(settings: ShopSettings) {
  if (isBrowser) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function saveProfits(profits: DailyProfit[]) {
  if (isBrowser) localStorage.setItem(PROFITS_KEY, JSON.stringify(profits));
}

/* ── Reset ── */

export function resetAllData() {
  if (!isBrowser) return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seedProducts));
  localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(seedAdjustments));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
}

export function clearAllData() {
  if (!isBrowser) return;
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(ADJUSTMENTS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(PROFITS_KEY);
}

/* ── Storage usage ── */

export function getStorageUsageBytes(): number {
  if (!isBrowser) return 0;
  let total = 0;
  for (const key of [PRODUCTS_KEY, ADJUSTMENTS_KEY, SETTINGS_KEY]) {
    const val = localStorage.getItem(key);
    if (val) total += new Blob([val]).size;
  }
  return total;
}
