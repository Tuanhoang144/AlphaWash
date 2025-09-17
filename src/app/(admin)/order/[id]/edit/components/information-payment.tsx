"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, QrCode, Save, X } from "lucide-react";
import { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";
import { 
  calculateBaseServicePrice, 
  calculateVatFromOrder, 
  calculateDiscountFromOrder 
} from "../../../utils/calculateTotal";

interface InformationPaymentProps {
  orderData: OrderResponseDTO;
  currentTotalPrice: number;
  onSave: () => void;
  onCancel: () => void;
  onPayment: () => void;
}

export default function InformationPayment({
  orderData,
  currentTotalPrice,
  onSave,
  onCancel,
  onPayment,
}: InformationPaymentProps) {
  const { getStatusPaymentColor, getStatusPaymentLabel } = tool();

  // Calculate base price (used multiple times)
  const basePrice = calculateBaseServicePrice(orderData);

  // Tính toán VAT
  const vatAmount = calculateVatFromOrder(orderData);

  // Tính toán số tiền giảm giá
  const discountAmount = calculateDiscountFromOrder(orderData);

  const isOrderDeleted = orderData.deleteFlag || false;
  const isPaid = orderData.paymentStatus === 'PAID';

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Thông tin thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thông tin thanh toán */}
        <div className="space-y-3">
          {/* Service Base Price */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Tạm tính dịch vụ:</span>
            <span>{basePrice.toLocaleString("vi-VN")}đ</span>
          </div>

          {/* Discount Information */}
          {orderData.discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Giảm giá{" "}
                {orderData.discount < 100 ? `(${orderData.discount}%)` : ""}:
              </span>
              <span className="text-sm font-medium text-red-600">
                -{discountAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {/* Total after discount with separator line */}
          {orderData.discount > 0 && (
            <div className="border-t border-dashed pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng tiền sau giảm giá:</span>
                <span className="text-sm font-medium">
                  {(basePrice - discountAmount).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          )}

          {/* VAT Information */}
          {orderData.vat > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                VAT ({orderData.vat}%):
              </span>
              <span className="text-sm font-medium">
                {vatAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {/* Tip Information */}
          {orderData.tip > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiền tip:</span>
              <span className="text-sm font-medium text-blue-600">
                +{orderData.tip.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {/* Warning if order is deleted */}
          {isOrderDeleted && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <span className="text-sm text-red-600 font-medium">
                Hóa đơn này đã bị hủy
              </span>
            </div>
          )}
        </div>

        {/* Payment Status and Method - Moved outside calculation section */}
        <div className="space-y-3 border-t pt-4">
          {/* Payment Status */}
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

          {/* Payment Method */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Phương thức:</span>
            <span className="text-sm font-medium">
              {orderData.paymentType === "Cash"
                ? "Tiền mặt"
                : orderData.paymentType === "Bank"
                ? "Chuyển khoản"
                : orderData.paymentType || "Chưa chọn"}
            </span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="text-center border-t pt-4">
          <div className="text-sm text-gray-500">Tổng tiền hóa đơn</div>
          <div className="text-2xl font-bold text-green-600">
            {currentTotalPrice.toLocaleString("vi-VN")} VNĐ
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-2 border-t">
          {/* Save Changes Button */}
          <Button
            onClick={onSave}
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isOrderDeleted}
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu Thay Đổi
          </Button>

          {/* Cancel Order Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={onCancel}
            disabled={isOrderDeleted}
          >
            <X className="h-4 w-4 mr-2" />
            Hủy Hóa Đơn
          </Button>

          {/* Payment Button - Only show if not paid and has amount */}
          {currentTotalPrice > 0 && !isPaid && !isOrderDeleted && (
            <Button
              onClick={onPayment}
              type="button"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Thanh Toán & In Hóa Đơn
            </Button>
          )}

          {/* Paid Status Display */}
          {isPaid && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-md text-center">
              <span className="text-sm text-green-700 font-medium">
                Hóa đơn đã được thanh toán
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}