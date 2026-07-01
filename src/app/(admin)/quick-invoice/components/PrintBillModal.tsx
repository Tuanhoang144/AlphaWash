"use client";

import React, { useState } from "react";
import { Printer, X, Plus, Loader2 } from "lucide-react";
import { PrintBillData } from "../hooks/useQuickInvoice";
import { handleInvoicePrint } from "@/app/(admin)/order/[id]/payment/utils/handle-invoice-print";
import type { OrderResponseDTO } from "@/types/OrderResponse";

interface Props {
  data: PrintBillData;
  onClose: () => void;
  onNewInvoice: () => void;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

function formatDatetime(date: Date): string {
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildOrderDTO(data: PrintBillData): OrderResponseDTO {
  const dateStr = data.date.toISOString().slice(0, 19);
  const timeStr = data.date.toTimeString().slice(0, 8);

  return {
    id: "",
    code: data.orderCode,
    date: dateStr,
    checkIn: timeStr,
    checkOut: "",
    tip: 0,
    paymentType: data.paymentMethod === "Unpaid" ? "" : data.paymentMethod,
    paymentStatus: data.paymentStatus,
    vat: 0,
    deleteFlag: false,
    discount: data.discountPercent,
    totalPrice: data.total,
    note: null,
    customer: data.customer
      ? { id: "", name: data.customer.name, phone: data.customer.phone }
      : undefined,
    orderDetails: [
      {
        code: "",
        employees: [],
        vehicle: {
          id: "",
          licensePlate: data.vehicle?.licensePlate ?? "",
          brandId: 0,
          brandCode: "",
          brandName: data.vehicle?.brandName ?? "",
          modelId: 0,
          modelCode: "",
          modelName: data.vehicle?.modelName ?? "",
          size: data.vehicle?.size ?? "",
          imageUrl: "",
        },
        service: data.services.map((s, i) => ({
          id: i,
          serviceCode: "",
          serviceName: s.name,
          serviceTypeCode: "",
          serviceCatalog: {
            id: 0,
            code: "",
            listedPrice: s.price,
            size: data.vehicle?.size ?? "",
          },
          adjustedPriceReason: "",
          adjustedPrice: s.price,
          adjustedPriceFlag: false,
          quantity: s.quantity,
        })),
        status: "PENDING",
        note: null,
      },
    ],
  };
}

export default function PrintBillModal({ data, onClose, onNewInvoice }: Props) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const order = buildOrderDTO(data);

      const bankName = process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK";
      const accountNumber = process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830";
      const accountName = process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE";
      const serviceNames = data.services.map((s) => s.name).join(", ");
      const qrUrl = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.jpg?amount=${Math.floor(data.total)}&addInfo=${encodeURIComponent((data.vehicle?.licensePlate ?? "") + " - " + serviceNames)}&accountName=${encodeURIComponent(accountName)}`;

      await handleInvoicePrint({ order, baseServicePrice: data.subtotal, qrUrl });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Hoá đơn</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Scrollable preview */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-6 space-y-4 text-sm">
          {/* Shop header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed">
            <div className="text-lg font-bold tracking-wide uppercase">Shine Autowerkz</div>
            <div className="text-xs text-muted-foreground">297G Đ.Liên Phường, P.Phú Hữu, TP.Thủ Đức</div>
            <div className="text-xs text-muted-foreground">SĐT: 0966291909</div>
            <div className="text-xs text-muted-foreground mt-1">{formatDatetime(data.date)}</div>
          </div>

          {/* Order code */}
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">HÓA ĐƠN DỊCH VỤ</div>
            <span className="font-mono font-bold text-primary text-base tracking-wider">
              #{data.orderCode}
            </span>
          </div>

          {/* Customer + Vehicle */}
          <div className="space-y-3 pb-3 border-b border-dashed">
            {data.customer && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Khách hàng</div>
                <div className="font-medium">{data.customer.name}</div>
                <div className="text-muted-foreground text-xs">{data.customer.phone}</div>
              </div>
            )}
            {data.vehicle && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Xe</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold font-mono">{data.vehicle.licensePlate}</span>
                  <span className="text-muted-foreground text-xs">
                    {data.vehicle.brandName} {data.vehicle.modelName}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Kích cỡ: {data.vehicle.size}</div>
              </div>
            )}
          </div>

          {/* Services */}
          <div className="space-y-2 pb-3 border-b border-dashed">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Dịch vụ</div>
            {data.services.map((s, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="flex-1 leading-snug">
                  <span>{s.name}</span>
                  {s.quantity > 1 && (
                    <span className="text-xs text-muted-foreground ml-1">×{s.quantity}</span>
                  )}
                </div>
                <span className="font-medium tabular-nums shrink-0">
                  {formatCurrency(s.price * s.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span className="tabular-nums">{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discountPercent > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Giảm giá ({data.discountPercent}%)</span>
                <span className="tabular-nums text-rose-500">-{formatCurrency(data.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>TỔNG THANH TOÁN</span>
              <span className="tabular-nums text-primary">{formatCurrency(data.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-1.5 pt-3 border-t border-dashed">
            {data.paymentMethod && data.paymentMethod !== "Unpaid" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thanh toán</span>
                <span>{data.paymentMethod}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className={data.paymentStatus === "Đã thanh toán" ? "text-emerald-600 font-medium" : "text-amber-500 font-medium"}>
                {data.paymentStatus}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-dashed">
            Cảm ơn quý khách! Hẹn gặp lại 🚗
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t bg-background px-4 py-3 flex gap-3 safe-area-bottom">
        <button
          onClick={handlePrint}
          disabled={printing}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60"
        >
          {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          {printing ? "Đang chuẩn bị..." : "In bill"}
        </button>
        <button
          onClick={onNewInvoice}
          className="h-12 px-5 rounded-xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </button>
      </div>
    </div>
  );
}
