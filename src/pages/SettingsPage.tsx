import { Database, Download, RefreshCw } from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { exportProductsCsv } from "../lib/csv";

export function SettingsPage() {
  const { products, adjustments, profits, showToast, refreshAll } = useInventory();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage data and exports</p>
      </div>

      {/* Database stats */}
      <div className="glass-panel p-5 animate-fade-in">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4">
          <Database size={16} className="text-emerald-400" /> Supabase Database
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-dark-750/50 p-3 text-center">
            <p className="text-xl font-bold text-slate-200">{products.length}</p>
            <p className="text-[10px] uppercase text-slate-500">Products</p>
          </div>
          <div className="rounded-xl bg-dark-750/50 p-3 text-center">
            <p className="text-xl font-bold text-slate-200">{adjustments.length}</p>
            <p className="text-[10px] uppercase text-slate-500">Adjustments</p>
          </div>
          <div className="rounded-xl bg-dark-750/50 p-3 text-center">
            <p className="text-xl font-bold text-slate-200">{profits.length}</p>
            <p className="text-[10px] uppercase text-slate-500">Profit Records</p>
          </div>
        </div>
        <button
          className="btn-secondary w-full mt-4"
          onClick={async () => {
            await refreshAll();
            showToast("success", "Refreshed", "All data reloaded from Supabase.");
          }}
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {/* Export */}
      <div className="glass-panel p-5 animate-fade-in">
        <p className="text-sm font-semibold text-slate-300 mb-3">Export</p>
        <button
          className="btn-secondary w-full"
          onClick={() => {
            exportProductsCsv(products);
            showToast("success", "CSV exported");
          }}
        >
          <Download size={16} /> Download Inventory CSV
        </button>
      </div>
    </div>
  );
}
