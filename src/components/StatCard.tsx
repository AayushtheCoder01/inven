import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

type StatCardProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description?: string;
  icon: LucideIcon;
  tone?: "emerald" | "blue" | "amber" | "rose" | "purple";
  decimals?: number;
};

const toneConfig: Record<string, { iconBg: string; iconText: string; glow: string }> = {
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]",
  },
  blue: {
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]",
  },
  rose: {
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.08)]",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
  },
};

export function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  description,
  icon: Icon,
  tone = "emerald",
  decimals = 0,
}: StatCardProps) {
  const { iconBg, iconText, glow } = toneConfig[tone];

  return (
    <div className={`stat-card ${glow}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2">
            <AnimatedCounter
              to={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="font-display text-3xl font-bold text-slate-100"
            />
          </div>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconText} />
        </div>
      </div>
      {description && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{description}</p>
      )}
    </div>
  );
}
