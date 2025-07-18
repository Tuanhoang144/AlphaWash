"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard } from "lucide-react";
import QRCodeDisplay from "./qr-code-display";
import type { Customer } from "../types/invoice";

interface PaymentFormContentProps {
  paymentType: string;
  paymentStatus: string;
  vat: number;
  discount: number;
  tip: number; // Vẫn nhận tip để hiển thị
  note: string | null;
  totalPrice: number; // totalPrice đã không bao gồm tip
  baseServicePrice: number; // Prop mới: tổng tiền dịch vụ trước thuế và giảm giá
  onPaymentChange: (field: string, value: string | number) => void;
  customer?: Customer | null;
  licensePlate?: string | null;
}

const paymentConfig = {
  bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK",
  accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
  accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
};

export default function PaymentFormContent({
  paymentType,
  paymentStatus,
  vat,
  discount,
  tip, // Vẫn nhận tip
  note,
  totalPrice, // totalPrice đã không bao gồm tip
  baseServicePrice, // Sử dụng prop mới
  onPaymentChange,
  customer,
  licensePlate,
}: PaymentFormContentProps) {
  // Tính toán VAT và Discount dựa trên baseServicePrice và làm tròn
  const vatAmount = Math.round((baseServicePrice * vat) / 100);
  const discountAmount = Math.round((baseServicePrice * discount) / 100);

  const paymentInfo = {
    amount: totalPrice, // QR code vẫn hiển thị tổng tiền hóa đơn (không bao gồm tip)
    bankName: paymentConfig.bankName,
    accountNumber: paymentConfig.accountNumber,
    accountName: paymentConfig.accountName,
    transferInfo: `TT HD ${customer?.customerName || "Khach le"} - ${
      licensePlate || "Xe khong BS"
    }`,
  };

  return (
    <div className="flex justify-center gap-6 mt-4">
      {/* Left: Payment Details */}
      <div className="space-y-3 w-full max-w-md">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Chi tiết thanh toán
        </h3>
        <div className="space-y-2">
          <Label>Phương thức</Label>
          <Select
            value={paymentType}
            onValueChange={(value) => onPaymentChange("paymentType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Tiền mặt</SelectItem>
              <SelectItem value="Transfer">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={paymentStatus}
            onValueChange={(value) => onPaymentChange("paymentStatus", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
              <SelectItem value="DONE">Đã thanh toán</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>VAT (%)</Label>
            <Input
              type="number"
              placeholder="10"
              value={vat}
              onChange={(e) =>
                onPaymentChange("vat", Number.parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Giảm giá (%)</Label>
            <Input
              type="number"
              placeholder="5"
              value={discount}
              onChange={(e) =>
                onPaymentChange(
                  "discount",
                  Number.parseInt(e.target.value) || 0
                )
              }
            />
          </div>
        </div>

        {/* Tiền tip vẫn là một trường nhập liệu riêng biệt */}
        <div className="space-y-2">
          <Label>Tiền tip (VNĐ)</Label>
          <Input
            type="number"
            placeholder="50000"
            value={tip}
            onChange={(e) =>
              onPaymentChange("tip", Number.parseInt(e.target.value) || 0)
            }
          />
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tổng dịch vụ:</span>
            <span>{Math.round(baseServicePrice).toLocaleString("vi-VN")}đ</span>
          </div>
          {vat > 0 && (
            <div className="flex justify-between text-sm">
              <span>VAT ({vat}%):</span>
              <span>+{vatAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Giảm giá ({discount}%):</span>
              <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          {/* Dòng tiền tip đã được loại bỏ khỏi phần tổng cộng */}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Tổng cộng:</span>
            <span className="text-green-600">
              {totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ghi chú</Label>
          <Textarea
            placeholder="Ghi chú thêm..."
            value={note || ""}
            onChange={(e) => onPaymentChange("note", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Right: QR Code Display */}
      <div className="w-full max-w-md">
        <QRCodeDisplay paymentInfo={paymentInfo} />
      </div>
    </div>
  );
}
