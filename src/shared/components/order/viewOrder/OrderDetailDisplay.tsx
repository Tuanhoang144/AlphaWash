"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Car, Plus, Minus, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { tool } from "@/utils/tool";
import type { OrderDetailDTO } from "@/types/OrderResponse";
import { getAppliedPrice } from "@/shared/utils/order/calculatePrice"; // ✅

interface OrderDetailDisplayProps {
  orderDetails: OrderDetailDTO[];
}

export default function OrderDetailDisplay({
  orderDetails,
}: OrderDetailDisplayProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { getStatusVehicleColor, getStatusVehicleLabel } = tool();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Chi Tiết Dịch Vụ ({orderDetails.length} xe)
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
              orderDetails.map((detail, detailIndex) => {
                const vehicleSubtotal = detail.service.reduce(
                  (sum, s) => sum + getAppliedPrice(s, s.serviceCatalog),
                  0
                );

                return (
                  <div
                    key={detailIndex}
                    className="border rounded-xl p-6 space-y-6 bg-gradient-to-r from-white to-gray-50"
                  >
                    {/* Header xe */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Car className="h-5 w-5 text-blue-600" />
                          Xe #{detailIndex + 1}
                        </h3>
                        <span
                          className={`text-sm font-medium border px-3 py-1.5 rounded-full ${getStatusVehicleColor(
                            detail.status
                          )}`}
                        >
                          {getStatusVehicleLabel(detail.status)}
                        </span>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-white px-6 py-3 rounded-lg border-2 border-blue-200 shadow-sm">
                            <span className="text-xl font-bold text-blue-800">
                              {detail.vehicle.licensePlate}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="block text-gray-500 text-xs font-medium mb-1">
                              Hãng xe
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {detail.vehicle.brandName}
                            </span>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="block text-gray-500 text-xs font-medium mb-1">
                              Mẫu xe
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {detail.vehicle.modelName}
                            </span>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="block text-gray-500 text-xs font-medium mb-1">
                              Kích thước
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {detail.vehicle.size}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Dịch vụ */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-green-600" />
                        <h4 className="text-lg font-semibold text-gray-800">
                          Dịch vụ đã chọn ({detail.service.length} dịch vụ)
                        </h4>
                      </div>

                      <div className="flex flex-col divide-y divide-gray-200 border border-gray-100 rounded-lg bg-white">
                        {detail.service.map((service, index) => {
                          const listed =
                            service.serviceCatalog?.listedPrice ?? 0;
                          const qty = service.quantity >= 1 ? service.quantity : 1;
                          const applied = getAppliedPrice(
                            service,
                            service.serviceCatalog
                          );
                          const unitApplied = service.adjustedPriceFlag && service.adjustedPriceReason
                            ? service.adjustedPrice ?? 0
                            : listed;
                          const diff = unitApplied - listed;
                          const isAdjusted =
                            !!service.adjustedPriceFlag &&
                            !!service.adjustedPriceReason?.trim() &&
                            unitApplied !== listed;

                          return (
                            <div
                              key={index}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 px-4 py-3 transition ${
                                isAdjusted
                                  ? "bg-amber-50 border-l-4 border-amber-400"
                                  : "bg-green-50 border-l-4 border-green-400"
                              }`}
                            >
                              {/* Cột trái - thông tin dịch vụ */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className={
                                      isAdjusted
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-green-100 text-green-700"
                                    }
                                  >
                                    Dịch vụ #{index + 1}
                                  </Badge>
                                  {isAdjusted && (
                                    <Badge className="bg-amber-500 text-white border-amber-600">
                                      Giá điều chỉnh
                                    </Badge>
                                  )}
                                </div>

                                <p
                                  className={`mt-1 font-semibold ${
                                    isAdjusted
                                      ? "text-amber-800"
                                      : "text-gray-800"
                                  } truncate`}
                                >
                                  {service.serviceName}
                                </p>

                                <p className="text-xs text-gray-500">
                                  Loại xe:{" "}
                                  <span className="font-medium text-gray-700">
                                    {service.serviceCatalog?.size || "—"}
                                  </span>
                                  {qty > 1 && (
                                    <>
                                      {" "}• SL:{" "}
                                      <span className="font-medium text-gray-700">
                                        {qty}
                                      </span>
                                    </>
                                  )}
                                </p>

                                {isAdjusted && (
                                  <p className="text-xs text-amber-700 mt-1">
                                    Lý do:{" "}
                                    <span className="italic">
                                      {service.adjustedPriceReason}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {/* Cột phải - giá */}
                              <div className="text-right min-w-[120px]">
                                {isAdjusted && (
                                  <div className="text-xs text-gray-500 line-through">
                                    Niêm yết: {listed.toLocaleString("vi-VN")}đ
                                  </div>
                                )}
                                <div
                                  className={`font-bold ${
                                    isAdjusted
                                      ? "text-amber-700"
                                      : "text-green-700"
                                  } text-lg`}
                                >
                                  {applied.toLocaleString("vi-VN")}đ
                                </div>
                                {isAdjusted && (
                                  <div
                                    className={`text-xs font-medium ${
                                      diff > 0
                                        ? "text-amber-700"
                                        : "text-emerald-700"
                                    }`}
                                  >
                                    {diff > 0 ? "+" : ""}
                                    {diff.toLocaleString("vi-VN")}đ so với niêm
                                    yết
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Nhân viên + ghi chú */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Nhân viên thực hiện
                        </p>
                        {detail.employees?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {detail.employees.map((employee) => (
                              <Badge
                                key={employee.id}
                                variant="outline"
                                className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <User className="h-3 w-3" /> {employee.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-100 text-gray-500 rounded-md text-sm">
                            Chưa có nhân viên được chỉ định.
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Ghi chú
                        </p>
                        <div className="p-3 bg-gray-50 text-gray-700 rounded-md text-sm min-h-[60px]">
                          {detail.note || "Không có ghi chú"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
