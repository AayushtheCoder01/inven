import type { Adjustment, Product } from "../types";

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportProductsCsv(products: Product[]) {
  const headers = [
    "Name", "SKU", "Category", "Brand", "Model", "Supplier",
    "Rack Location", "Unit", "Selling Price", "Unit Cost",
    "Min Stock", "Current Qty", "Inventory Value", "Status", "Notes",
    "Created", "Last Updated",
  ];

  const rows = products.map((p) => [
    p.name, p.sku, p.category, p.brand, p.model, p.supplier,
    p.rackLocation, p.unit, p.price.toFixed(2), p.cost.toFixed(2),
    p.minStock, p.currentQty, (p.currentQty * p.cost).toFixed(2),
    p.status, p.notes, p.createdAt, p.updatedAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `inventory-report-${date}.csv`);
}

export function exportAdjustmentsCsv(adjustments: Adjustment[]) {
  const headers = [
    "Product", "SKU", "Type", "Quantity", "Previous Qty", "New Qty",
    "Unit Price", "Unit Cost", "Revenue", "Reason", "Date",
  ];

  const rows = adjustments.map((a) => [
    a.productName, a.sku, a.type, a.quantity, a.previousQty, a.newQty,
    a.unitPrice.toFixed(2), a.unitCost.toFixed(2),
    a.type === "subtract" ? (a.quantity * a.unitPrice).toFixed(2) : "0.00",
    a.reason, a.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `adjustments-report-${date}.csv`);
}

export function exportSalesReport(adjustments: Adjustment[]) {
  const sales = adjustments.filter((a) => a.type === "subtract");
  const headers = [
    "Product", "SKU", "Qty Sold", "Unit Price", "Unit Cost",
    "Revenue", "Profit", "Reason", "Sold At",
  ];

  const rows = sales.map((a) => [
    a.productName, a.sku, a.quantity,
    a.unitPrice.toFixed(2), a.unitCost.toFixed(2),
    (a.quantity * a.unitPrice).toFixed(2),
    (a.quantity * (a.unitPrice - a.unitCost)).toFixed(2),
    a.reason, a.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `sales-report-${date}.csv`);
}
