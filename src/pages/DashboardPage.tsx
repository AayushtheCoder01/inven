import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  IndianRupee,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { DonutChart, DonutLegend } from "../components/DonutChart";
import { MiniBarChart } from "../components/MiniBarChart";
import { PageHeader } from "../components/PageHeader";
import { RevenueChart } from "../components/RevenueChart";
import { StatCard } from "../components/StatCard";
import { StockBadge } from "../components/StockBadge";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency, formatRelativeTime } from "../lib/format";

export function DashboardPage() {
  const { products, adjustments } = useInventory();

  /* ── 30-day Revenue Analytics ── */
  const revenueData = useMemo(() => {
    const now = new Date();
    const last30Days: Record<string, number> = {};
    const prev30Days: Record<string, number> = {};

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last30Days[d.toISOString().slice(0, 10)] = 0;
    }

    for (let i = 59; i >= 30; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      prev30Days[d.toISOString().slice(0, 10)] = 0;
    }

    const topProductMap = new Map<
      string,
      { id: string; name: string; revenue: number; units: number; tx: number }
    >();
    let salesCount30 = 0;

    adjustments.forEach((a) => {
      if (a.type !== "subtract") return;

      const dateStr = a.createdAt.slice(0, 10);
      const amount = a.quantity * a.unitPrice;

      if (dateStr in last30Days) {
        last30Days[dateStr] += amount;
        salesCount30 += 1;

        const current = topProductMap.get(a.productId) ?? {
          id: a.productId,
          name: a.productName,
          revenue: 0,
          units: 0,
          tx: 0,
        };

        current.revenue += amount;
        current.units += a.quantity;
        current.tx += 1;
        topProductMap.set(a.productId, current);
      } else if (dateStr in prev30Days) {
        prev30Days[dateStr] += amount;
      }
    });

    const chartData = Object.entries(last30Days).map(([date, value]) => ({
      label: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value,
      fullDate: date,
    }));

    const totalRevenue = Object.values(last30Days).reduce((a, b) => a + b, 0);
    const prev30Revenue = Object.values(prev30Days).reduce((a, b) => a + b, 0);
    const avgDaily = totalRevenue / 30;
    const maxDaily = Math.max(...Object.values(last30Days));
    const minDaily = Math.min(...Object.values(last30Days));

    const growth =
      prev30Revenue === 0
        ? totalRevenue > 0
          ? 100
          : 0
        : ((totalRevenue - prev30Revenue) / prev30Revenue) * 100;

    const last15Avg =
      Object.entries(last30Days)
        .slice(-15)
        .reduce((sum, [, v]) => sum + v, 0) / 15;

    const prev15Avg =
      Object.entries(last30Days)
        .slice(0, 15)
        .reduce((sum, [, v]) => sum + v, 0) / 15;

    const avgOrderValue30 = salesCount30 > 0 ? totalRevenue / salesCount30 : 0;

    const topProducts = Array.from(topProductMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const activeSalesDays = chartData.filter((d) => d.value > 0).length;

    return {
      chartData,
      totalRevenue,
      prev30Revenue,
      avgDaily,
      maxDaily,
      minDaily,
      growth,
      last15Avg,
      prev15Avg,
      salesCount30,
      avgOrderValue30,
      topProducts,
      activeSalesDays,
    };
  }, [adjustments]);

  /* ── Computed stock and all-time sales stats ── */
  const totalUnits = products.reduce((s, p) => s + p.currentQty, 0);
  const totalStockValue = products.reduce(
    (s, p) => s + p.currentQty * p.cost,
    0,
  );
  const totalRetailValue = products.reduce(
    (s, p) => s + p.currentQty * p.price,
    0,
  );
  const potentialProfit = totalRetailValue - totalStockValue;

  const lowStockProducts = products.filter((p) => p.currentQty <= p.minStock);
  const healthyCount = products.filter((p) => p.currentQty > p.minStock).length;
  const criticalCount = products.filter(
    (p) =>
      p.currentQty > 0 &&
      p.currentQty <= Math.max(Math.floor(p.minStock * 0.5), 1),
  ).length;
  const outOfStockCount = products.filter((p) => p.currentQty === 0).length;

  const sales = adjustments.filter((a) => a.type === "subtract");
  const totalSalesRevenue = sales.reduce(
    (s, a) => s + a.quantity * a.unitPrice,
    0,
  );
  const totalSalesProfit = sales.reduce(
    (s, a) => s + a.quantity * (a.unitPrice - a.unitCost),
    0,
  );
  const totalUnitsSold = sales.reduce((s, a) => s + a.quantity, 0);
  const profitMargin =
    totalSalesRevenue > 0 ? (totalSalesProfit / totalSalesRevenue) * 100 : 0;

  const categoryMap = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + p.currentQty;
    return acc;
  }, {});

  const categoryItems = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const donutSegments = [
    { label: "Healthy", value: healthyCount, color: "#10b981" },
    {
      label: "Low Stock",
      value: lowStockProducts.length - criticalCount - outOfStockCount,
      color: "#f59e0b",
    },
    { label: "Critical", value: criticalCount, color: "#f43f5e" },
    { label: "Out of Stock", value: outOfStockCount, color: "#64748b" },
  ].filter((s) => s.value > 0);

  const recentAdj = adjustments.slice(0, 6);

  const attentionProducts = [...products]
    .sort((a, b) => a.currentQty - a.minStock - (b.currentQty - b.minStock))
    .slice(0, 4);

  const lowStockRate =
    products.length > 0 ? (lowStockProducts.length / products.length) * 100 : 0;
  const potentialProfitPct =
    totalRetailValue > 0
      ? Math.max(0, Math.min(100, (potentialProfit / totalRetailValue) * 100))
      : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory health, revenue velocity, and operational performance."
        badge={`${products.length} products`}
      />

      {/* ── Primary stat cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <StatCard
            title="Total Products"
            value={products.length}
            icon={Boxes}
            tone="emerald"
            description={`${totalUnits} total units across all items`}
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatCard
            title="Stock Value"
            value={totalStockValue}
            prefix="₹"
            icon={IndianRupee}
            tone="blue"
            description={`Retail value: ${formatCurrency(totalRetailValue)}`}
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatCard
            title="All-time Sales"
            value={totalSalesRevenue}
            prefix="₹"
            icon={ShoppingCart}
            tone="purple"
            description={`${totalUnitsSold} units sold • ${formatCurrency(totalSalesProfit)} profit`}
          />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatCard
            title="Low Stock Alerts"
            value={lowStockProducts.length}
            icon={AlertTriangle}
            tone="rose"
            description={
              criticalCount > 0
                ? `${criticalCount} critical items need reorder`
                : "All items above minimum levels"
            }
          />
        </div>
      </section>

      {/* ── Commercial KPIs (high visibility) ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel p-4 animate-fade-in stagger-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Revenue (30D)
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-100">
            {formatCurrency(revenueData.totalRevenue)}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold border-emerald-500/25 text-emerald-400 bg-emerald-500/10">
            {revenueData.growth >= 0 ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {revenueData.growth >= 0 ? "+" : ""}
            {revenueData.growth.toFixed(1)}% vs previous 30D
          </div>
        </div>

        <div className="glass-panel p-4 animate-fade-in stagger-2">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Sales Orders (30D)
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-100">
            {revenueData.salesCount30}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {revenueData.activeSalesDays} active sales days
          </p>
        </div>

        <div className="glass-panel p-4 animate-fade-in stagger-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Avg Order Value (30D)
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-100">
            {formatCurrency(revenueData.avgOrderValue30)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Based on {revenueData.salesCount30} sales transactions
          </p>
        </div>

        <div className="glass-panel p-4 animate-fade-in stagger-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Gross Margin
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-100">
            {profitMargin.toFixed(1)}%
          </p>
          <p className="mt-2 text-xs text-slate-500">
            All-time realized margin from sales
          </p>
        </div>
      </section>

      {/* ── 30-day revenue chart ── */}
      <section className="animate-fade-in stagger-3">
        <RevenueChart data={revenueData} />
      </section>

      {/* ── Professional analytics row ── */}
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6 animate-fade-in stagger-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Top Performers
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-slate-200">
                Top Products by Revenue (30D)
              </h2>
            </div>
            <Sparkles size={16} className="text-amber-400" />
          </div>

          <div className="mt-5 space-y-3">
            {revenueData.topProducts.length > 0 ? (
              revenueData.topProducts.map((item, idx) => (
                <Link
                  key={item.id}
                  to={`/inventory/${item.id}`}
                  className="block rounded-xl border border-white/[0.05] bg-dark-750/40 p-3 transition-all hover:border-white/[0.12] hover:bg-dark-700/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-200">
                        #{idx + 1} {item.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {item.units} units • {item.tx} transactions
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-white/[0.05] bg-dark-750/30 px-4 py-5 text-center text-sm text-slate-500">
                No sales recorded in the last 30 days.
              </p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 animate-fade-in stagger-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Commercial Snapshot
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-200">
            Profitability & Risk
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Potential Profit in Current Stock
                </span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(potentialProfit)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dark-750">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                  style={{ width: `${potentialProfitPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Low Stock Exposure</span>
                <span className="font-semibold text-amber-400">
                  {lowStockRate.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dark-750">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{
                    width: `${Math.max(0, Math.min(100, lowStockRate))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Margin Efficiency</span>
                <span className="font-semibold text-blue-400">
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dark-750">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
                  style={{
                    width: `${Math.max(0, Math.min(100, profitMargin))}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-dark-750/30 p-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Recommendation:
              </span>{" "}
              {lowStockRate > 20
                ? "Rebalance inventory for low-stock categories to avoid revenue leakage."
                : "Inventory risk is controlled. Focus on scaling top-performing products."}
            </div>
          </div>
        </div>
      </section>

      {/* ── Charts row ── */}
      <section className="grid gap-4 lg:grid-cols-2">
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
            <Link to="/inventory" className="btn-ghost text-xs">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {attentionProducts.map((p) => (
              <Link
                key={p.id}
                to={`/inventory/${p.id}`}
                className="glass-subtle group p-4 transition-all hover:border-white/[0.1] hover:bg-dark-700/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200 transition-colors group-hover:text-emerald-400">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.brand} • {p.category}
                    </p>
                  </div>
                  <StockBadge
                    quantity={p.currentQty}
                    minStock={p.minStock}
                    showDot={false}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    <span className="font-semibold text-slate-300">
                      {p.currentQty}
                    </span>{" "}
                    / {p.minStock} min
                  </span>
                  <span className="text-slate-500">{p.rackLocation}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

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
            <Link to="/activity" className="btn-ghost text-xs">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-5 space-y-2">
            {recentAdj.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl bg-dark-750/40 px-4 py-3"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    a.type === "add"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {a.type === "add" ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-300">
                    {a.productName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {a.reason}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-sm font-bold ${
                      a.type === "add" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {a.type === "add" ? "+" : "-"}
                    {a.quantity}
                  </span>
                  <p className="text-[10px] text-slate-600">
                    {formatRelativeTime(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {recentAdj.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-600">
                No stock changes yet
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
