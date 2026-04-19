import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  apiGetProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiGetAdjustments,
  apiCreateAdjustment,
  apiGetProfits,
  apiCreateProfit,
  apiDeleteProfit,
  apiGetSettings,
  apiSaveSettings,
} from "../lib/api";
import type {
  Adjustment,
  AdjustmentDraft,
  DailyProfit,
  Product,
  ProductDraft,
  ProfitDraft,
  ShopSettings,
  Toast,
  ToastVariant,
} from "../types";

/* ── Context shape ── */

type InventoryContextValue = {
  products: Product[];
  adjustments: Adjustment[];
  settings: ShopSettings;
  toasts: Toast[];
  profits: DailyProfit[];
  loading: boolean;

  addProduct: (draft: ProductDraft) => Promise<void>;
  updateProduct: (id: string, draft: ProductDraft) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (draft: AdjustmentDraft) => Promise<{ ok: boolean; message: string }>;
  updateSettings: (s: ShopSettings) => Promise<void>;

  addProfit: (draft: ProfitDraft) => Promise<void>;
  deleteProfit: (id: string) => Promise<void>;

  showToast: (variant: ToastVariant, title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  refreshAll: () => Promise<void>;

  getProductById: (id: string) => Product | undefined;
  getProductAdjustments: (id: string) => Adjustment[];
  getProductSalesStats: (id: string) => {
    totalSold: number;
    totalRevenue: number;
    totalProfit: number;
    salesCount: number;
  };
};

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "My Shop",
  ownerName: "",
  phone: "",
  address: "",
};

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/* ── Provider ── */

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [profits, setProfits] = useState<DailyProfit[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Toast ── */
  const showToast = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const toast: Toast = { id: uid("toast"), variant, title, message, duration: 4000 };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Load all data from API ── */
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a, pr, s] = await Promise.all([
        apiGetProducts(),
        apiGetAdjustments(),
        apiGetProfits(),
        apiGetSettings(),
      ]);
      setProducts(p);
      setAdjustments(a);
      setProfits(pr);
      setSettings(s);
    } catch (err) {
      showToast("error", "Failed to load data", String(err));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  /* ── Products ── */
  const addProduct = useCallback(async (draft: ProductDraft) => {
    const created = await apiCreateProduct(draft);
    setProducts((prev) => [created, ...prev]);
  }, []);

  const updateProduct = useCallback(async (id: string, draft: ProductDraft) => {
    const updated = await apiUpdateProduct(id, draft);
    setProducts((prev) => prev.map((p) => p.id === id ? updated : p));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setAdjustments((prev) => prev.filter((a) => a.productId !== id));
  }, []);

  /* ── Stock adjustments ── */
  const adjustStock = useCallback(async (draft: AdjustmentDraft): Promise<{ ok: boolean; message: string }> => {
    try {
      const { adjustment, newQty } = await apiCreateAdjustment(draft);
      setAdjustments((prev) => [adjustment, ...prev]);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === draft.productId
            ? { ...p, currentQty: newQty, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
      return { ok: true, message: "Stock updated successfully." };
    } catch (err) {
      return { ok: false, message: String(err) };
    }
  }, []);

  /* ── Settings ── */
  const updateSettings = useCallback(async (s: ShopSettings) => {
    await apiSaveSettings(s);
    setSettings(s);
  }, []);

  /* ── Profits ── */
  const addProfit = useCallback(async (draft: ProfitDraft) => {
    const created = await apiCreateProfit(draft);
    setProfits((prev) => [created, ...prev]);
  }, []);

  const deleteProfit = useCallback(async (id: string) => {
    await apiDeleteProfit(id);
    setProfits((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /* ── Queries ── */
  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const getProductAdjustments = useCallback(
    (id: string) => adjustments.filter((a) => a.productId === id),
    [adjustments],
  );

  const getProductSalesStats = useCallback(
    (id: string) => {
      const sales = adjustments.filter((a) => a.productId === id && a.type === "subtract");
      const totalSold = sales.reduce((s, a) => s + a.quantity, 0);
      const totalRevenue = sales.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
      const totalProfit = sales.reduce((s, a) => s + a.quantity * (a.unitPrice - a.unitCost), 0);
      return { totalSold, totalRevenue, totalProfit, salesCount: sales.length };
    },
    [adjustments],
  );

  return (
    <InventoryContext.Provider
      value={{
        products,
        adjustments,
        settings,
        toasts,
        profits,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        updateSettings,
        addProfit,
        deleteProfit,
        showToast,
        dismissToast,
        refreshAll,
        getProductById,
        getProductAdjustments,
        getProductSalesStats,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider.");
  return ctx;
}
