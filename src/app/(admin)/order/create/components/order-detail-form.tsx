"use client";

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
