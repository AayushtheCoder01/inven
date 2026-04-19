import { Download, FileBarChart, ShoppingCart, TrendingUp, TriangleAlert } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { StockBadge } from "../components/StockBadge";
import { EmptyState } from "../components/EmptyState";
import { useInventory } from "../context/InventoryContext";
import { exportProductsCsv, exportAdjustmentsCsv, exportSalesReport } from "../lib/csv";
import { formatCurrency, formatPercentage } from "../lib/format";

export function ReportsPage() {
  const { products, adjustments, showToast } = useInventory();

  const lowStockProducts = products.filter(
    (p) => p.currentQty <= p.minStock || p.currentQty === 0,
  );

  /* Aggregate stats */
  const totalCostValue = products.reduce((s, p) => s + p.currentQty * p.cost, 0);
  const totalRetailValue = products.reduce((s, p) => s + p.currentQty * p.price, 0);
  const potentialProfit = totalRetailValue - totalCostValue;
  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + (p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0), 0) / products.length
    : 0;

  const sales = adjustments.filter((a) => a.type === "subtract");
  const totalSalesRevenue = sales.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
  const totalSalesProfit = sales.reduce((s, a) => s + a.quantity * (a.unitPrice - a.unitCost), 0);

  const doExport = (fn: () => void, label: string) => {
    fn();
    showToast("success", "Export Complete", `${label} downloaded.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive view of inventory value, profit margins, low stock alerts, and sales performance."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary text-sm"
              onClick={() => doExport(() => exportProductsCsv(products), "Inventory CSV")}>
              <Download size={15} /> Inventory
            </button>
            <button type="button" className="btn-secondary text-sm"
              onClick={() => doExport(() => exportAdjustmentsCsv(adjustments), "Adjustments CSV")}>
              <Download size={15} /> Adjustments
            </button>
            <button type="button" className="btn-primary text-sm"
              onClick={() => doExport(() => exportSalesReport(adjustments), "Sales Report")}>
              <Download size={15} /> Sales Report
            </button>
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <StatCard title="Inventory Value" value={totalCostValue} prefix="₹"
            icon={FileBarChart} tone="blue"
            description={`Retail: ${formatCurrency(totalRetailValue)}`} />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatCard title="Potential Profit" value={potentialProfit} prefix="₹"
            icon={TrendingUp} tone="emerald"
            description={`If all current stock sold at retail`} />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatCard title="Sales Revenue" value={totalSalesRevenue} prefix="₹"
            icon={ShoppingCart} tone="purple"
            description={`Profit: ${formatCurrency(totalSalesProfit)}`} />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatCard title="Avg. Margin" value={avgMargin} suffix="%" decimals={1}
            icon={TrendingUp} tone={avgMargin >= 20 ? "emerald" : "amber"}
            description="Average across all products" />
        </div>
      </section>

      {/* ── Full stock table ── */}
      <section className="space-y-4 animate-fade-in">
        <h2 className="font-display text-lg font-bold text-slate-200">
          Full Inventory Listing
        </h2>
        <div className="table-container overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-dark-750/50 text-xs uppercase tracking-wider text-slate-500">
                {["Product", "Brand / Model", "Supplier", "Rack", "Price", "Cost", "Qty", "Value", "Margin"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const row_margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
                return (
                  <tr key={p.id} className="border-t border-white/[0.04] hover:bg-dark-750/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-200">{p.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.brand} / {p.model || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{p.supplier}</td>
                    <td className="px-4 py-3 text-slate-500">{p.rackLocation}</td>
                    <td className="px-4 py-3 text-slate-400">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{p.currentQty} {p.unit}</td>
                    <td className="px-4 py-3 font-semibold text-blue-400">
                      {formatCurrency(p.currentQty * p.cost)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${
                        row_margin >= 25 ? "text-emerald-400" : row_margin >= 15 ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {formatPercentage(row_margin)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.08] bg-dark-750/30">
                <td className="px-4 py-3 font-semibold text-slate-300" colSpan={6}>Total</td>
                <td className="px-4 py-3 font-bold text-slate-200">
                  {products.reduce((s, p) => s + p.currentQty, 0)} units
                </td>
                <td className="px-4 py-3 font-bold text-blue-400">
                  {formatCurrency(totalCostValue)}
                </td>
                <td className="px-4 py-3 font-bold text-emerald-400">
                  {formatPercentage(avgMargin)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ── Low stock alerts ── */}
      <section className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <TriangleAlert size={18} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-200">
              Reorder Alerts
              {lowStockProducts.length > 0 && (
                <span className="ml-2 badge bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {lowStockProducts.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500">Products below minimum stock level</p>
          </div>
        </div>

        {lowStockProducts.length > 0 ? (
          <div className="table-container overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-dark-750/50 text-xs uppercase tracking-wider text-slate-500">
                  {["Product", "Supplier", "Rack", "Current", "Min Stock", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-t border-white/[0.04] hover:bg-dark-750/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-200">{p.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{p.brand} / {p.model || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.supplier}</td>
                    <td className="px-4 py-3 text-slate-500">{p.rackLocation}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{p.currentQty}</td>
                    <td className="px-4 py-3 text-slate-500">{p.minStock}</td>
                    <td className="px-4 py-3">
                      <StockBadge quantity={p.currentQty} minStock={p.minStock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={TriangleAlert}
            title="No Reorder Alerts"
            description="All products are above minimum stock levels. Great job keeping inventory healthy!"
          />
        )}
      </section>
    </div>
  );
}
