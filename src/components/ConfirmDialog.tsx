import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title="" description="" onClose={onCancel} compact>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <AlertTriangle size={26} />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-slate-200">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{message}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn-secondary px-6" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger px-6" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
