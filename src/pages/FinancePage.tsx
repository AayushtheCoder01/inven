import {
  ArrowDownToLine,
  Calendar,
  IndianRupee,
  LineChart,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { AreaChart } from "../components/AreaChart";
import { useInventory } from "../context/InventoryContext";
import { formatCurrency } from "../lib/format";

type Timeframe =
  | "7 Days"
  | "30 Days"
  | "4 Weeks"
  | "YTD (Months)"
  | "12 Months";

export function FinancePage() {
  const { profits, addProfit, deleteProfit, showToast } = useInventory();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [timeframe, setTimeframe] = useState<Timeframe>("30 Days");
  const [showChart, setShowChart] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast(
        "error",
        "Invalid Amount",
        "Please enter a valid positive number.",
      );
      return;
    }

    addProfit({ amount: Number(amount), date, notes: notes.trim() });
    showToast(
      "success",
      "Profit Added",
      `Recorded ${formatCurrency(Number(amount))} for ${date}`,
    );
    setAmount("");
    setNotes("");
  };

  // --- Aggregations & Growth ---
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Boundaries
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let today = 0,
      thisWeek = 0,
      lastWeek = 0,
      thisMonth = 0,
      lastMonth = 0;

    profits.forEach((p) => {
      const pDate = new Date(p.date);
      if (p.date === todayStr) today += p.amount;

      if (pDate >= startOfWeek) thisWeek += p.amount;
      else if (pDate >= startOfLastWeek) lastWeek += p.amount;

      if (pDate >= startOfMonth) thisMonth += p.amount;
      else if (pDate >= startOfLastMonth) lastMonth += p.amount;
    });

    const getGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      today,
      thisWeek,
      growthWeek: getGrowth(thisWeek, lastWeek),
      thisMonth,
      growthMonth: getGrowth(thisMonth, lastMonth),
    };
  }, [profits]);

  // --- Chart Data Engine ---
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();

    if (timeframe === "7 Days") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        map.set(d.toISOString().slice(0, 10), 0);
      }
      profits.forEach((p) => {
        if (map.has(p.date)) map.set(p.date, map.get(p.date)! + p.amount);
      });
      return Array.from(map.entries()).map(([k, v]) => ({
        label: new Date(k).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: v,
      }));
    }

    if (timeframe === "30 Days") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        map.set(d.toISOString().slice(0, 10), 0);
      }
      profits.forEach((p) => {
        if (map.has(p.date)) map.set(p.date, map.get(p.date)! + p.amount);
      });
      return Array.from(map.entries()).map(([k, v], idx) => ({
        label:
          idx % 5 === 0
            ? new Date(k).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "",
        value: v,
      }));
    }

    if (timeframe === "4 Weeks") {
      // Last 4 weeks (representing approx a month comparison)
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        // group by start of the week
        const wkStart = new Date(d);
        wkStart.setDate(d.getDate() - d.getDay());
        map.set(wkStart.toISOString().slice(0, 10), 0);
      }
      profits.forEach((p) => {
        const pDate = new Date(p.date);
        if (pDate >= new Date(Array.from(map.keys())[0])) {
          const wkStart = new Date(pDate);
          wkStart.setDate(pDate.getDate() - pDate.getDay());
          const key = wkStart.toISOString().slice(0, 10);
          if (map.has(key)) map.set(key, map.get(key)! + p.amount);
        }
      });
      return Array.from(map.entries()).map(([k, v], index) => ({
        label: `Wk ${index + 1}`,
        value: v,
      }));
    }

    if (timeframe === "YTD (Months)") {
      // From January to Current Month
      for (let m = 0; m <= now.getMonth(); m++) {
        const d = new Date(now.getFullYear(), m, 1);
        map.set(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          0,
        );
      }
      profits.forEach((p) => {
        const pDate = new Date(p.date);
        if (pDate.getFullYear() === now.getFullYear()) {
          const key = p.date.slice(0, 7); // YYYY-MM
          if (map.has(key)) map.set(key, map.get(key)! + p.amount);
        }
      });
      return Array.from(map.entries()).map(([k, v]) => ({
        label: new Date(`${k}-01`).toLocaleDateString("en-US", {
          month: "short",
        }),
        value: v,
      }));
    }

    if (timeframe === "12 Months") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        map.set(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          0,
        );
      }
      profits.forEach((p) => {
        const key = p.date.slice(0, 7); // YYYY-MM
        if (map.has(key)) map.set(key, map.get(key)! + p.amount);
      });
      return Array.from(map.entries()).map(([k, v]) => ({
        label: new Date(`${k}-01`).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        value: v,
      }));
    }

    return [];
  }, [profits, timeframe]);

  // UI Helper for growth badges
  const GrowthBadge = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isUp = value > 0;
    return (
      <span
        className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isUp
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
        }`}
      >
        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">
            Financial Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive overview of your profit margins over time
          </p>
        </div>
        <button
          onClick={() => setShowChart(!showChart)}
          className={`btn-secondary ${showChart ? "bg-white/[0.08] border-white/[0.15]" : ""}`}
        >
          <LineChart size={16} /> {showChart ? "Hide Graph" : "View Graph"}
        </button>
      </div>

      {/* Advanced Chart Module */}
      {showChart && (
        <div className="glass-panel p-5 pt-4 animate-scale-in flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-300">
              Revenue Trajectory
            </h2>

            {/* Timeframe Selector */}
            <div className="flex rounded-lg bg-dark-700/50 p-1 border border-white/[0.04] flex-wrap">
              {(
                [
                  "7 Days",
                  "30 Days",
                  "4 Weeks",
                  "YTD (Months)",
                  "12 Months",
                ] as Timeframe[]
              ).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    timeframe === tf
                      ? "bg-dark-600 text-slate-100 shadow-sm"
                      : "text-slate-500 hover:text-slate-300 hover:bg-dark-600/50"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <AreaChart
              data={chartData}
              height={280}
              color="#34d399"
              formatTooltip={(val) => formatCurrency(val)}
            />
          </div>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-in stagger-1">
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 transition-transform group-hover:scale-110 blur-xl" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider relative">
            <Calendar size={14} className="text-emerald-400" /> Today
          </div>
          <p className="font-display text-3xl font-bold text-emerald-400 relative drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
            {formatCurrency(stats.today)}
          </p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 transition-transform group-hover:scale-110 blur-xl" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider relative">
            <TrendingUp size={14} className="text-blue-400" /> This Week
            <GrowthBadge value={stats.growthWeek} />
          </div>
          <p className="font-display text-3xl font-bold text-slate-100 relative">
            {formatCurrency(stats.thisWeek)}
          </p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/5 transition-transform group-hover:scale-110 blur-xl" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider relative">
            <IndianRupee size={14} className="text-purple-400" /> This Month
            <GrowthBadge value={stats.growthMonth} />
          </div>
          <p className="font-display text-3xl font-bold text-slate-100 relative">
            {formatCurrency(stats.thisMonth)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[0.35fr_0.65fr] animate-fade-in stagger-2">
        {/* Add Profit Form */}
        <div className="glass-panel p-5 h-fit">
          <h2 className="text-base font-semibold text-slate-200 mb-5">
            Record New Data
          </h2>
          <form className="space-y-4" onSubmit={handleAdd}>
            <div>
              <label className="field-label">Date</label>
              <input
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Profit Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field font-mono text-emerald-400 font-bold"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Source / Notes</label>
              <input
                type="text"
                className="field"
                placeholder="E.g., Event sales, Bulk order"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2 group">
              <ArrowDownToLine
                size={16}
                className="transition-transform group-hover:-translate-y-0.5"
              />{" "}
              Commit Record
            </button>
          </form>
        </div>

        {/* Profit List */}
        <div className="glass-panel p-0 flex flex-col h-[450px]">
          <div className="p-5 border-b border-white/[0.04] shrink-0 flex justify-between items-center bg-dark-800/50">
            <h2 className="text-base font-semibold text-slate-200">
              History Ledger
            </h2>
            <span className="text-xs font-medium text-slate-500">
              {profits.length} records total
            </span>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-dark-800/20">
            {profits.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {profits
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 px-5 hover:bg-dark-750/50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">
                          {formatCurrency(p.amount)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-medium tracking-wide text-slate-400">
                            {new Date(p.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {p.notes && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400 italic">
                                {p.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteProfit(p.id)}
                        className="btn-icon h-8 w-8 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:border-rose-500/20"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-10 text-center h-full flex flex-col items-center justify-center">
                <EmptyState
                  title="Ledger is empty"
                  description="Begin recording your performance on the left."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
