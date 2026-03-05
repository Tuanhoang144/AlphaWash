"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerDTO } from "@/types/customer/CustomerDTO";
import { OrderDetailDTO } from "@/types/order/OrderDetailDTO";
import { Car, Plus, Trash2 } from "lucide-react";
import VehicleInfoSection from "./vehicleInfoCollapsible/VehicleInfoBlock";
import { useHandleOrderDetail } from "@/hooks/createOrder/useHandleOrderDetail";
import OrderServiceSection from "./serviceCollapsible/OrderServiceSection";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo } from "react";
import EmployeeSection from "./infoOrderCollapsible/EmployeeSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  customerSelected?: CustomerDTO | null;
  orderDetails?: OrderDetailDTO[] | null;
  handleOrderDetailChange?: (details: OrderDetailDTO[]) => void;
}

export default function OrderDetailSection({
  customerSelected,
  orderDetails,
  handleOrderDetailChange,
}: Props) {
  const {
    addOrderDetail,
    removeOrderDetail,
    updateOrderDetail,
    listEmployees,
    open,
    setOpen,
    onHandleEmployeeChange,
    selectedEmployees,
  } = useHandleOrderDetail(orderDetails || [], handleOrderDetailChange);

  const selectedIds = useMemo(
    () => new Set(selectedEmployees.map((e) => e.id)),
    [selectedEmployees]
  );

  return (
    <>
      {orderDetails?.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
          Chưa có xe nào trong đơn hàng. Nhấn "Thêm xe" để bắt đầu.
        </div>
      ) : (
        orderDetails?.map((detail, index) => (
          <Card key={index} className="border border-gray-200 relative">
            <CardHeader className="">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {detail.vehicle?.licensePlate
                    ? `Chi tiết hóa đơn xe ${detail.vehicle.licensePlate}`
                    : `Chi tiết hóa đơn xe ${index + 1}`}
                </CardTitle>
                {orderDetails.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeOrderDetail(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <VehicleInfoSection
                key={index}
                value={detail.vehicle}
                customer={customerSelected || undefined}
                onChange={(value) => {
                  const updatedDetails = [...(orderDetails || [])];
                  updatedDetails[index] = {
                    ...updatedDetails[index],
                    vehicle: value,
                  };
                  updateOrderDetail(index, updatedDetails[index]);
                }}
              />

              <OrderServiceSection
                vehicle={detail.vehicle}
                orderServices={detail.services}
                handleOrderServicesChange={(services) => {
                  const updatedDetails = [...(orderDetails || [])];
                  updatedDetails[index] = {
                    ...updatedDetails[index],
                    services: services,
                  };
                  updateOrderDetail(index, updatedDetails[index]);
                }}
              />

              <div className="space-y-2">
                <EmployeeSection
                  selectedEmployees={detail.employees}
                  onEmployeesChange={(employees) => {
                    onHandleEmployeeChange(index, employees);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái thi công</Label>
                  <Select
                    defaultValue={detail.statusProcess || "PENDING"} // cho phép undefined
                    onValueChange={(value) => {
                      // Chỉ gọi khi khác với giá trị hiện tại
                      if (value !== (detail.statusProcess ?? "")) {
                        const updatedDetails = [...(orderDetails || [])];
                        updatedDetails[index] = {
                          ...updatedDetails[index],
                          statusProcess: value,
                        };
                        updateOrderDetail(index, updatedDetails[index]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chờ thi công</SelectItem>
                      <SelectItem value="PROCESSING">Đang thi công</SelectItem>
                      <SelectItem value="DONE">Thi công xong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    placeholder="Ghi chú thêm..."
                    value={detail.noteDetail || ""}
                    onChange={(event) => {
                      const updatedDetails = [...(orderDetails || [])];
                      updatedDetails[index] = {
                        ...updatedDetails[index],
                        noteDetail: event.target.value,
                      };
                      updateOrderDetail(index, updatedDetails[index]);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <Button
        type="button"
        size="sm"
        className="bg-black hover:bg-white hover:border-2 hover:text-black w-full text-white"
        onClick={() =>
          addOrderDetail({
            code: "",
            employees: [],
            services: [
              {
                orderType: "SERVICE",
                name: "",
                serviceCatalog: undefined,
                serviceComboCatalog: undefined,
                adjustedPriceReason: "",
                adjustedPrice: 0,
                note: "",
              },
            ],
            noteDetail: "",
            vehicle: {
              id: "",
              licensePlate: "",
              brandId: 0,
              brandCode: "",
              brandName: "",
              modelId: 0,
              modelCode: "",
              modelName: "",
              imageUrl: "",
              size: "",
            },
            statusProcess: "PENDING",
          })
        }
      >
        <Plus className="h-4 w-4 mr-1" />
        Thêm xe mới
      </Button>
    </>
  );
}
