"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, QrCode } from "lucide-react";
import { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";
import {
  calculateBaseServicePrice,
  calculateVatFromOrder,
  calculateDiscountFromOrder,
} from "@/shared/utils/order/calculatePrice"; // ✅ đường dẫn & hàm chuẩn

interface InformationPaymentProps {
  orderData: OrderResponseDTO;
  onNavigateToPayment: () => void;
  onNavigateToEdit: () => void;
}

export default function InformationPayment({
  orderData,
  onNavigateToPayment,
  onNavigateToEdit,
}: InformationPaymentProps) {
  const { getStatusPaymentColor, getStatusPaymentLabel } = tool();

  const basePrice = calculateBaseServicePrice(orderData);
  const vatAmount = calculateVatFromOrder(orderData);
  const discountAmount = calculateDiscountFromOrder(orderData);

  const paymentLabel =
    orderData.paymentType === "Cash"
      ? "Tiền mặt"
      : orderData.paymentType === "Transfer" || orderData.paymentType === "Bank"
      ? "Chuyển khoản"
      : orderData.paymentType || "—";

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Thông tin thanh toán
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Tạm tính dịch vụ:</span>
            <span>{basePrice.toLocaleString("vi-VN")}đ</span>
          </div>

          {orderData.discount > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Giảm giá {orderData.discount < 100 ? `(${orderData.discount}%)` : ""}:
                </span>
                <span className="text-sm font-medium text-red-600">
                  -{discountAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="border-t border-dashed pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tổng sau giảm giá:</span>
                  <span className="text-sm font-medium">
                    {(basePrice - discountAmount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </>
          )}

          {orderData.vat > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">VAT ({orderData.vat}%):</span>
              <span className="text-sm font-medium">{vatAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          {orderData.tip > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiền tip:</span>
              <span className="text-sm font-medium text-blue-600">
                +{orderData.tip.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusPaymentColor(
                orderData.paymentStatus
              )}`}
            >
              {getStatusPaymentLabel(orderData.paymentStatus)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Phương thức:</span>
            <span className="text-sm font-medium">{paymentLabel}</span>
          </div>
        </div>

        <div className="text-center border-t pt-4">
          <div className="text-sm text-gray-500">Tổng tiền hóa đơn</div>
          <div className="text-2xl font-bold text-green-600">
            {orderData.totalPrice.toLocaleString("vi-VN")} VNĐ
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            onClick={onNavigateToPayment}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={orderData.deleteFlag}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Thanh Toán & In Hóa Đơn
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent text-blue-600 hover:text-blue-700"
            onClick={onNavigateToEdit}
            disabled={orderData.deleteFlag}
          >
            Chỉnh Sửa Hóa Đơn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
