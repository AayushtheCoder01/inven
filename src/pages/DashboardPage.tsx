import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DonutChart, DonutLegend } from "../components/DonutChart";
import { MiniBarChart } from "../components/MiniBarChart";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { StockBadge } from "../components/StockBadge";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency, formatRelativeTime } from "../lib/format";

export function DashboardPage() {
  const { products, adjustments } = useInventory();

  /* ── Computed stats ── */
  const totalUnits = products.reduce((s, p) => s + p.currentQty, 0);
  const totalStockValue = products.reduce((s, p) => s + p.currentQty * p.cost, 0);
  const totalRetailValue = products.reduce((s, p) => s + p.currentQty * p.price, 0);
  const potentialProfit = totalRetailValue - totalStockValue;

  const lowStockProducts = products.filter((p) => p.currentQty <= p.minStock);
  const healthyCount = products.filter((p) => p.currentQty > p.minStock).length;
  const criticalCount = products.filter(
    (p) => p.currentQty > 0 && p.currentQty <= Math.max(Math.floor(p.minStock * 0.5), 1),
  ).length;
  const outOfStockCount = products.filter((p) => p.currentQty === 0).length;

  /* Sales stats */
  const sales = adjustments.filter((a) => a.type === "subtract");
  const totalSalesRevenue = sales.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
  const totalSalesProfit = sales.reduce((s, a) => s + a.quantity * (a.unitPrice - a.unitCost), 0);
  const totalUnitsSold = sales.reduce((s, a) => s + a.quantity, 0);

  /* Category distribution */
  const categoryMap = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + p.currentQty;
    return acc;
  }, {});
  const categoryItems = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  /* Stock health donut */
  const donutSegments = [
    { label: "Healthy", value: healthyCount, color: "#10b981" },
    { label: "Low Stock", value: lowStockProducts.length - criticalCount - outOfStockCount, color: "#f59e0b" },
    { label: "Critical", value: criticalCount, color: "#f43f5e" },
    { label: "Out of Stock", value: outOfStockCount, color: "#64748b" },
  ].filter((s) => s.value > 0);

  /* Recent adjustments */
  const recentAdj = adjustments.slice(0, 6);

  /* Top attention products */
  const attentionProducts = [...products]
    .sort((a, b) => a.currentQty - a.minStock - (b.currentQty - b.minStock))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your shop's inventory, sales activity, and stock health at a glance."
        badge={`${products.length} products`}
      />

      {/* ── Stat cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <StatCard
            title="Total Products" value={products.length}
            icon={Boxes} tone="emerald"
            description={`${totalUnits} total units across all items`}
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatCard
            title="Stock Value" value={totalStockValue} prefix="₹"
            icon={IndianRupee} tone="blue"
            description={`Retail value: ${formatCurrency(totalRetailValue)}`}
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatCard
            title="Total Sales" value={totalSalesRevenue} prefix="₹"
            icon={ShoppingCart} tone="purple"
            description={`${totalUnitsSold} units sold • ${formatCurrency(totalSalesProfit)} profit`}
          />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatCard
            title="Low Stock Alerts" value={lowStockProducts.length}
            icon={AlertTriangle} tone="rose"
            description={criticalCount > 0 ? `${criticalCount} critical items need reorder` : "All items above minimum levels"}
          />
        </div>
      </section>

      {/* ── Charts row ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Stock Health Donut */}
        <div className="glass-panel p-6 animate-fade-in stagger-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Stock Health
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-200">
            Inventory Status
          </h2>
          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <DonutChart
              segments={donutSegments}
              centerValue={String(products.length)}
              centerLabel="products"
            />
            <DonutLegend items={donutSegments} />
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="glass-panel p-6 animate-fade-in stagger-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Category Distribution
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-200">
            Units by Category
          </h2>
          <div className="mt-6">
            <MiniBarChart items={categoryItems} height={160} />
          </div>
        </div>
      </section>

      {/* ── Bottom section ── */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Attention Products */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Needs Attention
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-200">
                Low Stock Items
              </h2>
            </div>
            <Link to="/products" className="btn-ghost text-xs">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {attentionProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="glass-subtle group p-4 transition-all hover:border-white/[0.1] hover:bg-dark-700/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.brand} • {p.category}
                    </p>
                  </div>
                  <StockBadge quantity={p.currentQty} minStock={p.minStock} showDot={false} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    <span className="font-semibold text-slate-300">{p.currentQty}</span> / {p.minStock} min
                  </span>
                  <span className="text-slate-500">{p.rackLocation}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recent Activity
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-200">
                Stock Changes
              </h2>
            </div>
            <Link to="/adjustments" className="btn-ghost text-xs">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {recentAdj.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl bg-dark-750/40 px-4 py-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    a.type === "add"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {a.type === "add" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-300">
                    {a.productName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{a.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      a.type === "add" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {a.type === "add" ? "+" : "-"}{a.quantity}
                  </span>
                  <p className="text-[10px] text-slate-600">{formatRelativeTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {recentAdj.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-600">No stock changes yet</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
