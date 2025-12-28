"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Package } from "lucide-react"
import type { CustomerDTO, OrderResponseDTO } from "@/types/OrderResponse"
import QRCodeDisplay from "./qr-code-display-combo"
import { Input } from "antd"
import { calculateDiscountFromOrder, calculateVatFromOrder } from "@/shared/utils/order/calculatePrice"

interface PaymentFormContentComboProps {
  paymentType: string
  paymentStatus: string
  vat: number
  discount: number
  tip: number
  note: string | null
  totalPrice: number
  baseServicePrice: number
  onPaymentChange: (field: string, value: string | number) => void
  customer?: CustomerDTO | null
  licensePlate?: string | null
  order: OrderResponseDTO
}

const paymentConfig = {
  bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK",
  accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
  accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
}

const formatNumber = (value: number): string => {
  return value.toLocaleString("vi-VN")
}

const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\./g, "")
  return Number.parseInt(cleaned) || 0
}

const validateNumericInput = (value: string): boolean => {
  return /^[\d.]*$/.test(value)
}

const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (
    !/[\d.]/.test(e.key) &&
    !["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
  ) {
    e.preventDefault()
  }
}

export default function PaymentFormContentCombo({
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
  order,
}: PaymentFormContentComboProps) {
  const comboNames = order.orderDetails[0].service[0].serviceComboCatalog?.comboName || ""

  const paymentInfo = {
    amount: totalPrice,
    bankName: paymentConfig.bankName,
    accountNumber: paymentConfig.accountNumber,
    accountName: paymentConfig.accountName,
    transferInfo: `TT COMBO ${customer?.name || "Khach le"} - ${licensePlate || "Xe khong BS"} - ${comboNames}`,
  }

  const vatAmount = calculateVatFromOrder(order)
  const discountAmount = calculateDiscountFromOrder(order)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-orange-500" />
            <h4 className="font-semibold text-gray-800">Thông tin gói combo</h4>
          </div>
          {order.orderDetails
            .flatMap((d) => d.service)
            .filter((s) => s.serviceComboCatalog)
            .map((service, index) => (
              <div key={index} className="mb-2">
                <p className="font-medium text-gray-900">{service.serviceComboCatalog?.comboName}</p>
                <p className="text-xs text-gray-600">
                  Loại xe: {service.serviceComboCatalog?.size} | Bao gồm: {" "}
                  {service.serviceComboCatalog?.services.map((s) => `${s.serviceCatalogCode} (x${s.quantity})`).join(", ")}
                </p>
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phương thức thanh toán</Label>
            <Select value={paymentType} onValueChange={(value) => onPaymentChange("paymentType", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Transfer">Chuyển khoản</SelectItem>
                <SelectItem value="Cash">Tiền mặt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái thanh toán</Label>
            <Select value={paymentStatus} onValueChange={(value) => onPaymentChange("paymentStatus", value)}>
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
          <div className="space-y-2">
            <Label>VAT (%)</Label>
            <Input
              type="number"
              placeholder="10"
              value={vat}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 0
                if (value >= 0) {
                  onPaymentChange("vat", value)
                }
              }}
              onBlur={(e) => {
                const value = Number.parseInt(e.target.value) || 0
                if (value < 0) {
                  onPaymentChange("vat", 0)
                }
              }}
            />
            {vat < 0 && <p className="text-sm text-red-500">VAT không được âm</p>}
          </div>
          <div className="space-y-2">
            <Label>Giảm giá (%/VNĐ)</Label>
            <Input
              type="text"
              placeholder="5 hoặc 100.000"
              value={discount > 100 ? formatNumber(discount) : discount}
              onKeyDown={handleNumericInput}
              onChange={(e) => {
                const inputValue = e.target.value
                if (!validateNumericInput(inputValue)) {
                  return
                }
                if (inputValue.includes(".")) {
                  const value = parseFormattedNumber(inputValue)
                  if (value >= 0) {
                    onPaymentChange("discount", value)
                  }
                } else {
                  const value = Number.parseInt(inputValue) || 0
                  if (value >= 0) {
                    onPaymentChange("discount", value)
                  }
                }
              }}
              onBlur={(e) => {
                const inputValue = e.target.value
                if (inputValue.includes(".")) {
                  const value = parseFormattedNumber(inputValue)
                  if (value < 0) {
                    onPaymentChange("discount", 0)
                  }
                } else {
                  const value = Number.parseInt(inputValue) || 0
                  if (value < 0) {
                    onPaymentChange("discount", 0)
                  }
                }
              }}
            />
            {discount < 0 && <p className="text-sm text-red-500">Giảm giá không được âm</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tiền tip (VNĐ)</Label>
          <Input
            type="text"
            placeholder="50.000"
            value={formatNumber(tip)}
            onKeyDown={handleNumericInput}
            onChange={(e) => {
              const inputValue = e.target.value
              if (!validateNumericInput(inputValue)) {
                return
              }
              const value = parseFormattedNumber(inputValue)
              if (value >= 0) {
                onPaymentChange("tip", value)
              }
            }}
            onBlur={(e) => {
              const value = parseFormattedNumber(e.target.value)
              if (value < 0) {
                onPaymentChange("tip", 0)
              }
            }}
          />
          {tip < 0 && <p className="text-sm text-red-500">Tiền tip không được âm</p>}
        </div>

        <div className="border-t pt-4 space-y-3 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-500" />
            Chi tiết thanh toán combo
          </h4>
          <div className="flex justify-between text-sm">
            <span>Giá gói combo:</span>
            <span className="font-medium text-orange-600">{Math.round(baseServicePrice).toLocaleString("vi-VN")}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              {discount < 100 ? (
                <>
                  <span>Giảm giá ({discount}%):</span>
                  <span>{discountAmount.toLocaleString("vi-VN")}đ</span>
                </>
              ) : (
                <>
                  <span>Giảm giá:</span>
                  <span>{discountAmount.toLocaleString("vi-VN")}đ</span>
                </>
              )}
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>Tổng tiền sau giảm giá:</span>
              <span>{(Math.round(baseServicePrice) - discountAmount).toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          {vat > 0 && (
            <div className="flex justify-between text-sm">
              <span>VAT ({vat}%):</span>
              <span>{vatAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Tổng cộng:</span>
            <span className="text-orange-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ghi chú</Label>
          <Textarea
            placeholder="Ghi chú thêm về gói combo..."
            value={note || ""}
            onChange={(e) => onPaymentChange("note", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div>
        <QRCodeDisplay paymentInfo={paymentInfo} />
      </div>
    </div>
  )
}
