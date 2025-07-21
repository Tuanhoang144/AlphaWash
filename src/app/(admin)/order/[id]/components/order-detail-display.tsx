"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Car, Plus, Minus, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tool } from "@/utils/tool";
import { OrderDetailDTO } from "@/types/OrderResponse";

interface OrderDetailDisplayProps {
  orderDetails: OrderDetailDTO[];
}

export default function OrderDetailDisplay({
  orderDetails,
}: OrderDetailDisplayProps) {
  const [isOpen, setIsOpen] = useState(true);

  const { getStatusVehicleColor, getStatusVehicleLabel } = tool();
  
  console.log("Order Detail Display Rendered", orderDetails);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Chi Tiết Dịch Vụ
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
            {orderDetails.length > 0 ? (
              orderDetails.map((detail, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  {/* Vehicle Information */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Thông Tin Xe
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2 flex flex-row items-center gap-2">
                        <span className="font-medium">Biển số:</span>
                        <p className="p-2 bg-gray-100 w-fit rounded-md">
                          {" "}
                          {detail.vehicle.licensePlate}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl shadow-sm">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <span className="block text-gray-500 text-sm font-medium mb-1">
                            Hãng
                          </span>
                          <span className="text-base font-semibold text-gray-800">
                            {detail.vehicle.brandName}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <span className="block text-gray-500 text-sm font-medium mb-1">
                            Mẫu
                          </span>
                          <span className="text-base font-semibold text-gray-800">
                            {detail.vehicle.modelName}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <span className="block text-gray-500 text-sm font-medium mb-1">
                            Kích thước
                          </span>
                          <span className="text-base font-semibold text-gray-800">
                            {detail.vehicle.size}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Thông tin dịch vụ
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">
                          Tên dịch vụ
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {detail.service.serviceName}
                        </p>
                      </div>

                      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Giá</p>
                        <p className="text-sm font-medium text-gray-800">
                          {detail.service.serviceCatalog?.price != null
                            ? detail.service.serviceCatalog.price.toLocaleString(
                                "vi-VN"
                              ) + "đ"
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nhân Viên Thực Hiện */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Nhân viên thực hiện
                      </p>
                      {detail.employees && detail.employees.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {detail.employees.map((employee) => (
                            <Badge
                              key={employee.id}
                              variant="outline"
                              className="flex items-center gap-1 text-sm"
                            >
                              <User className="h-4 w-4" /> {employee.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-100 text-gray-500 rounded-md text-sm">
                          Chưa có nhân viên được chỉ định.
                        </div>
                      )}
                    </div>

                    {/* Trạng Thái Xe */}
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Trạng thái xe
                      </p>
                      <span
                        className={`inline-block text-sm font-medium border px-3 py-1.5 rounded-full transition ${getStatusVehicleColor(
                          detail.status
                        )}`}
                      >
                        {getStatusVehicleLabel(detail.status)}
                      </span>
                    </div>

                    {/* Ghi chú chi tiết đơn hàng */}
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Ghi chú đơn hàng
                      </p>
                      <div className="p-3 bg-gray-50 text-gray-700 rounded-md text-sm">
                        {detail.note || "Không có"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  Không có chi tiết dịch vụ nào cho hóa đơn này.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
