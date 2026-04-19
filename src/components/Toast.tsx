import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import type { Toast as ToastType } from "../types";
import { useInventory } from "../context/InventoryContext";

const icons: Record<ToastType["variant"], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors: Record<ToastType["variant"], string> = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-rose-500/30 bg-rose-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

const iconColors: Record<ToastType["variant"], string> = {
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
  info: "text-blue-400",
};

const barColors: Record<ToastType["variant"], string> = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);
  const duration = toast.duration ?? 4000;
  const Icon = icons[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (exiting) {
      const t = setTimeout(onDismiss, 280);
      return () => clearTimeout(t);
    }
  }, [exiting, onDismiss]);

  return (
    <div
      className={`${exiting ? "toast-exit" : "toast-enter"} relative flex w-80 items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-float backdrop-blur-xl ${colors[toast.variant]}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColors[toast.variant]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-200">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setExiting(true)}
        className="shrink-0 text-slate-500 transition hover:text-slate-300"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
        <div
          className={`h-full ${barColors[toast.variant]}`}
          style={{ animation: `progress-shrink ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useInventory();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}
