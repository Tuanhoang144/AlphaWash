"use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Car, Plus, Trash2 } from "lucide-react";
// import EmployeeSelector from "./employee-selector";
// import BrandModelSelector from "./brand-model-selector";
// import ServiceCatalogSelector from "./service-catalog-selector";
// import { Textarea } from "@/components/ui/textarea";
// import { CustomerDTO, OrderDetailDTO } from "@/types/OrderResponse";

// interface OrderDetailFormProps {
//   orderDetails: OrderDetailDTO[];
//   onOrderDetailsChange: (orderDetails: OrderDetailDTO[]) => void;
//   customer?: CustomerDTO;
// }

// export default function OrderDetailForm({
//   orderDetails,
//   onOrderDetailsChange,
//   customer,
// }: OrderDetailFormProps) {
//   const updateOrderDetail = (index: number, field: string, value: any) => {
//     const newOrderDetails = [...orderDetails];
//     if (field.includes(".")) {
//       const keys = field.split(".");
//       let current: any = newOrderDetails[index];
//       for (let i = 0; i < keys.length - 1; i++) {
//         current = current[keys[i]];
//       }
//       current[keys[keys.length - 1]] = value;
//     } else {
//       newOrderDetails[index] = { ...newOrderDetails[index], [field]: value };
//     }
//     onOrderDetailsChange(newOrderDetails);
//     console.log("Order Details:", newOrderDetails);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Car className="h-5 w-5" />
//           Chi Tiết Dịch Vụ
//         </CardTitle>
//         <CardDescription>
//           Thông tin xe, dịch vụ và nhân viên thực hiện
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {orderDetails.map((detail, index) => (
//           <div key={index} className="border rounded-lg p-4 space-y-4">
//             <BrandModelSelector
//               vehicle={detail.vehicle}
//               onVehicleChange={(vehicle) =>
//                 updateOrderDetail(index, "vehicle", vehicle)
//               }
//               customer={customer}
//             />

//             {/* Service Information */}
//             <ServiceCatalogSelector
//               service={detail.service}
//               serviceCatalog={detail.serviceCatalog}
//               vehicleSize={detail.vehicle.size}
//               onServiceChange={(service) =>
//                 updateOrderDetail(index, "service", service)
//               }
//               onServiceCatalogChange={(catalog) =>
//                 updateOrderDetail(index, "serviceCatalog", catalog)
//               }
//             />

//             {/* Employee Selection */}
//             <EmployeeSelector
//               selectedEmployees={detail.employees}
//               onEmployeesChange={(employees) =>
//                 updateOrderDetail(index, "employees", employees)
//               }
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Trạng thái</Label>
//                 <Select
//                   value={detail.status || ""}
//                   onValueChange={(value) =>
//                     updateOrderDetail(index, "status", value)
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Chọn trạng thái" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="PENDING">Chờ thi công</SelectItem>
//                     <SelectItem value="PROCESSING">
//                       Đang thi công
//                     </SelectItem>
//                     <SelectItem value="DONE">Thi công xong</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label>Ghi chú dịch vụ</Label>
//                 <Textarea
//                   placeholder="Ghi chú thêm..."
//                   value={detail.note || ""}
//                   onChange={(e) =>
//                     updateOrderDetail(index, "note", e.target.value)
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

import type { CustomerDTO, OrderDetailDTO } from "@/types/OrderResponse"
import VehicleInfoBlock from "./vehicle-info-block";
import OrderDetailBlock from "./order-detail-block";

interface MultiServiceOrderFormProps {
  customer?: CustomerDTO
  orderDetails: OrderDetailDTO[]
  onOrderDetailsChange: (orderDetails: OrderDetailDTO[]) => void
}

export default function MultiServiceOrderForm({
  customer,
  orderDetails,
  onOrderDetailsChange,
}: MultiServiceOrderFormProps) {
  const updateOrderDetail = (index: number, orderDetail: OrderDetailDTO) => {
    const newOrderDetails = [...orderDetails]
    newOrderDetails[index] = orderDetail
    onOrderDetailsChange(newOrderDetails)
  }

  const updateVehicle = (vehicle: any) => {
    const newOrderDetails = [...orderDetails]
    newOrderDetails[0] = {
      ...newOrderDetails[0],
      vehicle: vehicle,
    }
    onOrderDetailsChange(newOrderDetails)
  }

  // Get vehicle from first order detail
  const vehicle = orderDetails[0]?.vehicle || {
    id: "",
    licensePlate: "",
    brandId: 0,
    brandCode: "",
    brandName: "",
    modelId: 0,
    modelCode: "",
    modelName: "",
    size: "",
    imageUrl: "",
  }

  return (
    <div className="space-y-6">
      {/* Block 1: Vehicle Information */}
      <VehicleInfoBlock vehicle={vehicle} onVehicleChange={updateVehicle} customer={customer} />

      {/* Block 2: Service Information */}
      {orderDetails.map((orderDetail, index) => (
        <OrderDetailBlock
          key={index}
          orderDetail={orderDetail}
          onOrderDetailChange={(updatedOrderDetail) => updateOrderDetail(index, updatedOrderDetail)}
          vehicleSize={vehicle.size}
        />
      ))}
    </div>
  )
}
