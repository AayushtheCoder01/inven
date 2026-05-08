import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  BarChart3,
  Info,
} from "lucide-react";
import { AreaChart } from "./AreaChart";
import { formatCurrency } from "../lib/format";

type RevenueDataPoint = {
  label: string;
  value: number;
  fullDate: string;
};

type RevenueChartProps = {
  data: {
    chartData: RevenueDataPoint[];
    totalRevenue: number;
    avgDaily: number;
    maxDaily: number;
    minDaily: number;
    growth: number;
    last15Avg: number;
    prev15Avg: number;
  };
};

export function RevenueChart({ data }: RevenueChartProps) {
  const stats = useMemo(() => {
    const { totalRevenue } = data;

    // Calculate trend line (best fit)
    const days = data.chartData.length;
    const sumX = (days * (days + 1)) / 2;
    const sumY = totalRevenue;
    const sumXY = data.chartData.reduce(
      (sum, d, i) => sum + (i + 1) * d.value,
      0,
    );
    const sumX2 = (days * (days + 1) * (2 * days + 1)) / 6;

    const slope = (days * sumXY - sumX * sumY) / (days * sumX2 - sumX * sumX);
    const isUptrend = slope > 0;

    // Active days (days with sales)
    const activeDays = data.chartData.filter((d) => d.value > 0).length;
    const activeDayRate = (activeDays / days) * 100;

    return {
      isUptrend,
      activeDays,
      activeDayRate,
      slope: Math.abs(slope),
      daysWithZeroSales: days - activeDays,
    };
  }, [data]);

  const StatItem = ({
    label,
    value,
    prefix = "",
    icon: Icon,
    color = "text-slate-400",
    trend,
  }: {
    label: string;
    value: string | number;
    prefix?: string;
    icon: React.ReactNode;
    color?: string;
    trend?: "up" | "down" | null;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-dark-750/40 border border-white/[0.04] hover:border-white/[0.08] hover:bg-dark-750/60 transition-all group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex-shrink-0 text-slate-500">{Icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-sm font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
            {prefix}
            {value}
          </p>
        </div>
      </div>
      {trend && (
        <div
          className={`flex-shrink-0 p-1.5 rounded-lg ${
            trend === "up"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main Chart Card */}
      <div className="glass-panel p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-200 mb-1">
              <BarChart3 size={20} className="text-emerald-400" />
              30-Day Revenue Analysis
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={12} />
              Last 30 days of sales performance
            </p>
          </div>

          {/* Growth Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
            {data.growth >= 0 ? (
              <>
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="font-bold text-emerald-400">
                  {data.growth.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-rose-400" />
                <span className="font-bold text-rose-400">
                  {Math.abs(data.growth).toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-xs text-slate-500 ml-1">
              Period over period
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-dark-850/40 rounded-lg p-4 border border-white/[0.04] mb-6">
          <AreaChart
            data={data.chartData}
            height={300}
            color="#34d399"
            formatTooltip={(val) => formatCurrency(val)}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem
            label="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            icon={<Activity size={16} />}
            color="text-emerald-400"
          />
          <StatItem
            label="Daily Average"
            value={formatCurrency(data.avgDaily)}
            icon={<Calendar size={16} />}
            color="text-blue-400"
          />
          <StatItem
            label="Peak Day"
            value={formatCurrency(data.maxDaily)}
            icon={<TrendingUp size={16} />}
            color="text-emerald-400"
            trend="up"
          />
          <StatItem
            label="Lowest Day"
            value={formatCurrency(data.minDaily)}
            icon={<TrendingDown size={16} />}
            color="text-slate-400"
            trend="down"
          />
        </div>
      </div>

      {/* Advanced Analytics Panel */}
      <div className="grid gap-4 lg:grid-cols-3 animate-fade-in stagger-1">
        {/* Performance Indicators */}
        <div className="glass-panel p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <Activity size={16} className="text-purple-400" />
            Performance Indicators
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">
                  Sales Consistency
                </span>
                <span
                  className={`font-bold ${stats.activeDayRate >= 70 ? "text-emerald-400" : stats.activeDayRate >= 50 ? "text-amber-400" : "text-rose-400"}`}
                >
                  {stats.activeDayRate.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-dark-750 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.activeDayRate >= 70
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : stats.activeDayRate >= 50
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-rose-500 to-rose-400"
                  }`}
                  style={{ width: `${stats.activeDayRate}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">
                {stats.activeDays} out of 30 days with sales
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">
                  Revenue Stability
                </span>
                <span
                  className={`font-bold ${
                    data.maxDaily === 0
                      ? "text-slate-400"
                      : data.minDaily / data.maxDaily >= 0.7
                        ? "text-emerald-400"
                        : "text-amber-400"
                  }`}
                >
                  {data.maxDaily === 0
                    ? "N/A"
                    : ((data.minDaily / data.maxDaily) * 100).toFixed(0)}
                  %
                </span>
              </div>
              <div className="h-1.5 bg-dark-750 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                  style={{
                    width: `${data.maxDaily === 0 ? 0 : (data.minDaily / data.maxDaily) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">
                Min/Max ratio (higher = more stable)
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Panel */}
        <div className="glass-panel p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <Calendar size={16} className="text-blue-400" />
            Period Comparison
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                First 15 Days Avg
              </div>
              <p className="text-2xl font-bold text-slate-200">
                {formatCurrency(data.prev15Avg)}
              </p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Last 15 Days Avg
              </div>
              <p className="text-2xl font-bold text-slate-200">
                {formatCurrency(data.last15Avg)}
              </p>
            </div>
            <div className="pt-2">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  data.growth >= 0
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-rose-500/10 border border-rose-500/20"
                }`}
              >
                {data.growth >= 0 ? (
                  <TrendingUp size={14} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={14} className="text-rose-400" />
                )}
                <span
                  className={`text-xs font-bold ${
                    data.growth >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {data.growth >= 0 ? "+" : ""}
                  {data.growth.toFixed(2)}% Change
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="glass-panel p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <Info size={16} className="text-amber-400" />
            Quick Insights
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <span
                className={`flex-shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full ${
                  stats.isUptrend ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              <p className="text-slate-400">
                {stats.isUptrend
                  ? "Revenue showing positive upward trend"
                  : "Revenue showing downward trend - consider marketing boost"}
              </p>
            </div>

            <div className="flex gap-2">
              <span
                className={`flex-shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full ${
                  stats.activeDayRate >= 70 ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <p className="text-slate-400">
                {stats.activeDayRate >= 70
                  ? "Strong sales consistency across the month"
                  : `Only ${stats.activeDays} sales days - opportunities to improve daily frequency`}
              </p>
            </div>

            <div className="flex gap-2">
              <span
                className={`flex-shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full ${
                  data.maxDaily - data.avgDaily > data.avgDaily * 0.5
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              <p className="text-slate-400">
                {data.maxDaily - data.avgDaily > data.avgDaily * 0.5
                  ? "High variation in daily sales - potential for better inventory management"
                  : "Consistent daily sales patterns"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
