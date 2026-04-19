import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  compact?: boolean;
  wide?: boolean;
};

export function Modal({ open, title, description, onClose, children, compact, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center animate-fade-in-fast">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${wide ? "max-w-3xl" : "max-w-2xl"} rounded-2xl border border-white/[0.08] bg-dark-800 shadow-float animate-scale-in`}
      >
        {!compact && (
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100">{title}</h2>
              {description && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className={compact ? "p-6" : "p-6"}>{children}</div>
      </div>
    </div>
  );
}
