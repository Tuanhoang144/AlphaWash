"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Car, Plus, Minus, User, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { tool } from "@/utils/tool"
import type { OrderDetailDTO } from "@/types/OrderResponse"

interface OrderDetailDisplayProps {
  orderDetails: OrderDetailDTO[]
}

export default function OrderDetailDisplay({ orderDetails }: OrderDetailDisplayProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { getStatusVehicleColor, getStatusVehicleLabel } = tool()

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
              {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {orderDetails.length > 0 ? (
              orderDetails.map((detail, detailIndex) => (
                <div
                  key={detailIndex}
                  className="border rounded-xl p-6 space-y-6 bg-gradient-to-r from-white to-gray-50"
                >
                  {/* Vehicle Information Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-600" />
                        Xe #{detailIndex + 1}
                      </h3>
                      <span
                        className={`text-sm font-medium border px-3 py-1.5 rounded-full ${getStatusVehicleColor(
                          detail.status,
                        )}`}
                      >
                        {getStatusVehicleLabel(detail.status)}
                      </span>
                    </div>

                    {/* License Plate Highlight */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-center mb-3">
                        <div className="bg-white px-6 py-3 rounded-lg border-2 border-blue-200 shadow-sm">
                          <span className="text-xl font-bold text-blue-800">{detail.vehicle.licensePlate}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <span className="block text-gray-500 text-xs font-medium mb-1">Hãng xe</span>
                          <span className="text-sm font-semibold text-gray-800">{detail.vehicle.brandName}</span>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <span className="block text-gray-500 text-xs font-medium mb-1">Mẫu xe</span>
                          <span className="text-sm font-semibold text-gray-800">{detail.vehicle.modelName}</span>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <span className="block text-gray-500 text-xs font-medium mb-1">Kích thước</span>
                          <span className="text-sm font-semibold text-gray-800">{detail.vehicle.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Multiple Services Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-800">
                        Dịch vụ đã chọn ({detail.service.length} dịch vụ)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail.service.map((service, serviceIndex) => (
                        <div
                          key={serviceIndex}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                Dịch vụ #{serviceIndex + 1}
                              </Badge>
                              <span className="text-lg font-bold text-green-700">
                                {service.serviceCatalog?.price != null
                                  ? service.serviceCatalog.price.toLocaleString("vi-VN") + "đ"
                                  : "N/A"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-green-600 font-medium mb-1">Tên dịch vụ</p>
                              <p className="text-base font-semibold text-gray-800">{service.serviceName}</p>
                            </div>
                            {service.serviceCatalog?.size && (
                              <div>
                                <p className="text-sm text-green-600 font-medium mb-1">Loại xe</p>
                                <Badge variant="outline" className="bg-white text-gray-700">
                                  {service.serviceCatalog.size}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Service Total */}
                    <div className="bg-green-100 p-4 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Tổng tiền dịch vụ cho xe này:</span>
                        <span className="text-xl font-bold text-green-800">
                          {detail.service
                            .reduce((sum, service) => sum + (service.serviceCatalog?.price || 0), 0)
                            .toLocaleString("vi-VN")}
                          đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Employees and Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nhân Viên Thực Hiện */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nhân viên thực hiện
                      </p>
                      {detail.employees && detail.employees.length > 0 ? (
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

                    {/* Ghi chú */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ghi chú</p>
                      <div className="p-3 bg-gray-50 text-gray-700 rounded-md text-sm min-h-[60px]">
                        {detail.note || "Không có ghi chú"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">Không có chi tiết dịch vụ nào cho hóa đơn này.</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
