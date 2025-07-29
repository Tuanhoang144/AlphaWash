"use client";

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
import type { CustomerDTO } from "@/types/OrderResponse";
import QRCodeDisplay from "./qr-code-display";
import { Input } from "antd";

interface PaymentFormContentProps {
  paymentType: string;
  paymentStatus: string;
  vat: number;
  discount: number;
  tip: number;
  note: string | null;
  totalPrice: number;
  baseServicePrice: number;
  onPaymentChange: (field: string, value: string | number) => void;
  customer?: CustomerDTO | null;
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
  tip,
  note,
  totalPrice,
  baseServicePrice,
  onPaymentChange,
  customer,
  licensePlate,
}: PaymentFormContentProps) {
  const vatAmount = Math.round((baseServicePrice * vat) / 100);
  const discountAmount = Math.round((baseServicePrice * discount) / 100);

  const paymentInfo = {
    amount: totalPrice,
    bankName: paymentConfig.bankName,
    accountNumber: paymentConfig.accountNumber,
    accountName: paymentConfig.accountName,
    transferInfo: `TT HD ${customer?.name || "Khach le"} - ${
      licensePlate || "Xe khong BS"
    }`,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Payment Details */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phương thức thanh toán</Label>
            <Select
              value={paymentType}
              onValueChange={(value) => onPaymentChange("paymentType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Tiền mặt</SelectItem>
                <SelectItem value="Transfer">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái thanh toán</Label>
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
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* <div className="space-y-2">
            <Label>VAT (%)</Label>
            <Input
              type="number"
              placeholder="10"
              value={vat}
              onChange={(e) => onPaymentChange("vat", Number.parseInt(e.target.value) || 0)}
            />
          </div> */}
          <div className="space-y-2">
            <Label>Giảm giá (%)</Label>
            <Input
              type="number"
              placeholder="5"
              value={discount}
              min={0}
              max={100}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 0;
                if (value >= 0 && value <= 100) {
                  onPaymentChange("discount", value);
                }
              }}
              onBlur={(e) => {
                const value = Number.parseInt(e.target.value) || 0;
                if (value > 100) {
                  onPaymentChange("discount", 100);
                } else if (value < 0) {
                  onPaymentChange("discount", 0);
                }
              }}
            />
            {discount > 100 && (
              <p className="text-sm text-red-500">
                Giảm giá không được vượt quá 100%
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tiền tip (VNĐ)</Label>
          <Input
            type="number"
            placeholder="50000"
            value={tip}
            min={0}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value) || 0;
              // Chỉ cho phép số dương hoặc 0
              if (value >= 0) {
                onPaymentChange("tip", value);
              }
            }}
            onBlur={(e) => {
              // Double check khi blur
              const value = Number.parseInt(e.target.value) || 0;
              if (value < 0) {
                onPaymentChange("tip", 0);
              }
            }}
          />
          {tip < 0 && (
            <p className="text-sm text-red-500">Tiền tip không được âm</p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800">Chi tiết thanh toán</h4>
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
      <div>
        <QRCodeDisplay paymentInfo={paymentInfo} />
      </div>
    </div>
  );
}
