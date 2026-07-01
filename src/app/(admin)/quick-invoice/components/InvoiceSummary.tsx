"use client";

import { QuickServiceItem } from "@/types/QuickInvoice";

interface InvoiceSummaryProps {
  selectedServices: QuickServiceItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  discount: number;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function InvoiceSummary({
  selectedServices,
  subtotal,
  discountAmount,
  total,
  discount,
}: InvoiceSummaryProps) {
  if (selectedServices.length === 0) return null;

  return (
    <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-input">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {selectedServices.length} dịch vụ
        </span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Giảm giá ({discount}%)</span>
          <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
        </div>
      )}
      <div className="flex items-center justify-between font-bold text-lg pt-1 border-t border-input">
        <span>Tổng</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
