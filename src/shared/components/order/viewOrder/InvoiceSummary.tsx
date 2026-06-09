"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, FileText, Plus, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderDetailDTO } from "@/types/OrderResponse";
import { getAppliedPrice } from "@/shared/utils/order/calculatePrice"; // ✅ dùng util chuẩn

interface InvoiceSummaryProps {
  statusPayment: string;
  orderDetails: OrderDetailDTO[];
  totalPrice: number;
  deleteFlag?: boolean;
}

export default function InvoiceSummary({
  orderDetails,
  totalPrice,
  deleteFlag,
}: InvoiceSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalServices = orderDetails.reduce((sum, d) => sum + d.service.length, 0);
  const totalEmployees = orderDetails.reduce((sum, d) => sum + d.employees.length, 0);

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
              {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {deleteFlag && (
              <div className="rounded-xl bg-red-100 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-red-600 mb-1">
                  <span className="text-sm font-medium">Đơn hàng đã bị hủy</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-blue-50 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-blue-600 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Dịch vụ</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{totalServices}</div>
              </div>

              <div className="rounded-xl bg-green-50 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-green-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Nhân viên</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{totalEmployees}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Chi tiết từng xe</h4>

              {orderDetails.map((detail, detailIndex) => {
                const vehicleSubtotal = detail.service.reduce(
                  (sum, s) => sum + getAppliedPrice(s, s.serviceCatalog),
                  0
                );

                return (
                  <div
                    key={detailIndex}
                    className="border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{detail.vehicle.licensePlate}</span>
                        <Badge variant="outline" className="text-xs">
                          {detail.vehicle.size}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {detail.service.length} dịch vụ
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {detail.service.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{service.serviceName}</p>
                            <p className="text-xs text-gray-500">
                              {(service.serviceCatalog?.size || "N/A")} • Dịch vụ #{idx + 1}
                              {(service.quantity || 1) > 1 && ` • SL: ${service.quantity}`}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-green-600">
                            {getAppliedPrice(service, service.serviceCatalog).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t pt-3 font-medium">
                      <span className="text-sm text-gray-700">Tổng xe này:</span>
                      <span className="text-base font-semibold text-green-600">
                        {vehicleSubtotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
