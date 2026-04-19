/* ── Product ── */

export type ProductStatus = "active" | "discontinued";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  supplier: string;
  rackLocation: string;
  unit: string;
  price: number;
  cost: number;
  minStock: number;
  currentQty: number;
  notes: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductDraft = Omit<Product, "id" | "createdAt" | "updatedAt">;

/* ── Adjustment ── */

export type AdjustmentType = "add" | "subtract";

export type Adjustment = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: AdjustmentType;
  quantity: number;
  previousQty: number;
  newQty: number;
  unitPrice: number;
  unitCost: number;
  reason: string;
  createdAt: string;
};

export type AdjustmentDraft = {
  productId: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
};

/* ── Toast ── */

export type ToastVariant = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
};

/* -- Finance -- */

export type DailyProfit = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  notes?: string;
  createdAt: string;
};

export type ProfitDraft = Omit<DailyProfit, "id" | "createdAt">;

/* ── Shop Settings ── */

export type ShopSettings = {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
};
