"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Plus, Trash2 } from "lucide-react";
import EmployeeSelector from "./employee-selector";
import type { OrderDetail, Customer } from "../types/invoice";
import BrandModelSelector from "./brand-model-selector";
import ServiceCatalogSelector from "./service-catalog-selector";
import { Textarea } from "@/components/ui/textarea";

interface OrderDetailFormProps {
  orderDetails: OrderDetail[];
  onOrderDetailsChange: (orderDetails: OrderDetail[]) => void;
  customer?: Customer;
}

export default function OrderDetailForm({
  orderDetails,
  onOrderDetailsChange,
  customer,
}: OrderDetailFormProps) {
  const updateOrderDetail = (index: number, field: string, value: any) => {
    const newOrderDetails = [...orderDetails];
    if (field.includes(".")) {
      const keys = field.split(".");
      let current: any = newOrderDetails[index];
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      newOrderDetails[index] = { ...newOrderDetails[index], [field]: value };
    }
    onOrderDetailsChange(newOrderDetails);
    console.log("Order Details:", newOrderDetails);
  };
  
  // const addOrderDetail = () => {
  //   const newOrderDetail: OrderDetail = {
  //     employees: [],
  //     vehicle: {
  //       id: "",
  //       licensePlate: "",
  //       brandId: 0,
  //       brandName: "",
  //       brandCode: "",
  //       modelId: 0,
  //       modelCode: "",
  //       modelName: "",
  //       size: "M",
  //       imageUrl: "",
  //     },
  //     service: {
  //       id: 0,
  //       code: "",
  //       serviceName: "",
  //       duration: "",
  //       note: "",
  //       serviceTypeCode: "",
  //     },
  //     serviceCatalog: {
  //       id: 0,
  //       code: "",
  //       price: 0,
  //       size: "M",
  //     },
  //     status: "Chờ xử lý",
  //     note: null,
  //   };
  //   onOrderDetailsChange([...orderDetails, newOrderDetail]);
  // };

  // const removeOrderDetail = (index: number) => {
  //   onOrderDetailsChange(orderDetails.filter((_, i) => i !== index));
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Chi Tiết Dịch Vụ
        </CardTitle>
        <CardDescription>
          Thông tin xe, dịch vụ và nhân viên thực hiện
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {orderDetails.map((detail, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            {/* <div className="flex justify-between items-center">
              <h4 className="font-semibold">Dịch vụ #{index + 1}</h4>
              {orderDetails.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeOrderDetail(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div> */}

            {/* Vehicle Information */}
            <BrandModelSelector
              vehicle={detail.vehicle}
              onVehicleChange={(vehicle) =>
                updateOrderDetail(index, "vehicle", vehicle)
              }
              customer={customer}
            />

            {/* Service Information */}
            <ServiceCatalogSelector
              service={detail.service}
              serviceCatalog={detail.serviceCatalog}
              vehicleSize={detail.vehicle.size}
              onServiceChange={(service) =>
                updateOrderDetail(index, "service", service)
              }
              onServiceCatalogChange={(catalog) =>
                updateOrderDetail(index, "serviceCatalog", catalog)
              }
            />

            {/* Employee Selection */}
            <EmployeeSelector
              selectedEmployees={detail.employees}
              onEmployeesChange={(employees) =>
                updateOrderDetail(index, "employees", employees)
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={detail.status || ""}
                  onValueChange={(value) =>
                    updateOrderDetail(index, "status", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ thi công</SelectItem>
                    <SelectItem value="PROCESSING">
                      Đang thi công
                    </SelectItem>
                    <SelectItem value="DONE">Thi công xong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú dịch vụ</Label>
                <Textarea
                  placeholder="Ghi chú thêm..."
                  value={detail.note || ""}
                  onChange={(e) =>
                    updateOrderDetail(index, "note", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {/* <Button type="button" variant="outline" onClick={addOrderDetail} className="w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Dịch Vụ
        </Button> */}
      </CardContent>
    </Card>
  );
}
