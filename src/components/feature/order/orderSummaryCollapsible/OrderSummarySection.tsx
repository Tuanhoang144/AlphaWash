"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Car, FileText, Plus, Minus, Tag, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderDetailDTO } from "@/types/order/OrderDetailDTO";

interface OrderSummarySectionProps {
  orderDetails?: OrderDetailDTO[] | null;
  totalPrice: number;
  subTotal: number;
  discountAmount: number;
  priceAfterDiscount: number;
  vatAmount: number;
}

export default function OrderSummarySection({
  orderDetails,
  totalPrice,
  subTotal,
  discountAmount,
  priceAfterDiscount,
  vatAmount,
}: OrderSummarySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalVehicles = useMemo(
    () => orderDetails?.length ?? 0,
    [orderDetails],
  );

  const totalComboLines = useMemo(
    () =>
      orderDetails?.filter((detail) =>
        detail.services.some(
          (s) => (s.orderType || "").toUpperCase() === "COMBO",
        ),
      ).length,
    [orderDetails],
  );

  const totalServices = useMemo(
    () =>
      orderDetails?.reduce(
        (sum, detail) =>
          sum +
          detail.services.filter(
            (s) => (s.orderType || "SERVICE").toUpperCase() === "SERVICE",
          ).length,
        0,
      ),
    [orderDetails],
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tóm Tắt Đơn Hàng
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {orderDetails == null ? (
              <div className="rounded-xl bg-red-100 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-red-600 mb-1">
                  <span className="text-sm font-medium">
                    Đơn hàng không tồn tại.
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Số xe</span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {totalVehicles}
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Dịch vụ</span>
                </div>
                <div className="text-xl font-bold text-green-700">
                  {totalServices}
                </div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Tags className="h-4 w-4" />
                  <span className="text-sm font-medium">Combo</span>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {totalComboLines}
                </div>
              </div>
            </div>

            <Separator />

            {orderDetails != null && (
              <div className="space-y-1">
                {orderDetails.map((detail, detailIndex) => (
                  <div key={detailIndex} className="mb-5">
                    <div className="font-semibold text-sm mb-2 text-gray-800">
                      Xe {detail?.vehicle.licensePlate || detailIndex + 1}
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                            >
                              Dịch vụ
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                            >
                              Giá (VNĐ)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {detail.services.map((service, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {service.name || "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                {service.adjustedPrice
                                  ? `${service.adjustedPrice.toLocaleString("vi-VN")} ₫`
                                  : "—"}
                              </td>
                            </tr>
                          ))}

                          {detail.services.length === 0 && (
                            <tr>
                              <td
                                colSpan={2}
                                className="py-8 text-center text-gray-500 text-sm"
                              >
                                Không có dịch vụ nào được ghi nhận
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {(subTotal > 0 && discountAmount > 0 && vatAmount > 0) ? (
                  <div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tạm tính</span>
                      <span className="font-medium text-gray-800">
                        {subTotal?.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  </div>
                ) : null}

                {(discountAmount && discountAmount > 0) ? (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Giảm giá</span>
                    <span className="font-medium text-red-600">
                      -
                      {discountAmount?.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                ) : null}

                {(discountAmount && discountAmount > 0 && priceAfterDiscount && priceAfterDiscount > 0) ? (
                  <div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Sau giảm giá
                      </span>
                      <span className="font-medium text-gray-800">
                        {priceAfterDiscount?.toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </span>
                    </div>
                  </div>
                ) : null}

                {(vatAmount && vatAmount > 0) ? (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Thuế VAT</span>
                    <span className="font-medium text-gray-800">
                      {vatAmount.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                ) : null}

                <div>
                  <Separator />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      Tổng thanh toán
                    </span>
                    <span className="font-bold text-green-600">
                      {totalPrice?.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
