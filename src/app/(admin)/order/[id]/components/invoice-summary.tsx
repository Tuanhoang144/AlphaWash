"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, Users, Clock, FileText, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tool } from "@/utils/tool";
import { OrderDetailDTO } from "@/types/OrderResponse";

interface InvoiceSummaryProps {
  statusPayment: string; // Thêm prop mới để nhận trạng thái thanh toán
  orderDetails: OrderDetailDTO[];
  totalPrice: number;
  deleteFlag?: boolean;
}

export default function InvoiceSummary({
  orderDetails,
  totalPrice,
  deleteFlag,
  statusPayment,
}: InvoiceSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { getStatusPaymentColor, getStatusPaymentLabel } = tool();

  const totalServices = orderDetails.length;
  const totalEmployees = orderDetails.reduce(
    (sum, detail) => sum + detail.employees.length,
    0
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
          <CardContent className="space-y-6">
            {/* Quick Stats */}
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
                <div className="text-2xl font-bold text-blue-800">
                  {totalServices}
                </div>
              </div>

              <div className="rounded-xl bg-green-50 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-green-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Nhân viên</span>
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {totalEmployees}
                </div>
              </div>
            </div>

            <Separator />

            {/* Service Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">
                Chi tiết dịch vụ
              </h4>
              {orderDetails.map((detail, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm bg-white"
                >
                  {/* Header: Biển số + kích thước + trạng thái */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {detail.vehicle.licensePlate}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {detail.vehicle.size}
                      </Badge>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full border ${getStatusPaymentColor(
                        statusPayment
                      )}`}
                    >
                      {getStatusPaymentLabel(statusPayment)}
                    </div>
                  </div>

                  {/* Dịch vụ & thời gian */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="font-medium">
                      {detail.service.serviceName}
                    </div>
                    {/* <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {detail.service.duration}
                    </div> */}
                  </div>

                  {/* Nhân viên thực hiện */}
                  {detail.employees.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {detail.employees.map((employee) => (
                        <Badge
                          key={employee.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {employee.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Giá */}
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-medium text-gray-700">
                      Giá:
                    </span>
                    <span className="text-base font-semibold text-green-600">
                      {detail.service?.serviceCatalog?.price != null
                        ? detail.service.serviceCatalog.price.toLocaleString(
                            "vi-VN"
                          ) + "đ"
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền
            <Separator />
            <div className="bg-green-50 p-4 rounded-xl text-center shadow-sm">
              <div className="text-sm text-green-600 font-medium mb-1">
                Tổng tiền
              </div>
              <div className="text-2xl font-bold text-green-700">
                {totalPrice.toLocaleString("vi-VN")} VNĐ
              </div>
            </div> */}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
